<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\ListUsersRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Requests\Users\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Users\UserService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function index(ListUsersRequest $request): JsonResponse
    {
        $users = $this->userService->paginate($request->validated());

        return ApiResponse::paginated('Users retrieved successfully.', $users, UserResource::class);
    }

    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);

        return ApiResponse::success('User retrieved successfully.', new UserResource($user->load('roles')));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return ApiResponse::success('User created successfully.', new UserResource($user), 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($user, $request->validated());

        return ApiResponse::success('User updated successfully.', new UserResource($user));
    }

    public function destroy(User $user): JsonResponse
    {
        Gate::authorize('delete', $user);

        $this->userService->delete($user);

        return ApiResponse::success('User deleted successfully.');
    }

    public function restore(int|string $user): JsonResponse
    {
        $restorableUser = User::withTrashed()->findOrFail($user);

        Gate::authorize('restore', $restorableUser);

        $restoredUser = $this->userService->restore($user);

        return ApiResponse::success('User restored successfully.', new UserResource($restoredUser));
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->updateStatus($user, (bool) $request->validated('is_active'));

        return ApiResponse::success('User status updated successfully.', new UserResource($user));
    }
}