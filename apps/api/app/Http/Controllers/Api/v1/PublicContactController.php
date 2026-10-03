<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Models\User;
use App\Notifications\ContactInquiryReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PublicContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => ['nullable', 'string', 'max:100'],
            'lastName' => ['nullable', 'string', 'max:100'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:3', 'max:5000'],
        ]);

        $firstName = trim((string) ($validated['first_name'] ?? $validated['firstName'] ?? ''));
        $lastName = trim((string) ($validated['last_name'] ?? $validated['lastName'] ?? ''));

        if ($firstName === '' && $lastName === '') {
            return response()->json([
                'success' => false,
                'message' => 'Please provide your name.',
            ], 422);
        }

        $company = trim((string) ($validated['company_name'] ?? $validated['company'] ?? ''));

        $inquiry = ContactInquiry::create([
            'first_name' => $firstName ?: 'Guest',
            'last_name' => $lastName ?: 'Inquirer',
            'email' => strtolower(trim($validated['email'])),
            'company_name' => $company ?: null,
            'message' => trim($validated['message']),
            'status' => 'new',
            'ip_address' => $request->ip(),
        ]);

        // Broadcast and store in-app notification for all platform super admins
        try {
            $admins = User::query()
                ->whereHas('platformRoleAssignments', function ($query) {
                    $query->whereIn('role', [
                        'platform_super_admin',
                        'platform_security_admin',
                        'platform_support',
                    ]);
                })
                ->orWhere('status', 'active')
                ->get()
                ->filter(function ($user) {
                    return $user->isPlatformSuperAdmin() || $user->platformRoleAssignments()->exists();
                });

            // If no specific platform roles assigned, notify the first active owner/admin user
            if ($admins->isEmpty()) {
                $admins = User::query()->where('status', 'active')->limit(3)->get();
            }

            foreach ($admins as $admin) {
                $admin->notify(new ContactInquiryReceived($inquiry));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch in-app contact inquiry notification: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for reaching out. Your message has been received by our platform team.',
            'data' => [
                'id' => (string) $inquiry->id,
                'created_at' => $inquiry->created_at->toIso8601String(),
            ],
        ], 201);
    }
}
