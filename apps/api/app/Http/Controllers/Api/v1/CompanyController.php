<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $query = Branch::query()->where('organization_id', $org->id)->withCount(['departments', 'employees']);
        if ($request->filled('search')) {
            $term = trim((string) $request->input('search'));
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('code', 'like', "%{$term}%"));
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('is_active', $request->input('status') === 'active');
        }
        $data = $query->orderBy('name')->get()->map(fn ($company) => $this->serialize($company));

        return $this->successResponse($data);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $data = $this->validatePayload($request, null, (int) $org->id);
        $data['organization_id'] = $org->id;
        $company = Branch::create($data);

        return $this->successResponse($this->serialize($company->loadCount(['departments', 'employees'])), 'Company created successfully', 201);
    }

    public function show(Request $request, Branch $company): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $company->organization_id === (int) $org->id, 404);

        return $this->successResponse($this->serialize($company->loadCount(['departments', 'employees'])));
    }

    public function update(Request $request, Branch $company): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $company->organization_id === (int) $org->id, 404);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $company->update($this->validatePayload($request, $company, (int) $org->id));

        return $this->successResponse($this->serialize($company->fresh()->loadCount(['departments', 'employees'])), 'Company updated successfully');
    }

    public function destroy(Request $request, Branch $company): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $company->organization_id === (int) $org->id, 404);
        $this->scope->assertRole($request, ['owner']);
        if ($company->employees()->exists() || $company->departments()->exists()) {
            abort(409, 'Move or archive the company employees and departments before deleting it.');
        }
        $company->delete();

        return $this->successResponse(null, 'Company deleted successfully');
    }

    private function validatePayload(Request $request, ?Branch $company, int $organizationId): array
    {
        $id = $company?->id;

        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('branches', 'name')->where('organization_id', $organizationId)->ignore($id)],
            'code' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string', 'max:2000'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'timezone' => ['nullable', 'timezone'],
            'settings' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function serialize(Branch $company): array
    {
        return [
            'id' => (string) $company->id,
            'organization_id' => (string) $company->organization_id,
            'name' => $company->name,
            'code' => $company->code,
            'address' => $company->address,
            'email' => $company->email,
            'phone' => $company->phone,
            'timezone' => $company->timezone,
            'settings' => $company->settings ?? [],
            'is_active' => (bool) $company->is_active,
            'departments_count' => (int) ($company->departments_count ?? $company->departments()->count()),
            'employees_count' => (int) ($company->employees_count ?? $company->employees()->count()),
            'created_at' => $company->created_at?->toIso8601String(),
            'updated_at' => $company->updated_at?->toIso8601String(),
        ];
    }
}
