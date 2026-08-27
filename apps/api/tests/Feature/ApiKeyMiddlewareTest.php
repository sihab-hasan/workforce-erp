<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiKeyMiddlewareTest extends TestCase
{
    public function test_internal_ping_requires_configured_api_token(): void
    {
        config(['api.shared_token' => null]);

        $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/internal/ping')
            ->assertStatus(503)
            ->assertJson([
                'success' => false,
                'message' => 'Internal API token authentication is not configured.',
            ]);
    }

    public function test_internal_ping_rejects_missing_or_invalid_api_token(): void
    {
        config(['api.shared_token' => 'my-secret-token']);

        $this->getJson('/api/v1/internal/ping')
            ->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Invalid or missing API token.',
            ]);

        $this->withHeader('X-API-TOKEN', 'wrong-token')
            ->getJson('/api/v1/internal/ping')
            ->assertUnauthorized();
    }

    public function test_internal_ping_accepts_sample_style_header_when_configured(): void
    {
        config(['api.shared_token' => 'my-secret-token']);

        $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/internal/ping')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'service' => 'workforce-erp-api',
                    'authenticated_via' => 'X-API-TOKEN',
                ],
            ]);
    }

    public function test_public_health_check_does_not_require_shared_api_token(): void
    {
        config(['api.shared_token' => 'my-secret-token']);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'workforce-erp-api',
            ]);
    }
}
