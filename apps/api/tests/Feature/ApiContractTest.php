<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiContractTest extends TestCase
{
    /**
     * Test the root API health endpoint.
     */
    public function test_api_health_endpoint(): void
    {
        // 1. With X-API-TOKEN header
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'workforce-erp-api',
            ]);

        // 2. Without X-API-TOKEN header (should still pass, health check is public)
        $publicResponse = $this->getJson('/api/health');

        $publicResponse->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'workforce-erp-api',
            ]);
    }

    /**
     * Test success response structures and pagination metadata.
     */
    public function test_success_response_and_pagination_contract(): void
    {
        // Test Paginated List
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-contract/paginate?page=1&per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'from', 'last_page', 'path', 'per_page', 'to', 'total'],
                'links' => ['first', 'last', 'prev', 'next'],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Items retrieved successfully',
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 5,
                    'total' => 12,
                ],
            ]);

        // Test Single Resource
        $singleResponse = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-contract/success');
        $singleResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'description', 'created_at', 'updated_at'],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Item retrieved successfully',
                'data' => [
                    'id' => 2,
                    'name' => 'Item 2',
                ],
            ]);
    }

    /**
     * Test validation error response mapping.
     */
    public function test_validation_error_contract(): void
    {
        // POST to /validate without required 'name' field
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->postJson('/api/v1/test-contract/validate', [
                'description' => 'Missing name field',
            ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['name'],
            ])
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test not found (404) exception mapping.
     */
    public function test_not_found_error_contract(): void
    {
        // 404 for model/resource not found
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-contract/not-found');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Resource not found.',
            ]);

        // 404 for undefined routes
        $routeResponse = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/non-existent-route-path');
        $routeResponse->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Resource not found.',
            ]);
    }

    /**
     * Test unauthenticated (401) exception mapping.
     */
    public function test_unauthenticated_error_contract(): void
    {
        // 1. Missing token (intercepted by TestMiddleware)
        $response = $this->getJson('/api/v1/test-errors/401');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid or missing token.',
            ]);

        // 2. Custom 401 throw from controller/route (passes middleware, caught by Handler)
        $responseWithToken = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-errors/401');

        $responseWithToken->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test unauthorized/forbidden (403) exception mapping.
     */
    public function test_unauthorized_error_contract(): void
    {
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-errors/403');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'This action is unauthorized.',
            ]);
    }

    /**
     * Test conflict (409) exception mapping.
     */
    public function test_conflict_error_contract(): void
    {
        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-errors/409');

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'Conflict occurred.',
            ]);
    }

    /**
     * Test internal server error (500) exception mapping.
     */
    public function test_internal_server_error_contract(): void
    {
        // Ensure app debug is false to test production/generic formatting
        config(['app.debug' => false]);

        $response = $this->withHeader('X-API-TOKEN', 'my-secret-token')
            ->getJson('/api/v1/test-errors/500');

        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'message' => 'An unexpected error occurred.',
            ]);

        $responseData = $response->json();
        $this->assertArrayNotHasKey('error', $responseData);
        $this->assertArrayNotHasKey('trace', $responseData);
    }
}
