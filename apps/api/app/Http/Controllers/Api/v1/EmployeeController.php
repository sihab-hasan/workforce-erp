<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\ListEmployeesRequest;
use App\Http\Resources\EmployeeResource;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(private readonly EmployeeService $employeeService)
    {
    }

    public function index(ListEmployeesRequest $request): JsonResponse
    {
        $paginator = $this->employeeService->paginate($request->user(), $request->validated());

        return $this->successResponse(EmployeeResource::collection($paginator), 'Employees retrieved successfully');
    }

    public function options(Request $request): JsonResponse
    {
        return $this->successResponse($this->employeeService->options($request->user()));
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->successResponse($this->employeeService->summary($request->user()));
    }
}
