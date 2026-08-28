<?php

namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ServiceAccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_credentials_issue_hashed_short_lived_token_and_current_token_can_be_revoked(): void
    {
        [$accountId, $clientId, $secret] = $this->serviceAccount(['organization.view'], ['ORGANIZATION']);

        $response = $this->postJson('/api/v1/auth/service-token', [
            'client_id' => $clientId,
            'client_secret' => $secret,
            'audience' => 'workforce-api',
        ])->assertOk()->assertJsonPath('success', true);

        $token = (string) $response->json('data.access_token');
        $this->assertStringStartsWith('wfs_', $token);
        $this->assertDatabaseHas('service_access_tokens', [
            'service_account_id' => $accountId,
            'token_hash' => hash('sha256', $token),
            'audience' => 'workforce-api',
        ]);
        $this->assertDatabaseMissing('service_access_tokens', ['token_hash' => $token]);

        $this->withToken($token)->getJson('/api/v1/service/ping')->assertOk();
        $this->withToken($token)->deleteJson('/api/v1/service/token/current')->assertOk();
        $this->withToken($token)->getJson('/api/v1/service/context')->assertUnauthorized();
    }

    public function test_service_permission_and_scope_are_both_enforced(): void
    {
        [, $clientId, $secret] = $this->serviceAccount(['organization.view'], ['OWN']);
        $token = (string) $this->postJson('/api/v1/auth/service-token', [
            'client_id' => $clientId,
            'client_secret' => $secret,
        ])->assertOk()->json('data.access_token');

        $this->withToken($token)->getJson('/api/v1/service/ping')->assertForbidden();
    }

    public function test_invalid_client_secret_fails_closed(): void
    {
        [, $clientId] = $this->serviceAccount(['organization.view'], ['ORGANIZATION']);

        $this->postJson('/api/v1/auth/service-token', [
            'client_id' => $clientId,
            'client_secret' => 'wrong-secret',
        ])->assertUnauthorized();
    }

    /** @return array{0:int,1:string,2:string} */
    private function serviceAccount(array $permissions, array $scopes): array
    {
        $organization = Organization::create(['name' => 'Service Org', 'slug' => 'service-org-'.uniqid()]);
        $clientId = 'svc_test_'.uniqid();
        $secret = 'a-strong-test-service-secret';
        $accountId = DB::table('service_accounts')->insertGetId([
            'organization_id' => $organization->id,
            'name' => 'Test Integration',
            'client_id' => $clientId,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('service_account_credentials')->insert([
            'service_account_id' => $accountId,
            'secret_hash' => Hash::make($secret),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        foreach ($permissions as $name) {
            $permissionId = DB::table('permissions')->where('name', $name)->value('id');
            $this->assertNotNull($permissionId, "Missing seeded permission {$name}");
            DB::table('service_account_permissions')->insert([
                'service_account_id' => $accountId,
                'permission_id' => $permissionId,
            ]);
        }
        foreach ($scopes as $scope) {
            DB::table('service_account_scopes')->insert([
                'service_account_id' => $accountId,
                'scope' => $scope,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return [$accountId, $clientId, $secret];
    }
}
