<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Role;
use App\Services\AuthorizationService;
use App\Services\InvitationService;
use App\Services\SecurityAuditService;
use App\Services\SubscriptionAccessService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OnboardingController extends Controller
{
    private const STEPS = ['organization', 'company', 'locations', 'departments', 'settings', 'modules', 'team', 'security', 'complete'];

    private const REQUIRED = ['organization', 'company', 'settings', 'modules', 'security'];

    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly AuthorizationService $authz,
        private readonly SubscriptionAccessService $subscriptions,
        private readonly InvitationService $invitations,
        private readonly SecurityAuditService $audit,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authz->authorize($request->user(), (int) $org->id, 'onboarding.manage');
        $stepRows = DB::table('organization_onboarding_steps')->where('organization_id', $org->id)->get()->keyBy('step');

        $status = [];
        foreach (self::STEPS as $step) {
            $status[$step] = [
                'status' => $stepRows[$step]->status ?? 'pending',
                'completed_at' => $stepRows[$step]->completed_at ?? null,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $org->onboarding_status,
                'step' => $org->onboarding_step ?: 'organization',
                'data' => $org->onboarding_data ?: [],
                'steps' => self::STEPS,
                'step_status' => $status,
                'modules' => config('security.subscription.modules', []),
                'roles' => Role::query()
                    ->where('organization_id', $org->id)
                    ->where('name', '!=', 'organization_owner')
                    ->orderBy('name')
                    ->get(['name', 'description']),
            ],
        ]);
    }

    public function save(Request $request, string $step): JsonResponse
    {
        if (! in_array($step, self::STEPS, true)) {
            abort(404);
        }

        $org = $this->scope->organization($request, true);
        $this->authz->authorize($request->user(), (int) $org->id, 'onboarding.manage');

        $body = $request->validate([
            'data' => ['nullable', 'array'],
            'continue' => ['nullable', 'boolean'],
            'skip' => ['nullable', 'boolean'],
        ]);

        $skip = (bool) ($body['skip'] ?? false);
        if ($skip && ! in_array($step, ['locations', 'departments', 'team'], true)) {
            abort(422, 'This onboarding step is required.');
        }

        $payload = $body['data'] ?? [];

        return DB::transaction(function () use ($request, $org, $step, $payload, $skip, $body) {
            $saved = $skip ? [] : $this->applyStep($request, $org, $step, $payload);
            $data = $org->onboarding_data ?: [];
            $data[$step] = $saved;

            DB::table('organization_onboarding_steps')->updateOrInsert(
                ['organization_id' => $org->id, 'step' => $step],
                [
                    'status' => $skip ? 'skipped' : 'completed',
                    'payload' => json_encode($saved, JSON_THROW_ON_ERROR),
                    'completed_by' => $request->user()->id,
                    'completed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );

            $next = $this->nextStep($step, (bool) ($body['continue'] ?? true));
            $complete = $step === 'complete';
            $org->forceFill([
                'onboarding_data' => $data,
                'onboarding_step' => $next,
                'onboarding_status' => $complete ? 'completed' : 'in_progress',
            ])->save();

            $this->audit->record('onboarding.step.completed', $request->user(), [
                'organization_id' => $org->id,
                'resource_type' => 'onboarding_step',
                'resource_id' => $step,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $org->onboarding_status,
                    'step' => $org->onboarding_step,
                    'data' => $org->onboarding_data,
                ],
            ]);
        });
    }

    private function applyStep(Request $request, $org, string $step, array $payload): array
    {
        return match ($step) {
            'organization' => $this->organization($request, $org, $payload),
            'company' => $this->company($request, $org, $payload),
            'locations' => $this->locations($request, $org, $payload),
            'departments' => $this->departments($request, $org, $payload),
            'settings' => $this->settings($request, $org, $payload),
            'modules' => $this->modules($request, $org, $payload),
            'team' => $this->team($request, $org, $payload),
            'security' => $this->security($request, $org, $payload),
            'complete' => $this->complete($request, $org, $payload),
            default => abort(404),
        };
    }

    private function organization(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'country' => ['required', 'string', 'size:2'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:2000'],
            'timezone' => ['required', 'timezone'],
            'locale' => ['required', 'string', 'max:16'],
        ])->validate();

        $data['country'] = strtoupper($data['country']);
        $org->update($data);

        return $data;
    }

    private function company(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:2000'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'timezone' => ['nullable', 'timezone'],
        ])->validate();

        $branch = Branch::query()->updateOrCreate(
            ['organization_id' => $org->id, 'code' => $data['code']],
            [
                'name' => $data['name'],
                'address' => $data['address'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'timezone' => $data['timezone'] ?? $org->timezone,
                'is_active' => true,
            ],
        );

        if (! $org->legal_name) {
            $org->update(['legal_name' => $data['name']]);
        }

        return array_merge($data, ['id' => (int) $branch->id]);
    }

    private function locations(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'locations' => ['required', 'array', 'max:50'],
            'locations.*.id' => ['nullable', 'integer'],
            'locations.*.name' => ['required', 'string', 'max:255'],
            'locations.*.code' => ['required', 'string', 'max:50'],
            'locations.*.address' => ['nullable', 'string', 'max:2000'],
            'locations.*.timezone' => ['nullable', 'timezone'],
        ])->validate();

        $out = [];
        foreach ($data['locations'] as $row) {
            $branch = ! empty($row['id'])
                ? Branch::query()->where('organization_id', $org->id)->findOrFail((int) $row['id'])
                : new Branch(['organization_id' => $org->id]);

            $branch->fill([
                'name' => $row['name'],
                'code' => $row['code'],
                'address' => $row['address'] ?? null,
                'timezone' => $row['timezone'] ?? $org->timezone,
                'is_active' => true,
            ])->save();

            $out[] = [
                'id' => (int) $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'address' => $branch->address,
                'timezone' => $branch->timezone,
            ];
        }

        return ['locations' => $out];
    }

    private function departments(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'departments' => ['required', 'array', 'max:100'],
            'departments.*.id' => ['nullable', 'integer'],
            'departments.*.name' => ['required', 'string', 'max:255'],
            'departments.*.code' => ['required', 'string', 'max:50'],
            'departments.*.branch_id' => ['required', 'integer'],
        ])->validate();

        $out = [];
        foreach ($data['departments'] as $row) {
            abort_unless(
                Branch::query()->where('organization_id', $org->id)->whereKey($row['branch_id'])->exists(),
                422,
                'Department branch is invalid.',
            );

            $department = ! empty($row['id'])
                ? Department::query()->where('organization_id', $org->id)->findOrFail((int) $row['id'])
                : new Department(['organization_id' => $org->id]);

            $department->fill([
                'name' => $row['name'],
                'code' => $row['code'],
                'branch_id' => $row['branch_id'],
                'is_active' => true,
            ])->save();

            $out[] = [
                'id' => (int) $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'branch_id' => (int) $department->branch_id,
            ];
        }

        return ['departments' => $out];
    }

    private function settings(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'timezone' => ['required', 'timezone'],
            'currency' => ['required', 'string', 'size:3'],
            'fiscal_year_start_month' => ['required', 'integer', 'between:1,12'],
            'locale' => ['required', 'string', 'max:16'],
            'work_week_days' => ['required', 'array', 'min:1', 'max:7'],
            'work_week_days.*' => ['integer', 'between:1,7', 'distinct'],
            'default_workday_hours' => ['required', 'numeric', 'between:1,24'],
            'leave_year_start_month' => ['required', 'integer', 'between:1,12'],
        ])->validate();

        $settings = $org->settings ?: [];
        $settings['hr'] = array_merge($settings['hr'] ?? [], [
            'work_week_days' => $data['work_week_days'],
            'default_workday_hours' => (float) $data['default_workday_hours'],
            'leave_year_start_month' => (int) $data['leave_year_start_month'],
        ]);

        $org->update([
            'timezone' => $data['timezone'],
            'currency' => strtoupper($data['currency']),
            'fiscal_year_start_month' => $data['fiscal_year_start_month'],
            'locale' => $data['locale'],
            'settings' => $settings,
        ]);

        return $data;
    }

    private function modules(Request $request, $org, array $payload): array
    {
        $allowed = array_keys((array) config('security.subscription.modules', []));
        $data = validator($payload, [
            'modules' => ['required', 'array', 'min:1'],
            'modules.*' => ['string', Rule::in($allowed), 'distinct'],
        ])->validate();

        $this->subscriptions->setModules((int) $org->id, $data['modules']);

        return $data;
    }

    private function team(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'invitations' => ['required', 'array', 'max:50'],
            'invitations.*.name' => ['required', 'string', 'max:255'],
            'invitations.*.email' => ['required', 'email', 'max:255'],
            'invitations.*.roles' => ['required', 'array', 'min:1', 'max:8'],
            'invitations.*.roles.*' => ['string', 'max:100', 'distinct'],
            'invitations.*.data_scope' => ['nullable', Rule::in(AuthorizationService::SCOPES)],
        ])->validate();

        $out = [];
        foreach ($data['invitations'] as $invitation) {
            if (in_array('organization_owner', $invitation['roles'], true)) {
                abort(422, 'Owner assignment must use the privileged role-management workflow.');
            }

            $roles = Role::query()
                ->where('organization_id', $org->id)
                ->whereIn('name', $invitation['roles'])
                ->pluck('name')
                ->all();

            if (count($roles) !== count(array_unique($invitation['roles']))) {
                abort(422, 'One or more team roles are invalid.');
            }

            $result = $this->invitations->issue(
                $request->user(),
                (int) $org->id,
                $invitation['email'],
                $roles,
                $invitation['data_scope'] ?? 'OWN',
                null,
                $invitation['name'],
            );

            $out[] = [
                'email' => Str::lower($invitation['email']),
                'roles' => $roles,
                'delivered' => (bool) ($result['delivered'] ?? false),
            ];
        }

        return ['invitations' => $out];
    }

    private function security(Request $request, $org, array $payload): array
    {
        $data = validator($payload, [
            'require_mfa_for_privileged' => ['required', 'boolean'],
            'allow_email_code' => ['required', 'boolean'],
            'allow_sms_code' => ['required', 'boolean'],
            'allow_authenticator' => ['required', 'boolean'],
        ])->validate();

        if (! $data['allow_email_code'] && ! $data['allow_sms_code'] && ! $data['allow_authenticator']) {
            abort(422, 'At least one verification method must remain available.');
        }

        if (! $request->user()->email_verified_at) {
            abort(409, 'Verified email is required before onboarding can be completed.');
        }

        $settings = $org->settings ?: [];
        $settings['security'] = $data;
        $org->update(['settings' => $settings]);

        return array_merge($data, [
            'email_verified' => true,
            'phone_verified' => (bool) $request->user()->phone_verified_at,
            'authenticator_enrolled' => $request->user()->authenticatorFactors()->whereNotNull('confirmed_at')->exists(),
        ]);
    }

    private function complete(Request $request, $org, array $payload): array
    {
        $statuses = DB::table('organization_onboarding_steps')->where('organization_id', $org->id)->pluck('status', 'step');
        $missing = array_values(array_filter(self::REQUIRED, fn ($s) => ($statuses[$s] ?? null) !== 'completed'));

        if ($missing !== []) {
            abort(409, 'Complete required onboarding steps first: '.implode(', ', $missing));
        }

        return [
            'completed_at' => now()->toIso8601String(),
            'completed_by' => (int) $request->user()->id,
        ];
    }

    private function nextStep(string $step, bool $continue): string
    {
        if (! $continue) {
            return $step;
        }

        $index = array_search($step, self::STEPS, true);

        return self::STEPS[min($index + 1, count(self::STEPS) - 1)];
    }
}
