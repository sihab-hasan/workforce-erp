<?php

namespace App\Services;

use App\Models\OrganizationDomain;
use App\Models\User;
use Illuminate\Support\Str;

class DomainVerificationService
{
    public function __construct(private readonly AuthorizationService $authz, private readonly SecurityAuditService $audit) {}

    public function create(User $u, int $orgId, string $domain): array
    {
        $this->authz->authorize($u, $orgId, 'domain.manage');
        $domain = Str::lower(trim($domain, '. '));
        if (! filter_var('https://'.$domain, FILTER_VALIDATE_URL)) {
            abort(422, 'Invalid domain.');
        }$token = 'workforce-verification='.Str::random(48);
        $row = OrganizationDomain::query()->updateOrCreate(['domain' => $domain], ['organization_id' => $orgId, 'verification_token_hash' => hash('sha256', $token), 'status' => 'pending', 'verified_at' => null]);

        return ['domain' => $row, 'dns_txt_name' => '_workforce-verification.'.$domain, 'dns_txt_value' => $token];
    }

    public function verify(User $u, int $orgId, int $id, string $token): OrganizationDomain
    {
        $this->authz->authorize($u, $orgId, 'domain.manage');
        $row = OrganizationDomain::query()->where('organization_id', $orgId)->findOrFail($id);
        if (! hash_equals($row->verification_token_hash, hash('sha256', $token))) {
            abort(422, 'Verification token does not match.');
        }$records = dns_get_record('_workforce-verification.'.$row->domain, DNS_TXT);
        $found = collect($records ?: [])->contains(fn ($r) => hash_equals((string) ($r['txt'] ?? ''), $token));
        if (! $found) {
            abort(422, 'DNS TXT record has not propagated yet.');
        }$row->forceFill(['status' => 'verified', 'verified_at' => now()])->save();
        $this->audit->record('domain.verified', $u, ['organization_id' => $orgId, 'resource_type' => 'organization_domain', 'resource_id' => $row->id]);

        return $row;
    }
}
