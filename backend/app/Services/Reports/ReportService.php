<?php

namespace App\Services\Reports;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function users(User $actor, array $filters): array
    {
        $users = $this->userScope($actor);
        $this->applyDateRange($users, $filters, 'users.created_at');
        $this->applyRoleFilter($users, $filters['role'] ?? null);

        return $this->report('users', $actor, $filters, [
            'total_users' => (clone $users)->count(),
            'active_users' => (clone $users)->where('is_active', true)->count(),
            'inactive_users' => (clone $users)->where('is_active', false)->count(),
        ], [
            'by_role' => $this->usersByRole($users),
            'by_status' => collect([
                ['status' => 'active', 'total' => (clone $users)->where('is_active', true)->count()],
                ['status' => 'inactive', 'total' => (clone $users)->where('is_active', false)->count()],
            ]),
        ], $this->userTable($users, $this->limit($filters)));
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function projects(User $actor, array $filters): array
    {
        $projects = $this->projectScope($actor);
        $this->applyDateRange($projects, $filters, 'projects.created_at');
        $this->applyProjectFilter($projects, $filters['project_id'] ?? null);
        $this->applyProjectUserFilter($projects, $filters['user_id'] ?? null);

        return $this->report('projects', $actor, $filters, [
            'total_projects' => (clone $projects)->count(),
            'active_projects' => (clone $projects)->where('status', 'active')->count(),
            'archived_projects' => (clone $projects)->where('status', 'archived')->count(),
            'completed_projects' => (clone $projects)->where('status', 'completed')->count(),
        ], [
            'by_status' => $this->projectsByStatus($projects),
            'by_manager' => $this->projectsByManager($projects),
        ], $this->projectTable($projects, $this->limit($filters)));
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function tasks(User $actor, array $filters): array
    {
        $tasks = $this->taskScope($actor);
        $this->applyTaskFilters($tasks, $filters);

        return $this->report('tasks', $actor, $filters, [
            'total_tasks' => (clone $tasks)->count(),
            'assigned_tasks' => (clone $tasks)->whereNotNull('assigned_to_id')->count(),
            'unassigned_tasks' => (clone $tasks)->whereNull('assigned_to_id')->count(),
            'completed_tasks' => (clone $tasks)->whereNotNull('completed_at')->count(),
            'overdue_tasks' => $this->overdueTasksCount(clone $tasks),
            'average_progress' => round((float) (clone $tasks)->avg('progress'), 2),
        ], [
            'by_status' => $this->tasksByStatus($tasks),
            'by_priority' => $this->tasksByPriority($tasks),
        ], $this->taskTable($tasks, $this->limit($filters)));
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function projectProgress(User $actor, array $filters): array
    {
        $projects = $this->projectScope($actor)
            ->with('manager.roles')
            ->withCount([
                'tasks as total_tasks' => fn (Builder $query) => $this->applyTaskFilters($query, $filters),
                'tasks as completed_tasks' => fn (Builder $query) => $this->applyTaskFilters($query->whereNotNull('completed_at'), $filters),
                'tasks as overdue_tasks' => fn (Builder $query) => $this->applyTaskFilters($this->overdueTasksQuery($query), $filters),
            ])
            ->withAvg(['tasks as average_progress' => fn (Builder $query) => $this->applyTaskFilters($query, $filters)], 'progress');

        $this->applyDateRange($projects, $filters, 'projects.created_at');
        $this->applyProjectFilter($projects, $filters['project_id'] ?? null);
        $this->applyProjectUserFilter($projects, $filters['user_id'] ?? null);

        $table = $projects
            ->orderBy('due_date')
            ->limit($this->limit($filters))
            ->get()
            ->map(fn (Project $project): array => [
                'project_id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'manager' => $project->manager?->name,
                'total_tasks' => (int) $project->total_tasks,
                'completed_tasks' => (int) $project->completed_tasks,
                'overdue_tasks' => (int) $project->overdue_tasks,
                'average_progress' => round((float) $project->average_progress, 2),
            ]);

        return $this->report('project_progress', $actor, $filters, [
            'total_projects' => $table->count(),
            'average_progress' => round((float) $table->avg('average_progress'), 2),
            'total_tasks' => (int) $table->sum('total_tasks'),
            'completed_tasks' => (int) $table->sum('completed_tasks'),
            'overdue_tasks' => (int) $table->sum('overdue_tasks'),
        ], [
            'project_progress' => $table->map(fn (array $row): array => [
                'project_id' => $row['project_id'],
                'name' => $row['name'],
                'average_progress' => $row['average_progress'],
            ])->values(),
        ], $table);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function workload(User $actor, array $filters): array
    {
        $users = $this->userScope($actor)->with('roles');
        $this->applyRoleFilter($users, $filters['role'] ?? null);
        $this->applyUserFilter($users, $filters['user_id'] ?? null);

        $users->withCount([
            'assignedTasks as assigned_tasks' => fn (Builder $query) => $this->applyTaskFilters($query, $filters),
            'assignedTasks as completed_tasks' => fn (Builder $query) => $this->applyTaskFilters($query->whereNotNull('completed_at'), $filters),
            'assignedTasks as overdue_tasks' => fn (Builder $query) => $this->applyTaskFilters($this->overdueTasksQuery($query), $filters),
        ])->withAvg(['assignedTasks as average_progress' => fn (Builder $query) => $this->applyTaskFilters($query, $filters)], 'progress');

        $table = $users
            ->orderBy('name')
            ->limit($this->limit($filters))
            ->get()
            ->map(fn (User $user): array => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->values(),
                'assigned_tasks' => (int) $user->assigned_tasks,
                'completed_tasks' => (int) $user->completed_tasks,
                'overdue_tasks' => (int) $user->overdue_tasks,
                'average_progress' => round((float) $user->average_progress, 2),
            ]);

        return $this->report('workload', $actor, $filters, [
            'total_users' => $table->count(),
            'assigned_tasks' => (int) $table->sum('assigned_tasks'),
            'completed_tasks' => (int) $table->sum('completed_tasks'),
            'overdue_tasks' => (int) $table->sum('overdue_tasks'),
            'average_progress' => round((float) $table->avg('average_progress'), 2),
        ], [
            'workload_by_user' => $table->map(fn (array $row): array => [
                'user_id' => $row['user_id'],
                'name' => $row['name'],
                'assigned_tasks' => $row['assigned_tasks'],
                'completed_tasks' => $row['completed_tasks'],
                'overdue_tasks' => $row['overdue_tasks'],
            ])->values(),
        ], $table);
    }

    private function userScope(User $actor): Builder
    {
        $query = User::query();

        if ($actor->hasRole('Administrator')) {
            return $query;
        }

        return $query->whereHas('projectMemberships.project', fn (Builder $query) => $query->where('manager_id', $actor->id));
    }

    private function projectScope(User $actor): Builder
    {
        $query = Project::query();

        if ($actor->hasRole('Administrator')) {
            return $query;
        }

        return $query->where('manager_id', $actor->id);
    }

    private function taskScope(User $actor): Builder
    {
        $query = Task::query();

        if ($actor->hasRole('Administrator')) {
            return $query;
        }

        return $query->whereHas('project', fn (Builder $query) => $query->where('manager_id', $actor->id));
    }

    /**
     * @param array<string, mixed> $filters
     * @param array<string, mixed> $summary
     * @param array<string, Collection<int, mixed>> $charts
     * @param Collection<int, mixed> $table
     * @return array<string, mixed>
     */
    private function report(string $type, User $actor, array $filters, array $summary, array $charts, Collection $table): array
    {
        return [
            'type' => $type,
            'scope' => $actor->hasRole('Administrator') ? 'system' : 'managed_projects',
            'filters' => $filters,
            'summary' => $summary,
            'charts' => $charts,
            'table' => $table->values(),
        ];
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyTaskFilters(Builder $query, array $filters): void
    {
        $this->applyDateRange($query, $filters, 'created_at');
        $this->applyProjectFilter($query, $filters['project_id'] ?? null);
        $this->applyUserTaskFilter($query, $filters['user_id'] ?? null);

        if (! empty($filters['task_status_id'])) {
            $query->where('status_id', $filters['task_status_id']);
        }
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyDateRange(Builder $query, array $filters, string $column): void
    {
        if (! empty($filters['date_from'])) {
            $query->whereDate($column, '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate($column, '<=', $filters['date_to']);
        }
    }

    private function applyRoleFilter(Builder $query, mixed $role): void
    {
        if (! is_string($role) || $role === '') {
            return;
        }

        $query->whereHas('roles', fn (Builder $query) => $query->where('name', $role));
    }

    private function applyProjectFilter(Builder $query, mixed $projectId): void
    {
        if ($projectId === null || $projectId === '') {
            return;
        }

        if ($query->getModel() instanceof Project) {
            $query->whereKey($projectId);

            return;
        }

        $query->where('project_id', $projectId);
    }

    private function applyProjectUserFilter(Builder $query, mixed $userId): void
    {
        if ($userId === null || $userId === '') {
            return;
        }

        $query->where(function (Builder $query) use ($userId): void {
            $query->where('manager_id', $userId)
                ->orWhere('created_by_id', $userId);
        });
    }

    private function applyUserTaskFilter(Builder $query, mixed $userId): void
    {
        if ($userId === null || $userId === '') {
            return;
        }

        $query->where('assigned_to_id', $userId);
    }

    private function applyUserFilter(Builder $query, mixed $userId): void
    {
        if ($userId === null || $userId === '') {
            return;
        }

        $query->whereKey($userId);
    }

    private function overdueTasksQuery(Builder $query): Builder
    {
        return $query->whereDate('due_date', '<', now()->toDateString())->whereNull('completed_at');
    }

    private function overdueTasksCount(Builder $query): int
    {
        return $this->overdueTasksQuery($query)->count();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function usersByRole(Builder $users): Collection
    {
        return (clone $users)
            ->join('model_has_roles', 'model_has_roles.model_id', '=', 'users.id')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', User::class)
            ->selectRaw('roles.name as role, COUNT(DISTINCT users.id) as total')
            ->groupBy('roles.name')
            ->orderBy('roles.name')
            ->get()
            ->map(fn (object $row): array => ['role' => $row->role, 'total' => (int) $row->total]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function projectsByStatus(Builder $projects): Collection
    {
        return (clone $projects)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (Project $project): array => ['status' => $project->status, 'total' => (int) $project->total]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function projectsByManager(Builder $projects): Collection
    {
        return (clone $projects)
            ->join('users', 'users.id', '=', 'projects.manager_id')
            ->selectRaw('users.id as manager_id, users.name as manager_name, COUNT(projects.id) as total')
            ->groupBy('users.id', 'users.name')
            ->orderBy('users.name')
            ->get()
            ->map(fn (object $row): array => [
                'manager_id' => (int) $row->manager_id,
                'manager_name' => $row->manager_name,
                'total' => (int) $row->total,
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function tasksByStatus(Builder $tasks): Collection
    {
        $counts = (clone $tasks)
            ->selectRaw('status_id, COUNT(*) as total')
            ->groupBy('status_id')
            ->pluck('total', 'status_id');

        return TaskStatus::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (TaskStatus $status): array => [
                'status_id' => $status->id,
                'name' => $status->name,
                'slug' => $status->slug,
                'total' => (int) ($counts[$status->id] ?? 0),
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function tasksByPriority(Builder $tasks): Collection
    {
        return (clone $tasks)
            ->selectRaw('priority, COUNT(*) as total')
            ->groupBy('priority')
            ->orderBy('priority')
            ->get()
            ->map(fn (Task $task): array => ['priority' => $task->priority, 'total' => (int) $task->total]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function userTable(Builder $users, int $limit): Collection
    {
        return (clone $users)
            ->with('roles')
            ->withCount(['projects', 'assignedTasks'])
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn (User $user): array => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('name')->values(),
                'projects_count' => (int) $user->projects_count,
                'assigned_tasks_count' => (int) $user->assigned_tasks_count,
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function projectTable(Builder $projects, int $limit): Collection
    {
        return (clone $projects)
            ->with('manager.roles')
            ->withCount('tasks')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Project $project): array => [
                'project_id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'manager' => $project->manager?->name,
                'tasks_count' => (int) $project->tasks_count,
                'created_at' => $project->created_at,
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function taskTable(Builder $tasks, int $limit): Collection
    {
        return (clone $tasks)
            ->with(['project', 'status', 'assignee.roles'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Task $task): array => [
                'task_id' => $task->id,
                'title' => $task->title,
                'project' => $task->project?->name,
                'status' => $task->status?->name,
                'priority' => $task->priority,
                'assignee' => $task->assignee?->name,
                'progress' => $task->progress,
                'due_date' => $task->due_date,
                'completed_at' => $task->completed_at,
            ]);
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function limit(array $filters): int
    {
        return (int) ($filters['limit'] ?? 25);
    }
}