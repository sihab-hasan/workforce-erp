<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use App\Services\AuthorizationService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Organization-level leave type configuration (Annual, Sick, Casual, ...).
 *
 * Every user with `leave.view` can list the active types; creating, editing,
 * deactivating and deleting types requires `leave.manage`.
 */
class LeaveTypeController extends Controller
{
    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly AuthorizationService $authorization,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.view');
        $canManage = $this->authorization->can($request->user(), (int) $org->id, 'leave.manage');

        $types = LeaveType::query()
            ->where('organization_id', $org->id)
            // Inactive types are configuration details only managers need to see.
            ->when(! $canManage, fn ($q) => $q->where('is_active', true))
            ->withCount('requests')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();

        return $this->successResponse($types->map(fn (LeaveType $type) => $this->serialize($type))->values());
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.manage');
        $data = $request->validate($this->rules((int) $org->id));

        $type = LeaveType::create([
            ...$data,
            'code' => strtoupper($data['code']),
            'organization_id' => $org->id,
            'is_paid' => $data['is_paid'] ?? true,
            'is_active' => $data['is_active'] ?? true,
        ])->loadCount('requests');

        return $this->successResponse($this->serialize($type), 'Leave type created', 201);
    }

    public function update(Request $request, LeaveType $leaveType): JsonResponse
    {
        $org = $this->assertOwned($request, $leaveType);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.manage');
        $data = $request->validate($this->rules((int) $org->id, $leaveType, true));
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $leaveType->update($data);

        return $this->successResponse($this->serialize($leaveType->fresh()->loadCount('requests')), 'Leave type updated');
    }

    public function destroy(Request $request, LeaveType $leaveType): JsonResponse
    {
        $org = $this->assertOwned($request, $leaveType);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.manage');

        // leave_requests.leave_type_id is restrictOnDelete: historical requests
        // must keep their type, so used types can only be deactivated.
        if ($leaveType->requests()->exists()) {
            abort(409, 'This leave type is used by existing leave requests. Deactivate it instead.');
        }

        $leaveType->delete();

        return $this->successResponse(null, 'Leave type deleted');
    }

    /** Resolves the scoped organization and hides types from other tenants (404, not 403). */
    private function assertOwned(Request $request, LeaveType $leaveType)
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $leaveType->organization_id === (int) $org->id, 404);

        return $org;
    }

    private function rules(int $organizationId, ?LeaveType $ignore = null, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $unique = Rule::unique('leave_types', 'code')->where('organization_id', $organizationId);
        if ($ignore) {
            $unique->ignore($ignore->id);
        }

        return [
            'name' => [$required, 'string', 'max:120'],
            'code' => [$required, 'string', 'max:32', 'alpha_dash', $unique],
            'annual_allowance' => [$required, 'numeric', 'min:0', 'max:366'],
            'is_paid' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    private function serialize(LeaveType $type): array
    {
        return [
            'id' => (string) $type->id,
            'name' => $type->name,
            'code' => $type->code,
            'annual_allowance' => (float) $type->annual_allowance,
            'is_paid' => (bool) $type->is_paid,
            'is_active' => (bool) $type->is_active,
            'requests_count' => (int) ($type->requests_count ?? 0),
            'created_at' => $type->created_at?->toIso8601String(),
            'updated_at' => $type->updated_at?->toIso8601String(),
        ];
    }
}
