<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OTPController extends Controller
{
    /**
     * Request a new OTP.
     */
    public function requestOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = $validated['email'];

        // Check if user exists
        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'We could not find a user with that email address.',
            ], 404);
        }

        // Resend throttling: 1 minute
        $recentOtp = Otp::where('email', $email)
            ->where('created_at', '>', now()->subMinute())
            ->first();

        if ($recentOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait before requesting another OTP.',
            ], 429);
        }

        // Generate 6-digit code
        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Create Otp entry
        Otp::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10), // 10 minutes validity
            'attempts' => 0,
        ]);

        // Send through verification channel (Email/Log)
        try {
            Mail::to($email)->send(new OtpMail($code));
        } catch (\Exception $e) {
            // Fallback to Log if mailer is not configured or fails
            Log::info("OTP for {$email}: {$code}");
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully.',
        ]);
    }

    /**
     * Verify the requested OTP.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = $validated['email'];
        $code = $validated['code'];

        // Retrieve latest unverified OTP
        $otp = Otp::where('email', $email)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (! $otp) {
            return response()->json([
                'success' => false,
                'message' => 'No active OTP request found.',
            ], 400);
        }

        // Check if expired
        if ($otp->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired.',
            ], 400);
        }

        // Brute force protection: Max 5 attempts
        if ($otp->attempts >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new OTP.',
            ], 429);
        }

        // Check if code matches
        if ($otp->code !== $code) {
            $otp->increment('attempts');

            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code.',
            ], 400);
        }

        // Mark OTP as verified
        $otp->update([
            'verified_at' => now(),
        ]);

        // Find user and log them in
        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User account not found.',
            ], 404);
        }

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
