<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthApiTest extends TestCase
{
    public function test_api_health_endpoint_returns_successful_payload(): void
    {
        $response = $this->get('/api/health');

        $response->assertOk()
            ->assertJsonPath('status', 'ok');
    }
}
