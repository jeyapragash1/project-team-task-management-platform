<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permissions\ListPermissionsRequest;
use App\Http\Resources\PermissionResource;
use App\Services\Roles\PermissionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    public function index(ListPermissionsRequest $request): JsonResponse
    {
        $permissions = $this->permissionService->paginate($request->validated());

        return ApiResponse::paginated('Permissions retrieved successfully.', $permissions, PermissionResource::class);
    }
}