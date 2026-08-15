<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SSOController extends Controller
{
    /**
     * Redirect to the respective identity provider.
     */
    public function redirectToProvider($provider)
    {
        if (! in_array($provider, ['google', 'microsoft'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported provider.',
            ], 400);
        }

        if ($provider === 'google') {
            $query = http_build_query([
                'client_id' => config('services.google.client_id'),
                'redirect_uri' => config('services.google.redirect'),
                'response_type' => 'code',
                'scope' => 'openid profile email',
                'state' => 'google-state-token',
            ]);

            return response()->json([
                'success' => true,
                'redirect_url' => 'https://accounts.google.com/o/oauth2/v2/auth?'.$query,
            ]);
        }

        // Microsoft
        $query = http_build_query([
            'client_id' => config('services.microsoft.client_id'),
            'redirect_uri' => config('services.microsoft.redirect'),
            'response_type' => 'code',
            'scope' => 'openid profile email User.Read',
            'state' => 'microsoft-state-token',
        ]);

        return response()->json([
            'success' => true,
            'redirect_url' => 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?'.$query,
        ]);
    }

    /**
     * Handle provider authentication callback.
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        if (! in_array($provider, ['google', 'microsoft'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported provider.',
            ], 400);
        }

        $code = $request->input('code');

        if (! $code) {
            return response()->json([
                'success' => false,
                'message' => 'Authorization code is missing.',
            ], 400);
        }

        try {
            if ($provider === 'google') {
                // Exchange code for token
                $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'redirect_uri' => config('services.google.redirect'),
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                ]);

                if ($tokenResponse->failed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to exchange authorization code.',
                    ], 400);
                }

                $accessToken = $tokenResponse->json()['access_token'];

                // Fetch user profile
                $userResponse = Http::withToken($accessToken)
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');

                if ($userResponse->failed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to retrieve user profile.',
                    ], 400);
                }

                $profile = $userResponse->json();
                $email = $profile['email'] ?? null;
                $name = $profile['name'] ?? 'Google User';
                $providerId = $profile['sub'] ?? null;
            } else {
                // Microsoft Exchange
                $tokenResponse = Http::asForm()->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
                    'client_id' => config('services.microsoft.client_id'),
                    'client_secret' => config('services.microsoft.client_secret'),
                    'redirect_uri' => config('services.microsoft.redirect'),
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                ]);

                if ($tokenResponse->failed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to exchange authorization code.',
                    ], 400);
                }

                $accessToken = $tokenResponse->json()['access_token'];

                // Fetch user profile
                $userResponse = Http::withToken($accessToken)
                    ->get('https://graph.microsoft.com/v1.0/me');

                if ($userResponse->failed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to retrieve user profile.',
                    ], 400);
                }

                $profile = $userResponse->json();
                $email = $profile['mail'] ?? $profile['userPrincipalName'] ?? null;
                $name = $profile['displayName'] ?? 'Microsoft User';
                $providerId = $profile['id'] ?? null;
            }

            if (! $email || ! $providerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'SSO provider did not return valid email or ID.',
                ], 400);
            }

            // Create or Link user
            $user = User::where('email', $email)->first();

            if ($user) {
                // Link account if not already linked
                if (! $user->sso_provider) {
                    $user->sso_provider = $provider;
                    $user->sso_provider_id = $providerId;
                    $user->save();
                } elseif ($user->sso_provider !== $provider || $user->sso_provider_id !== $providerId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This email is already associated with another login provider.',
                    ], 409);
                }
            } else {
                // Create a new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make(Str::random(24)),
                    'sso_provider' => $provider,
                    'sso_provider_id' => $providerId,
                ]);
            }

            // Log user in and issue Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'sso_provider' => $user->sso_provider,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during authentication.',
            ], 500);
        }
    }
}
