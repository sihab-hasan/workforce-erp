<?php

use Illuminate\Support\Facades\Route;

// Redirect /erp, /admin, and /app to have trailing slashes
Route::get('/erp', fn () => redirect('/erp/'));
Route::get('/admin', fn () => redirect('/admin/'));
Route::get('/app', fn () => redirect('/app/'));

// Serve ERP SPA (/erp/*)
Route::get('/erp/{any?}', function () {
    return response()->file(public_path('erp/index.html'));
})->where('any', '.*');

// Serve Admin SPA (/admin/*)
Route::get('/admin/{any?}', function () {
    return response()->file(public_path('admin/index.html'));
})->where('any', '.*');

// Serve /app SPA if requested by instructor/test
Route::get('/app/{any?}', function () {
    if (file_exists(public_path('app/index.html'))) {
        return response()->file(public_path('app/index.html'));
    }
    return response()->file(public_path('erp/index.html'));
})->where('any', '.*');

// Serve Public Web SPA for all non-API paths
Route::get('/{any?}', function () {
    if (file_exists(public_path('index.html'))) {
        return response()->file(public_path('index.html'));
    }
    return response()->json(['status' => 'ok', 'message' => 'Workforce ERP API is online.'], 200);
})->where('any', '^(?!(api|sanctum|up)($|/)).*');
