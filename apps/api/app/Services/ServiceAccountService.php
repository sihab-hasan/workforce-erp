<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ServiceAccountService
{
    public function __construct(private readonly AuthorizationService $authz, private readonly SecurityAuditService $audit) {}

    public function create(User $actor, int $orgId, string $name, array $permissions, array $scopes, ?string $expiresAt = null): array
    {
        $this->authz->authorize($actor, $orgId, 'service_account.manage');
        if (in_array('*', $permissions, true)) {
            abort(422, 'Wildcard service-account permissions are not allowed.');
        }
        $client = 'svc_'.Str::lower(Str::random(24));
        $secret = Str::random(64);

        return DB::transaction(function () use ($actor, $orgId, $name, $permissions, $scopes, $expiresAt, $client, $secret) {
            $id = DB::table('service_accounts')->insertGetId(['organization_id' => $orgId, 'name' => $name, 'client_id' => $client, 'status' => 'active', 'expires_at' => $expiresAt, 'created_by' => $actor->id, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('service_account_credentials')->insert(['service_account_id' => $id, 'secret_hash' => Hash::make($secret), 'expires_at' => $expiresAt, 'created_at' => now(), 'updated_at' => now()]);
            $unique = array_values(array_unique($permissions));
            $rows = DB::table('permissions')->whereIn('name', $unique)->get(['id', 'name']);
            if ($rows->count() !== count($unique)) {
                abort(422, 'One or more service-account permissions are unknown.');
            }
            foreach ($rows as $p) {
                DB::table('service_account_permissions')->insert(['service_account_id' => $id, 'permission_id' => $p->id]);
            }
            foreach ($scopes as $s) {
                $scope = strtoupper((string) ($s['scope'] ?? ''));
                if (! in_array($scope, AuthorizationService::SCOPES, true)) {
                    abort(422, 'Invalid service-account scope.');
                }DB::table('service_account_scopes')->insert(['service_account_id' => $id, 'scope' => $scope, 'scope_data' => isset($s['data']) ? json_encode($s['data']) : null, 'created_at' => now(), 'updated_at' => now()]);
            }
            $this->audit->record('service_account.created', $actor, ['organization_id' => $orgId, 'resource_type' => 'service_account', 'resource_id' => $id]);

            return ['id' => (string) $id, 'client_id' => $client, 'client_secret' => $secret];
        });
    }

    public function rotate(User $actor, int $orgId, int $id): array
    {
        $this->authz->authorize($actor, $orgId, 'service_account.manage');
        $account = DB::table('service_accounts')->where('organization_id', $orgId)->where('id', $id)->where('status', 'active')->first();
        if (! $account) {
            abort(404, 'Service account not found.');
        }$secret = Str::random(64);
        DB::transaction(function () use ($id, $secret) {
            DB::table('service_account_credentials')->where('service_account_id', $id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'rotated_at' => now(), 'updated_at' => now()]);
            DB::table('service_account_credentials')->insert(['service_account_id' => $id, 'secret_hash' => Hash::make($secret), 'created_at' => now(), 'updated_at' => now()]);
            DB::table('service_access_tokens')->where('service_account_id', $id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'updated_at' => now()]);
        });
        $this->audit->record('service_account.rotated', $actor, ['organization_id' => $orgId, 'resource_type' => 'service_account', 'resource_id' => $id]);

        return ['client_id' => $account->client_id, 'client_secret' => $secret];
    }

    public function revoke(User $actor, int $orgId, int $id): void
    {
        $this->authz->authorize($actor, $orgId, 'service_account.manage');
        $account = DB::table('service_accounts')->where('organization_id', $orgId)->where('id', $id)->first();
        if (! $account) {
            abort(404, 'Service account not found.');
        }
        DB::transaction(function () use ($id) {
            DB::table('service_accounts')->where('id', $id)->update(['status' => 'revoked', 'updated_at' => now()]);
            DB::table('service_account_credentials')->where('service_account_id', $id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'updated_at' => now()]);
            DB::table('service_access_tokens')->where('service_account_id', $id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'updated_at' => now()]);
        });
        $this->audit->record('service_account.revoked', $actor, ['organization_id' => $orgId, 'resource_type' => 'service_account', 'resource_id' => $id]);
    }

    public function issueToken(string $clientId, string $secret, string $audience = 'workforce-api', ?string $ip = null): array
    {
        $account = DB::table('service_accounts')->where('client_id', $clientId)->where('status', 'active')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first();
        $credential = $account ? DB::table('service_account_credentials')->where('service_account_id', $account->id)->whereNull('revoked_at')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->latest('id')->first() : null;
        if (! $account || ! $credential || ! Hash::check($secret, $credential->secret_hash)) {
            Hash::check($secret, Hash::make(Str::random(64)));
            abort(401, 'Invalid service credentials.');
        }
        $allowedAudiences = (array) config('security.service_accounts.audiences', ['workforce-api']);
        if (! in_array($audience, $allowedAudiences, true)) {
            abort(422, 'Unsupported service-token audience.');
        }
        $plain = 'wfs_'.Str::random(80);
        $expires = now()->addMinutes((int) config('security.service_accounts.token_ttl_minutes', 60));
        DB::table('service_access_tokens')->insert(['service_account_id' => $account->id, 'token_hash' => hash('sha256', $plain), 'audience' => $audience, 'expires_at' => $expires, 'last_ip' => $ip, 'created_at' => now(), 'updated_at' => now()]);
        DB::table('service_accounts')->where('id', $account->id)->update(['last_used_at' => now(), 'last_ip' => $ip, 'updated_at' => now()]);

        return ['token_type' => 'Bearer', 'access_token' => $plain, 'expires_at' => $expires->toIso8601String(), 'audience' => $audience, 'organization_id' => (string) $account->organization_id];
    }

    public function context(Request $request): array
    {
        $account = $request->attributes->get('service.account');
        if (! $account) {
            abort(401);
        }
        $permissions = DB::table('service_account_permissions as sap')->join('permissions as p', 'p.id', '=', 'sap.permission_id')->where('sap.service_account_id', $account->id)->orderBy('p.name')->pluck('p.name')->all();
        $scopes = DB::table('service_account_scopes')->where('service_account_id', $account->id)->get()->map(fn ($r) => ['scope' => $r->scope, 'data' => $r->scope_data ? json_decode($r->scope_data, true) : null])->values()->all();

        return ['id' => (string) $account->id, 'name' => $account->name, 'client_id' => $account->client_id, 'organization_id' => (string) $account->organization_id, 'permissions' => $permissions, 'scopes' => $scopes, 'expires_at' => $account->expires_at];
    }

    public function revokeCurrent(Request $request): void
    {
        $token = $request->attributes->get('service.token');
        if (! $token) {
            abort(401);
        }DB::table('service_access_tokens')->where('id', $token->id)->update(['revoked_at' => now(), 'updated_at' => now()]);
    }
}
