<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Services\Dashboard\DashboardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        Gate::authorize('view-dashboard');

        $dashboard = $this->dashboardService->getDashboard($request->user());

        return ApiResponse::success('Dashboard retrieved successfully.', new DashboardResource($dashboard));
    }
}