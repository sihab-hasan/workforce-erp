<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use App\Models\User;
use App\Services\ImpersonationService;
use App\Services\SecurityAuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ControlledImpersonation
{
    public function __construct(private readonly ImpersonationService $impersonation, private readonly SecurityAuditService $audit) {}

    public function handle(Request $r, Closure $next): Response
    {
        $actor = $r->user();
        if (! $actor || ! $r->hasSession()) {
            return $next($r);
        }$id = $r->session()->get('impersonation_id');
        if (! $id) {
            return $next($r);
        }
        $row = $this->impersonation->activeForActor($actor, (string) $id);
        if (! $row) {
            $r->session()->forget(['impersonation_id', 'impersonation_subject_user_id', 'impersonation_organization_id']);

            return $next($r);
        }
        $tenantKey = trim((string) $r->header('X-Tenant-Key', ''));
        $org = Organization::find($row->organization_id);
        if (! $org || ($tenantKey !== '' && ! hash_equals((string) $org->slug, $tenantKey) && ! hash_equals((string) $org->id, $tenantKey))) {
            abort(403, 'Impersonation is bound to a different organization.');
        }
        $restricted = $row->restricted_actions ? json_decode($row->restricted_actions, true) : [];
        $path = $r->path();
        foreach ($restricted as $action) {
            if ($this->matchesRestrictedAction((string) $action, $path)) {
                abort(403, 'This sensitive action is blocked during impersonation.');
            }
        }
        $subject = User::query()->where('status', 'active')->findOrFail($row->subject_user_id);
        if (! $subject->memberships()->where('organization_id', $row->organization_id)->where('status', 'active')->exists()) {
            abort(403, 'Impersonated access is no longer valid.');
        }
        $r->attributes->set('impersonation.actor', $actor);
        $r->attributes->set('impersonation.session', $row);
        $r->setUserResolver(fn () => $subject);
        Auth::setUser($subject);
        DB::table('impersonation_sessions')->where('id', $row->id)->increment('action_count');
        $this->audit->record('impersonation.action', $actor, ['subject_user_id' => $subject->id, 'organization_id' => $row->organization_id, 'resource_type' => 'http_request', 'resource_id' => $r->method().' '.$r->path(), 'after' => ['impersonation_id' => $row->id]]);

        return $next($r);
    }

    private function matchesRestrictedAction(string $action, string $path): bool
    {
        return match ($action) {
            'security.manage' => str_contains($path, '/security/'),'payment.approve' => str_contains($path, 'payments') && str_contains($path, 'approve'),'payroll.approve' => str_contains($path, 'payroll') && str_contains($path, 'approve'),'service_account.manage' => str_contains($path, 'service-accounts'),default => false
        };
    }
}
