<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectMembers\ListProjectMembersRequest;
use App\Http\Requests\ProjectMembers\StoreProjectMembersRequest;
use App\Http\Resources\ProjectMemberResource;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Services\Projects\ProjectMemberService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ProjectMemberController extends Controller
{
    public function __construct(private readonly ProjectMemberService $projectMemberService)
    {
    }

    public function index(ListProjectMembersRequest $request, Project $project): JsonResponse
    {
        $members = $this->projectMemberService->paginate($project, $request->validated());

        return ApiResponse::paginated('Project members retrieved successfully.', $members, ProjectMemberResource::class);
    }

    public function store(StoreProjectMembersRequest $request, Project $project): JsonResponse
    {
        $members = $this->projectMemberService->addMembers(
            $project,
            $request->user(),
            $request->validated('user_ids')
        );

        return ApiResponse::success(
            'Project members added successfully.',
            ProjectMemberResource::collection($members),
            201
        );
    }

    public function show(Project $project, ProjectMember $projectMember): JsonResponse
    {
        $projectMember = $this->projectMemberService->getProjectMember($project, $projectMember);

        Gate::authorize('view', $projectMember);

        return ApiResponse::success('Project member retrieved successfully.', new ProjectMemberResource($projectMember));
    }

    public function destroy(Project $project, ProjectMember $projectMember): JsonResponse
    {
        $projectMember = $this->projectMemberService->getProjectMember($project, $projectMember);

        Gate::authorize('delete', $projectMember);

        $this->projectMemberService->removeMember($project, $projectMember);

        return ApiResponse::success('Project member removed successfully.');
    }
}
