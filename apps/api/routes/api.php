<?php

use App\Http\Controllers\Api\v1\ApprovalController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\ChallengeController;
use App\Http\Controllers\Api\v1\CompanyController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\DepartmentController;
use App\Http\Controllers\Api\v1\DocumentController;
use App\Http\Controllers\Api\v1\EmployeeController;
use App\Http\Controllers\Api\v1\IdentityController;
use App\Http\Controllers\Api\v1\InvitationController;
use App\Http\Controllers\Api\v1\LeaveController;
use App\Http\Controllers\Api\v1\NotificationController;
use App\Http\Controllers\Api\v1\OnboardingController;
use App\Http\Controllers\Api\v1\OrganizationController;
use App\Http\Controllers\Api\v1\PlatformController;
use App\Http\Controllers\Api\v1\ProfileController;
use App\Http\Controllers\Api\v1\RegistrationController;
use App\Http\Controllers\Api\v1\ReportController;
use App\Http\Controllers\Api\v1\RoleController;
use App\Http\Controllers\Api\v1\SecurityAdminController;
use App\Http\Controllers\Api\v1\SecurityController;
use App\Http\Controllers\Api\v1\ServiceAccountController;
use App\Http\Controllers\Api\v1\SSOController;
use App\Http\Controllers\Api\v1\TimesheetController;
use App\Http\Controllers\Api\v1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [RegistrationController::class, 'start'])->middleware('throttle:registration');
        Route::post('/registrations/{id}/resend', [RegistrationController::class, 'resend'])->middleware('throttle:registration-resend');
        Route::post('/registrations/{id}/verify', [RegistrationController::class, 'verify'])->middleware('throttle:mfa-verify');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('/password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');
        Route::post('/password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');
        Route::get('/sso/redirect/{provider}', [SSOController::class, 'redirectToProvider'])->middleware('throttle:sso');
        Route::post('/sso/callback/{provider}', [SSOController::class, 'handleProviderCallback'])->middleware('throttle:sso');
        Route::post('/challenges/{id}/method', [ChallengeController::class, 'select'])->middleware('throttle:mfa-verify');
        Route::post('/challenges/{id}/resend', [ChallengeController::class, 'resend'])->middleware('throttle:mfa-verify');
        Route::post('/challenges/{id}/verify', [ChallengeController::class, 'verify'])->middleware('throttle:mfa-verify');
        Route::get('/invitations/{token}', [InvitationController::class, 'show'])->middleware('throttle:invitation-acceptance');
        Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])->middleware('throttle:invitation-acceptance');
        Route::post('/otp/request', [\App\Http\Controllers\Api\v1\OTPController::class, 'requestOtp'])->middleware('throttle:login');
        Route::post('/otp/verify', [\App\Http\Controllers\Api\v1\OTPController::class, 'verifyOtp'])->middleware('throttle:mfa-verify');
        Route::post('/service-token', [ServiceAccountController::class, 'token'])->middleware('throttle:service-token');
    });
    Route::prefix('internal')->middleware(\App\Http\Middleware\ApiKeyMiddleware::class)->group(function () {
        Route::get('/ping', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'service' => 'workforce-erp-api',
                    'authenticated_via' => 'X-API-TOKEN',
                ],
            ]);
        });
    });

    if (app()->environment('local', 'testing')) {
        Route::prefix('test-contract')->group(function () {
            Route::get('/paginate', function (\Illuminate\Http\Request $request) {
                $items = collect(range(1, 12))->map(fn ($i) => [
                    'id' => $i,
                    'name' => "Item {$i}",
                    'description' => "Description {$i}",
                    'created_at' => now()->toISOString(),
                    'updated_at' => now()->toISOString(),
                ]);
                $page = (int) $request->input('page', 1);
                $perPage = (int) $request->input('per_page', 5);
                $slice = $items->slice(($page - 1) * $perPage, $perPage)->values();

                return response()->json([
                    'success' => true,
                    'message' => 'Items retrieved successfully',
                    'data' => $slice,
                    'meta' => [
                        'current_page' => $page,
                        'from' => ($page - 1) * $perPage + 1,
                        'last_page' => (int) ceil(12 / $perPage),
                        'path' => url('/api/v1/test-contract/paginate'),
                        'per_page' => $perPage,
                        'to' => min($page * $perPage, 12),
                        'total' => 12,
                    ],
                    'links' => [
                        'first' => url('/api/v1/test-contract/paginate?page=1'),
                        'last' => url('/api/v1/test-contract/paginate?page='.ceil(12 / $perPage)),
                        'prev' => $page > 1 ? url('/api/v1/test-contract/paginate?page='.($page - 1)) : null,
                        'next' => $page < ceil(12 / $perPage) ? url('/api/v1/test-contract/paginate?page='.($page + 1)) : null,
                    ],
                ]);
            });

            Route::get('/success', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Item retrieved successfully',
                    'data' => [
                        'id' => 2,
                        'name' => 'Item 2',
                        'description' => 'Description 2',
                        'created_at' => now()->toISOString(),
                        'updated_at' => now()->toISOString(),
                    ],
                ]);
            });

            Route::post('/validate', function (\Illuminate\Http\Request $request) {
                $request->validate([
                    'name' => ['required', 'string'],
                ]);

                return response()->json(['success' => true]);
            });

            Route::get('/not-found', function () {
                abort(404, 'Resource not found.');
            });
        });

        Route::prefix('test-errors')->group(function () {
            Route::get('/401', fn () => abort(401, 'Unauthenticated.'));
            Route::get('/403', fn () => abort(403, 'This action is unauthorized.'));
            Route::get('/409', fn () => abort(409, 'Conflict occurred.'));
            Route::get('/500', function () {
                abort(500, 'An unexpected error occurred.');
            });
        });
    }

    Route::prefix('service')->middleware(['service.account', 'throttle:service'])->group(function () {
        Route::get('/context', [ServiceAccountController::class, 'context']);
        Route::delete('/token/current', [ServiceAccountController::class, 'revoke']);
        Route::get('/ping', [ServiceAccountController::class, 'context'])->middleware(['service.permission:organization.view', 'service.scope:ORGANIZATION,GLOBAL']);
    });

    Route::middleware(['auth:sanctum', 'workforce.active', 'secure.session', 'workforce.scope'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/auth/context', [SecurityController::class, 'context']);
        Route::get('/auth/sessions', [AuthController::class, 'sessions']);
        Route::delete('/auth/sessions/{sessionId}', [AuthController::class, 'revokeSession']);
        Route::post('/auth/sessions/revoke-others', [AuthController::class, 'revokeAllOthers']);
        Route::post('/auth/password/change', [AuthController::class, 'changePassword'])->middleware('throttle:password-change');
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('/auth/step-up', [SecurityController::class, 'beginStepUp'])->middleware('throttle:mfa-verify');
        Route::get('/auth/authenticator', [SecurityController::class, 'authenticators']);
        Route::post('/auth/authenticator', [SecurityController::class, 'beginAuthenticator']);
        Route::post('/auth/authenticator/{factorId}/confirm', [SecurityController::class, 'confirmAuthenticator']);
        Route::delete('/auth/authenticator/{factorId}', [SecurityController::class, 'removeAuthenticator']);
        Route::post('/auth/email/change', [IdentityController::class, 'requestEmail'])->middleware('throttle:email-change');
        Route::post('/auth/email/change/{id}/confirm', [IdentityController::class, 'confirmEmail'])->middleware('throttle:email-change');
        Route::post('/auth/phone/change', [IdentityController::class, 'requestPhone'])->middleware('throttle:phone-change');
        Route::post('/auth/phone/change/{id}/confirm', [IdentityController::class, 'confirmPhone'])->middleware('throttle:phone-change');
        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::middleware(['controlled.impersonation', 'tenant.required'])->group(function () {
            Route::get('/organizations/current', [OrganizationController::class, 'current']);
            Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
            Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);

            Route::middleware('subscription.module:hr')->group(function () {
                Route::apiResource('companies', CompanyController::class);
                Route::apiResource('departments', DepartmentController::class);
                Route::prefix('employees')->group(function () {
                    Route::get('/options', [EmployeeController::class, 'options']);
                    Route::get('/summary', [EmployeeController::class, 'summary']);
                    Route::get('', [EmployeeController::class, 'index']);
                    Route::post('', [EmployeeController::class, 'store']);
                    Route::get('/{employee}', [EmployeeController::class, 'show']);
                    Route::put('/{employee}', [EmployeeController::class, 'update']);
                    Route::delete('/{employee}', [EmployeeController::class, 'destroy']);
                });
            });
            Route::middleware('subscription.module:leave')->prefix('leave-requests')->group(function () {
                Route::get('/options', [LeaveController::class, 'options']);
                Route::get('', [LeaveController::class, 'index']);
                Route::post('', [LeaveController::class, 'store']);
                Route::get('/{leaveRequest}', [LeaveController::class, 'show']);
                Route::patch('/{leaveRequest}/cancel', [LeaveController::class, 'cancel']);
                Route::patch('/{leaveRequest}/approve', [LeaveController::class, 'approve']);
                Route::patch('/{leaveRequest}/reject', [LeaveController::class, 'reject']);
            });
            Route::middleware('subscription.module:attendance')->prefix('timesheets')->group(function () {
                Route::get('/today', [TimesheetController::class, 'today']);
                Route::post('/clock-in', [TimesheetController::class, 'clockIn']);
                Route::post('/clock-out', [TimesheetController::class, 'clockOut']);
                Route::get('', [TimesheetController::class, 'index']);
                Route::post('', [TimesheetController::class, 'store']);
                Route::get('/{timesheet}', [TimesheetController::class, 'show']);
                Route::put('/{timesheet}', [TimesheetController::class, 'update']);
                Route::delete('/{timesheet}', [TimesheetController::class, 'destroy']);
            });
            Route::prefix('approvals')->group(function () {
                Route::get('', [ApprovalController::class, 'index']);
                Route::get('/{approval}', [ApprovalController::class, 'show']);
                Route::patch('/{approval}/approve', [ApprovalController::class, 'approve']);
                Route::patch('/{approval}/reject', [ApprovalController::class, 'reject']);
            });
            Route::middleware('subscription.module:documents')->prefix('documents')->group(function () {
                Route::get('', [DocumentController::class, 'index']);
                Route::post('', [DocumentController::class, 'store']);
                Route::get('/{document}', [DocumentController::class, 'show']);
                Route::get('/{document}/download', [DocumentController::class, 'download']);
                Route::delete('/{document}', [DocumentController::class, 'destroy']);
            });
            Route::prefix('notifications')->group(function () {
                Route::get('', [NotificationController::class, 'index']);
                Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
                Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
                Route::patch('/{notification}/read', [NotificationController::class, 'markRead']);
            });
            Route::middleware('subscription.module:reports')->prefix('reports')->group(function () {
                Route::get('/overview', [ReportController::class, 'overview']);
                Route::get('/employees', [ReportController::class, 'employees']);
                Route::get('/departments', [ReportController::class, 'departments']);
                Route::get('/leave', [ReportController::class, 'leave']);
                Route::get('/timesheets', [ReportController::class, 'timesheets']);
            });
            Route::get('/dashboard', [DashboardController::class, 'index']);
            Route::middleware('subscription.module:users')->group(function () {
                Route::apiResource('roles', RoleController::class)->except(['show']);
                Route::prefix('users')->group(function () {
                    Route::get('/options/organizations', [UserController::class, 'organizations']);
                    Route::get('/options/roles', [UserController::class, 'roles']);
                    Route::get('/options/employees', [UserController::class, 'employees']);
                    Route::get('', [UserController::class, 'index']);
                    Route::post('', [UserController::class, 'store']);
                    Route::get('/{user}', [UserController::class, 'show']);
                    Route::put('/{user}', [UserController::class, 'update']);
                    Route::patch('/{user}/activate', [UserController::class, 'activate']);
                    Route::patch('/{user}/deactivate', [UserController::class, 'deactivate']);
                    Route::patch('/{user}/suspend', [UserController::class, 'suspend']);
                    Route::post('/{user}/resend-invitation', [UserController::class, 'resendInvitation']);
                    Route::delete('/{user}', [UserController::class, 'destroy']);
                });
            });
            Route::get('/onboarding', [OnboardingController::class, 'show']);
            Route::put('/onboarding/{step}', [OnboardingController::class, 'save']);
            Route::middleware('subscription.module:security')->group(function () {
                Route::post('/security/domains', [SecurityAdminController::class, 'createDomain']);
                Route::post('/security/domains/{id}/verify', [SecurityAdminController::class, 'verifyDomain']);
                Route::post('/security/service-accounts', [SecurityAdminController::class, 'createServiceAccount'])->middleware('throttle:service-token');
                Route::post('/security/service-accounts/{id}/rotate', [SecurityAdminController::class, 'rotateServiceAccount'])->middleware('throttle:service-token');
                Route::post('/security/service-accounts/{id}/revoke', [SecurityAdminController::class, 'revokeServiceAccount'])->middleware('throttle:service-token');
                Route::get('/access-requests', [SecurityAdminController::class, 'accessRequests']);
                Route::post('/access-requests', [SecurityAdminController::class, 'requestAccess'])->middleware('throttle:access-request');
                Route::post('/access-requests/{id}/approve', [SecurityAdminController::class, 'approveAccess'])->middleware('throttle:access-request');
                Route::post('/access-requests/{id}/reject', [SecurityAdminController::class, 'rejectAccess'])->middleware('throttle:access-request');
                Route::get('/security/sod/users/{userId}/conflicts', [SecurityAdminController::class, 'sodConflicts']);
                Route::post('/security/sod/overrides', [SecurityAdminController::class, 'createSodOverride']);
                Route::delete('/security/sod/overrides/{id}', [SecurityAdminController::class, 'revokeSodOverride']);
            });
        });

        Route::prefix('platform')->middleware('platform.role:platform_super_admin,platform_security_admin,platform_support,platform_auditor')->group(function () {
            Route::get('/context', [PlatformController::class, 'context']);
            Route::get('/users', [PlatformController::class, 'users']);
            Route::get('/organizations', [PlatformController::class, 'organizations']);
            Route::get('/security/audit', [PlatformController::class, 'audit']);
            Route::post('/impersonations', [PlatformController::class, 'startImpersonation']);
            Route::post('/impersonations/{id}/end', [PlatformController::class, 'endImpersonation']);
            Route::post('/security/break-glass', [PlatformController::class, 'startBreakGlass']);
            Route::post('/security/break-glass/{id}/end', [PlatformController::class, 'endBreakGlass']);
            Route::post('/security/break-glass/{id}/review', [PlatformController::class, 'reviewBreakGlass']);
        });
    });
});
