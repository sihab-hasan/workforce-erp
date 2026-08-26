<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check route matching shared api-client expectations
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'workforce-erp-api',
    ]);
});

// SSO Routes
Route::get('/v1/auth/sso/redirect/{provider}', [\App\Http\Controllers\Api\v1\SSOController::class, 'redirectToProvider']);
Route::post('/v1/auth/sso/callback/{provider}', [\App\Http\Controllers\Api\v1\SSOController::class, 'handleProviderCallback']);

// OTP Routes
Route::post('/v1/auth/otp/request', [\App\Http\Controllers\Api\v1\OTPController::class, 'requestOtp']);
Route::post('/v1/auth/otp/verify', [\App\Http\Controllers\Api\v1\OTPController::class, 'verifyOtp']);

// Core Auth Routes
Route::post('/v1/auth/login', [\App\Http\Controllers\Api\v1\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/v1/auth/me', [\App\Http\Controllers\Api\v1\AuthController::class, 'me']);
    Route::post('/v1/auth/logout', [\App\Http\Controllers\Api\v1\AuthController::class, 'logout']);

    // Timesheets routes
    Route::get('/v1/timesheets', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'index']);
    Route::get('/v1/timesheets/today', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'today']);
    Route::post('/v1/timesheets/clock-in', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'clockIn']);
    Route::post('/v1/timesheets/clock-out', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'clockOut']);
    Route::post('/v1/timesheets', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'store']);
    Route::get('/v1/timesheets/{id}', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'show']);
    Route::put('/v1/timesheets/{id}', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'update']);
    Route::delete('/v1/timesheets/{id}', [\App\Http\Controllers\Api\v1\TimesheetController::class, 'destroy']);

    Route::get('/v1/employees', [\App\Http\Controllers\Api\v1\EmployeeController::class, 'index']);
    Route::get('/users', [\App\Http\Controllers\Api\v1\UserController::class, 'index']);
});

if (app()->environment('testing', 'local')) {
    Route::prefix('v1')->group(function () {
        // Endpoint to verify error exception mapping
        Route::get('/test-errors/{type}', function ($type) {
            switch ($type) {
                case '401':
                    throw new \Illuminate\Auth\AuthenticationException;
                case '403':
                    throw new \Illuminate\Auth\Access\AuthorizationException;
                case '409':
                    throw new \Symfony\Component\HttpKernel\Exception\ConflictHttpException('Conflict occurred.');
                case '500':
                    throw new \Exception('Fatal database crash.');
            }

            return response()->json(['message' => 'Ok']);
        });

        // Endpoint to verify success response format
        Route::get('/test-contract/success', function () {
            return response()->json([
                'success' => true,
                'message' => 'Item retrieved successfully',
                'data' => [
                    'id' => 2,
                    'name' => 'Item 2',
                    'description' => 'Description for item 2',
                    'created_at' => now()->toIso8601String(),
                    'updated_at' => now()->toIso8601String(),
                ],
            ]);
        });

        // Endpoint to verify paginated response format
        Route::get('/test-contract/paginate', function (Request $request) {
            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('per_page', 5);
            $total = 12;

            $items = [];
            for ($i = ($page - 1) * $perPage + 1; $i <= min($page * $perPage, $total); $i++) {
                $items[] = [
                    'id' => $i,
                    'name' => 'Item '.$i,
                    'description' => 'Description for item '.$i,
                    'created_at' => now()->toIso8601String(),
                    'updated_at' => now()->toIso8601String(),
                ];
            }

            $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
                $items,
                $total,
                $perPage,
                $page,
                ['path' => $request->url()]
            );

            return response()->json([
                'success' => true,
                'message' => 'Items retrieved successfully',
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'from' => $paginator->firstItem(),
                    'last_page' => $paginator->lastPage(),
                    'path' => $paginator->path(),
                    'per_page' => $paginator->perPage(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ]);
        });

        // Endpoint to verify validation response format
        Route::post('/test-contract/validate', function (Request $request) {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            return response()->json([
                'success' => true,
                'data' => $validated,
            ]);
        });

        // Endpoint to verify resource-not-found response format
        Route::get('/test-contract/not-found', function () {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Resource not found.');
        });
    });
}
