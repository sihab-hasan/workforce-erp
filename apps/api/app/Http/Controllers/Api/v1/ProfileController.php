<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function show(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $employee = Employee::query()->where('organization_id', $org->id)->where('user_id', $request->user()->id)->with(['organization', 'branch', 'department', 'designation', 'manager'])->first();

        return $this->successResponse([
            'user' => ['id' => (string) $request->user()->id, 'name' => $request->user()->name, 'email' => $request->user()->email],
            'employee' => $employee ? (new EmployeeResource($employee))->resolve($request) : null,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ]);
        $request->user()->update(['name' => $data['name'], 'email' => $data['email']]);
        $employee = Employee::query()->where('organization_id', $org->id)->where('user_id', $request->user()->id)->first();
        if ($employee) {
            $parts = preg_split('/\s+/', trim($data['name']), 2) ?: [];
            $employee->update([
                'first_name' => $parts[0] ?? $employee->first_name,
                'last_name' => $parts[1] ?? $employee->last_name,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? $employee->phone,
                'address' => $data['address'] ?? $employee->address,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? $employee->emergency_contact_name,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? $employee->emergency_contact_phone,
            ]);
        }

        return $this->show($request);
    }
}
