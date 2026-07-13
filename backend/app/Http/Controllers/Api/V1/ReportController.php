<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ReportFilterRequest;
use App\Http\Resources\ReportResource;
use App\Services\Reports\ReportService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function users(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->reportService->users($request->user(), $request->validated());

        return ApiResponse::success('User report retrieved successfully.', new ReportResource($report));
    }

    public function projects(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->reportService->projects($request->user(), $request->validated());

        return ApiResponse::success('Project report retrieved successfully.', new ReportResource($report));
    }

    public function tasks(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->reportService->tasks($request->user(), $request->validated());

        return ApiResponse::success('Task report retrieved successfully.', new ReportResource($report));
    }

    public function projectProgress(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->reportService->projectProgress($request->user(), $request->validated());

        return ApiResponse::success('Project progress report retrieved successfully.', new ReportResource($report));
    }

    public function workload(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->reportService->workload($request->user(), $request->validated());

        return ApiResponse::success('Workload report retrieved successfully.', new ReportResource($report));
    }
}