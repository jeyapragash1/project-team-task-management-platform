<?php

namespace App\Services\Tasks;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class TaskService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $query = Task::query()
            ->with(['project.manager', 'status', 'assignee.roles', 'creator.roles'])
            ->withCount('comments');

        $this->applyVisibilityScope($query, $actor);
        $this->applySearch($query, $filters['search'] ?? null);
        $this->applySimpleFilter($query, 'project_id', $filters['project_id'] ?? null);
        $this->applySimpleFilter($query, 'status_id', $filters['status_id'] ?? null);
        $this->applySimpleFilter($query, 'assigned_to_id', $filters['assigned_to_id'] ?? null);
        $this->applySimpleFilter($query, 'created_by_id', $filters['created_by_id'] ?? null);
        $this->applySimpleFilter($query, 'priority', $filters['priority'] ?? null);
        $this->applyDueDateFilters($query, $filters);
        $this->applyTrashedFilter($query, $filters['trashed'] ?? null);

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(User $actor, array $data): Task
    {
        $project = Project::query()->findOrFail($data['project_id']);

        if (! empty($data['assigned_to_id'])) {
            $this->validateAssigneeBelongsToProject($project, (int) $data['assigned_to_id']);
        }

        $data['created_by_id'] = $actor->id;
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['progress'] = $data['progress'] ?? 0;
        $data['completed_at'] = $this->completedAtValue((int) $data['status_id'], (int) $data['progress']);

        $task = Task::create($data);

        return $this->loadTask($task);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Task $task, array $data): Task
    {
        if (array_key_exists('assigned_to_id', $data) && $data['assigned_to_id'] !== null) {
            $this->validateAssigneeBelongsToProject($task->project, (int) $data['assigned_to_id']);
        }

        $statusId = (int) ($data['status_id'] ?? $task->status_id);
        $progress = (int) ($data['progress'] ?? $task->progress);

        if (array_key_exists('status_id', $data) || array_key_exists('progress', $data)) {
            $data['completed_at'] = $this->completedAtValue($statusId, $progress);
        }

        $task->fill($data);
        $task->save();

        return $this->loadTask($task->refresh());
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }

    public function restore(int|string $taskId): Task
    {
        $task = Task::withTrashed()->findOrFail($taskId);
        $task->restore();

        return $this->loadTask($task);
    }

    public function assign(Task $task, int $assigneeId): Task
    {
        $this->validateAssigneeBelongsToProject($task->project, $assigneeId);

        $task->forceFill(['assigned_to_id' => $assigneeId])->save();

        return $this->loadTask($task->refresh());
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateStatus(Task $task, array $data): Task
    {
        $statusId = (int) $data['status_id'];
        $progress = (int) ($data['progress'] ?? $task->progress);

        $task->forceFill([
            'status_id' => $statusId,
            'progress' => $progress,
            'completed_at' => $this->completedAtValue($statusId, $progress),
        ])->save();

        return $this->loadTask($task->refresh());
    }

    private function loadTask(Task $task): Task
    {
        return $task->load(['project.manager', 'status', 'assignee.roles', 'creator.roles'])->loadCount('comments');
    }

    private function validateAssigneeBelongsToProject(Project $project, int $assigneeId): void
    {
        $assignee = User::query()->findOrFail($assigneeId);

        if (! $assignee->is_active) {
            throw ValidationException::withMessages([
                'assigned_to_id' => ['The selected assignee must be an active user.'],
            ]);
        }

        if (! $project->members()->whereKey($assigneeId)->exists()) {
            throw ValidationException::withMessages([
                'assigned_to_id' => ['The selected assignee must be a member of the task project.'],
            ]);
        }
    }

    private function completedAtValue(int $statusId, int $progress): ?string
    {
        $status = TaskStatus::query()->findOrFail($statusId);

        if ($progress === 100 || $status->slug === 'completed') {
            return now()->toDateTimeString();
        }

        return null;
    }

    private function applyVisibilityScope(Builder $query, User $actor): void
    {
        if ($actor->hasRole('Administrator')) {
            return;
        }

        if ($actor->hasRole('Project Manager')) {
            $query->whereHas('project', fn (Builder $query) => $query->where('manager_id', $actor->id));

            return;
        }

        $query->where('assigned_to_id', $actor->id);
    }

    private function applySearch(Builder $query, mixed $search): void
    {
        if (! is_string($search) || $search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($search): void {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    private function applySimpleFilter(Builder $query, string $column, mixed $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $query->where($column, $value);
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyDueDateFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['due_from'])) {
            $query->whereDate('due_date', '>=', $filters['due_from']);
        }

        if (! empty($filters['due_to'])) {
            $query->whereDate('due_date', '<=', $filters['due_to']);
        }
    }

    private function applyTrashedFilter(Builder $query, mixed $trashed): void
    {
        if ($trashed === 'with') {
            $query->withTrashed();
        }

        if ($trashed === 'only') {
            $query->onlyTrashed();
        }
    }
}