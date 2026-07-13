<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\ListProjectsRequest;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\Projects\ProjectService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectService $projectService)
    {
    }

    public function index(ListProjectsRequest $request): JsonResponse
    {
        $projects = $this->projectService->paginate($request->user(), $request->validated());

        return ApiResponse::paginated('Projects retrieved successfully.', $projects, ProjectResource::class);
    }

    public function show(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        return ApiResponse::success(
            'Project retrieved successfully.',
            new ProjectResource($project->load(['manager', 'creator'])->loadCount(['tasks', 'members']))
        );
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->create($request->user(), $request->validated());

        return ApiResponse::success('Project created successfully.', new ProjectResource($project), 201);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project = $this->projectService->update($request->user(), $project, $request->validated());

        return ApiResponse::success('Project updated successfully.', new ProjectResource($project));
    }

    public function destroy(Project $project): JsonResponse
    {
        Gate::authorize('delete', $project);

        $this->projectService->delete($project);

        return ApiResponse::success('Project deleted successfully.');
    }

    public function restore(int|string $project): JsonResponse
    {
        $restorableProject = Project::withTrashed()->findOrFail($project);

        Gate::authorize('restore', $restorableProject);

        $restoredProject = $this->projectService->restore($project);

        return ApiResponse::success('Project restored successfully.', new ProjectResource($restoredProject));
    }

    public function archive(Project $project): JsonResponse
    {
        Gate::authorize('archive', $project);

        $project = $this->projectService->archive($project);

        return ApiResponse::success('Project archived successfully.', new ProjectResource($project));
    }

    public function activate(Project $project): JsonResponse
    {
        Gate::authorize('activate', $project);

        $project = $this->projectService->activate($project);

        return ApiResponse::success('Project activated successfully.', new ProjectResource($project));
    }
}