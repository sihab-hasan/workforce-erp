<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SsoSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.google.client_id' => 'google-client',
            'services.google.client_secret' => 'google-secret',
            'services.google.redirect' => 'https://app.example.test/sso/callback/google',
            'services.microsoft.client_id' => 'microsoft-client',
            'services.microsoft.client_secret' => 'microsoft-secret',
            'services.microsoft.redirect' => 'https://app.example.test/sso/callback/microsoft',
            'services.microsoft.tenant' => 'common',
        ]);
    }

    public function test_supported_sso_redirects_use_state_and_pkce(): void
    {
        foreach (['google', 'microsoft'] as $provider) {
            $response = $this->getJson("/api/v1/auth/sso/redirect/{$provider}?client=erp")
                ->assertOk()->assertJsonStructure(['success', 'redirect_url', 'state']);
            $url = (string) $response->json('redirect_url');
            $this->assertStringContainsString('state=', $url);
            $this->assertStringContainsString('code_challenge=', $url);
            $this->assertStringContainsString('code_challenge_method=S256', $url);
        }
    }

    public function test_unsupported_sso_provider_is_rejected(): void
    {
        $this->getJson('/api/v1/auth/sso/redirect/github')->assertStatus(400);
    }
}
