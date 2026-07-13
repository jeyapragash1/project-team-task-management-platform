<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\AssignTaskRequest;
use App\Http\Requests\Tasks\ListTasksRequest;
use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Services\Tasks\TaskService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService)
    {
    }

    public function index(ListTasksRequest $request): JsonResponse
    {
        $tasks = $this->taskService->paginate($request->user(), $request->validated());

        return ApiResponse::paginated('Tasks retrieved successfully.', $tasks, TaskResource::class);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $data = $request->validated();
        $project = Project::query()->findOrFail($data['project_id']);

        Gate::authorize('create', [Task::class, $project]);

        $task = $this->taskService->create($request->user(), $data);

        return ApiResponse::success('Task created successfully.', new TaskResource($task), 201);
    }

    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        return ApiResponse::success(
            'Task retrieved successfully.',
            new TaskResource($task->load(['project.manager', 'status', 'assignee.roles', 'creator.roles'])->loadCount('comments'))
        );
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->update($task, $request->validated());

        return ApiResponse::success('Task updated successfully.', new TaskResource($task));
    }

    public function destroy(Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $this->taskService->delete($task);

        return ApiResponse::success('Task deleted successfully.');
    }

    public function restore(int|string $task): JsonResponse
    {
        $restorableTask = Task::withTrashed()->findOrFail($task);

        Gate::authorize('restore', $restorableTask);

        $task = $this->taskService->restore($task);

        return ApiResponse::success('Task restored successfully.', new TaskResource($task));
    }

    public function assign(AssignTaskRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->assign($task, (int) $request->validated('assigned_to_id'));

        return ApiResponse::success('Task assigned successfully.', new TaskResource($task));
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        $task = $this->taskService->updateStatus($task, $request->validated());

        return ApiResponse::success('Task status updated successfully.', new TaskResource($task));
    }
}