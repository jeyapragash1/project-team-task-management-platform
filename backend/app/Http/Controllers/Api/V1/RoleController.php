<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\ListRolesRequest;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\SyncRolePermissionsRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\Roles\RoleService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(private readonly RoleService $roleService)
    {
    }

    public function index(ListRolesRequest $request): JsonResponse
    {
        $roles = $this->roleService->paginate($request->validated());

        return ApiResponse::paginated('Roles retrieved successfully.', $roles, RoleResource::class);
    }

    public function show(Role $role): JsonResponse
    {
        Gate::authorize('view', $role);

        return ApiResponse::success('Role retrieved successfully.', new RoleResource($role->load('permissions')));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return ApiResponse::success('Role created successfully.', new RoleResource($role), 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->update($role, $request->validated());

        return ApiResponse::success('Role updated successfully.', new RoleResource($role));
    }

    public function destroy(Role $role): JsonResponse
    {
        Gate::authorize('delete', $role);

        $this->roleService->delete($role);

        return ApiResponse::success('Role deleted successfully.');
    }

    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->syncPermissions($role, $request->validated('permissions'));

        return ApiResponse::success('Role permissions updated successfully.', new RoleResource($role));
    }

    public function removePermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->removePermissions($role, $request->validated('permissions'));

        return ApiResponse::success('Role permissions removed successfully.', new RoleResource($role));
    }
}