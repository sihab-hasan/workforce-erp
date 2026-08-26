<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\ListUsersRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Requests\Users\UserMembershipActionRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService, private readonly WorkforceScopeService $scope) {}

    public function index(ListUsersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $org = $this->scope->organization($request, false);
        if ($org) $filters['organization_id'] = $org->id;
        $paginator = $this->userService->paginate($request->user(), $filters);

        return $this->successResponse(UserResource::collection($paginator), 'Users retrieved successfully');
    }

    public function show(Request $request, User $user): JsonResponse
    {
        return $this->successResponse(
            new UserResource($this->userService->accessible($request->user(), $user)),
            'User retrieved successfully'
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->invite($request->user(), $request->validated());
        $delivered = (bool) $user->getAttribute('invitation_delivered');

        return $this->successResponse(
            new UserResource($user),
            $delivered
                ? 'User created and invitation email sent successfully'
                : 'User created, but the invitation email could not be delivered. Resend it after mail is configured.',
            201
        );
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($request->user(), $user, $request->validated());

        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function activate(UserMembershipActionRequest $request, User $user): JsonResponse
    {
        return $this->statusResponse($request, $user, 'active');
    }

    public function deactivate(UserMembershipActionRequest $request, User $user): JsonResponse
    {
        return $this->statusResponse($request, $user, 'inactive');
    }

    public function suspend(UserMembershipActionRequest $request, User $user): JsonResponse
    {
        return $this->statusResponse($request, $user, 'suspended');
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->userService->rejectUnsafeDeletion($request->user(), $user);
    }

    public function resendInvitation(UserMembershipActionRequest $request, User $user): JsonResponse
    {
        $delivery = $this->userService->resendInvitation(
            $request->user(),
            $user,
            $request->filled('organization_id') ? $request->integer('organization_id') : null
        );

        return $this->successResponse(
            $delivery,
            $delivery['delivered']
                ? 'Invitation sent successfully'
                : 'Invitation email could not be delivered. Check the mail configuration and try again.'
        );
    }

    public function organizations(Request $request): JsonResponse
    {
        return $this->successResponse($this->userService->organizationOptions($request->user()));
    }

    public function roles(Request $request): JsonResponse
    {
        return $this->successResponse($this->userService->roleOptions($request->user()));
    }

    public function employees(Request $request): JsonResponse
    {
        return $this->successResponse($this->userService->employeeOptions($request->user()));
    }

    private function statusResponse(UserMembershipActionRequest $request, User $user, string $status): JsonResponse
    {
        $updatedUser = $this->userService->setStatus(
            $request->user(),
            $user,
            $status,
            $request->filled('organization_id') ? $request->integer('organization_id') : null
        );

        return $this->successResponse(new UserResource($updatedUser), "User {$status} successfully");
    }
}
