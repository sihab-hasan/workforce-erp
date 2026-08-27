<?php

use App\Http\Controllers\Api\v1\ApprovalController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CompanyController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\DepartmentController;
use App\Http\Controllers\Api\v1\DocumentController;
use App\Http\Controllers\Api\v1\EmployeeController;
use App\Http\Controllers\Api\v1\LeaveController;
use App\Http\Controllers\Api\v1\NotificationController;
use App\Http\Controllers\Api\v1\OrganizationController;
use App\Http\Controllers\Api\v1\OTPController;
use App\Http\Controllers\Api\v1\ProfileController;
use App\Http\Controllers\Api\v1\ReportController;
use App\Http\Controllers\Api\v1\RoleController;
use App\Http\Controllers\Api\v1\SSOController;
use App\Http\Controllers\Api\v1\TimesheetController;
use App\Http\Controllers\Api\v1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware(['api.key', 'throttle:service'])->get('/internal/ping', function () {
        return response()->json(['success' => true, 'data' => ['service' => 'workforce-erp-api', 'authenticated_via' => config('api.shared_token_header', 'X-API-TOKEN')]]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('/password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
        Route::post('/password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');
        Route::post('/otp/request', [OTPController::class, 'requestOtp'])->middleware('throttle:otp-request');
        Route::post('/otp/verify', [OTPController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
        Route::get('/sso/redirect/{provider}', [SSOController::class, 'redirectToProvider'])->middleware('throttle:sso');
        Route::post('/sso/callback/{provider}', [SSOController::class, 'handleProviderCallback'])->middleware('throttle:sso');
    });

    Route::middleware(['auth:sanctum', 'workforce.active', 'workforce.scope'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/auth/sessions', [AuthController::class, 'sessions']);
        Route::delete('/auth/sessions/{sessionId}', [AuthController::class, 'revokeSession'])->where('sessionId', '[A-Za-z0-9_-]+');
        Route::post('/auth/password/change', [AuthController::class, 'changePassword'])->middleware('throttle:password-change');
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);

        Route::get('/organizations', [OrganizationController::class, 'index']);
        Route::get('/organizations/current', [OrganizationController::class, 'current']);
        Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
        Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

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

        Route::prefix('leave-requests')->group(function () {
            Route::get('/options', [LeaveController::class, 'options']);
            Route::get('', [LeaveController::class, 'index']);
            Route::post('', [LeaveController::class, 'store']);
            Route::get('/{leaveRequest}', [LeaveController::class, 'show']);
            Route::patch('/{leaveRequest}/cancel', [LeaveController::class, 'cancel']);
            Route::patch('/{leaveRequest}/approve', [LeaveController::class, 'approve']);
            Route::patch('/{leaveRequest}/reject', [LeaveController::class, 'reject']);
        });

        Route::prefix('timesheets')->group(function () {
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

        Route::prefix('documents')->group(function () {
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

        Route::prefix('reports')->group(function () {
            Route::get('/overview', [ReportController::class, 'overview']);
            Route::get('/employees', [ReportController::class, 'employees']);
            Route::get('/departments', [ReportController::class, 'departments']);
            Route::get('/leave', [ReportController::class, 'leave']);
            Route::get('/timesheets', [ReportController::class, 'timesheets']);
        });

        Route::get('/dashboard', [DashboardController::class, 'index']);
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
});

if (app()->environment('testing', 'local')) {
    Route::prefix('v1')->group(function () {
        Route::get('/test-errors/{type}', function ($type) {
            switch ($type) {
                case '401': throw new \Illuminate\Auth\AuthenticationException;
                case '403': throw new \Illuminate\Auth\Access\AuthorizationException;
                case '409': throw new \Symfony\Component\HttpKernel\Exception\ConflictHttpException('Conflict occurred.');
                case '500': throw new \Exception('Fatal database crash.');
            }

            return response()->json(['message' => 'Ok']);
        });
        Route::get('/test-contract/success', fn () => response()->json(['success' => true, 'message' => 'Item retrieved successfully', 'data' => ['id' => 2, 'name' => 'Item 2', 'description' => 'Description for item 2', 'created_at' => now()->toIso8601String(), 'updated_at' => now()->toIso8601String()]]));
        Route::get('/test-contract/paginate', function (Request $request) {
            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('per_page', 5);
            $total = 12;
            $items = [];
            for ($i = ($page - 1) * $perPage + 1; $i <= min($page * $perPage, $total); $i++) {
                $items[] = ['id' => $i, 'name' => 'Item '.$i, 'description' => 'Description for item '.$i, 'created_at' => now()->toIso8601String(), 'updated_at' => now()->toIso8601String()];
            }
            $paginator = new \Illuminate\Pagination\LengthAwarePaginator($items, $total, $perPage, $page, ['path' => $request->url()]);

            return response()->json(['success' => true, 'message' => 'Items retrieved successfully', 'data' => $paginator->items(), 'meta' => ['current_page' => $paginator->currentPage(), 'from' => $paginator->firstItem(), 'last_page' => $paginator->lastPage(), 'path' => $paginator->path(), 'per_page' => $paginator->perPage(), 'to' => $paginator->lastItem(), 'total' => $paginator->total()], 'links' => ['first' => $paginator->url(1), 'last' => $paginator->url($paginator->lastPage()), 'prev' => $paginator->previousPageUrl(), 'next' => $paginator->nextPageUrl()]]);
        });
        Route::post('/test-contract/validate', function (Request $request) {
            $validated = $request->validate(['name' => 'required|string|max:255']);

            return response()->json(['success' => true, 'data' => $validated]);
        });
        Route::get('/test-contract/not-found', function () {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Resource not found.');
        });
    });
}
