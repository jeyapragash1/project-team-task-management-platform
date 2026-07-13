<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskComments\ListTaskCommentsRequest;
use App\Http\Requests\TaskComments\StoreTaskCommentRequest;
use App\Http\Requests\TaskComments\UpdateTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\Tasks\TaskCommentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TaskCommentController extends Controller
{
    public function __construct(private readonly TaskCommentService $taskCommentService)
    {
    }

    public function index(ListTaskCommentsRequest $request, Task $task): JsonResponse
    {
        $comments = $this->taskCommentService->paginate($task, $request->validated());

        return ApiResponse::paginated('Task comments retrieved successfully.', $comments, TaskCommentResource::class);
    }

    public function store(StoreTaskCommentRequest $request, Task $task): JsonResponse
    {
        $comment = $this->taskCommentService->create($task, $request->user(), $request->validated());

        return ApiResponse::success('Task comment created successfully.', new TaskCommentResource($comment), 201);
    }

    public function show(Task $task, TaskComment $taskComment): JsonResponse
    {
        $taskComment = $this->taskCommentService->getTaskComment($task, $taskComment);

        Gate::authorize('view', $taskComment);

        return ApiResponse::success('Task comment retrieved successfully.', new TaskCommentResource($taskComment));
    }

    public function update(UpdateTaskCommentRequest $request, Task $task, TaskComment $taskComment): JsonResponse
    {
        $taskComment = $this->taskCommentService->update($task, $taskComment, $request->validated());

        return ApiResponse::success('Task comment updated successfully.', new TaskCommentResource($taskComment));
    }

    public function destroy(Task $task, TaskComment $taskComment): JsonResponse
    {
        $taskComment = $this->taskCommentService->getTaskComment($task, $taskComment);

        Gate::authorize('delete', $taskComment);

        $this->taskCommentService->delete($task, $taskComment);

        return ApiResponse::success('Task comment deleted successfully.');
    }
}