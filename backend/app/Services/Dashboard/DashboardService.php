<?php

namespace App\Services\Dashboard;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function getDashboard(User $actor): array
    {
        if ($actor->hasRole('Administrator')) {
            return $this->administratorDashboard();
        }

        if ($actor->hasRole('Project Manager')) {
            return $this->projectManagerDashboard($actor);
        }

        return $this->teamMemberDashboard($actor);
    }

    /**
     * @return array<string, mixed>
     */
    private function administratorDashboard(): array
    {
        $projects = Project::query();
        $tasks = Task::query();

        return [
            'role' => 'Administrator',
            'scope' => 'system',
            'statistics' => [
                'total_users' => User::query()->count(),
                'active_users' => User::query()->where('is_active', true)->count(),
                'total_projects' => (clone $projects)->count(),
                'active_projects' => (clone $projects)->where('status', 'active')->count(),
                'archived_projects' => (clone $projects)->where('status', 'archived')->count(),
                'total_tasks' => (clone $tasks)->count(),
                'overdue_tasks' => $this->overdueTasksCount(clone $tasks),
                'assigned_tasks' => (clone $tasks)->whereNotNull('assigned_to_id')->count(),
                'completed_tasks' => $this->completedTasksCount(clone $tasks),
            ],
            'tasks_by_status' => $this->tasksByStatus($tasks),
            'recent_activity' => $this->recentActivity(ActivityLog::query()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function projectManagerDashboard(User $actor): array
    {
        $projects = Project::query()->where('manager_id', $actor->id);
        $tasks = Task::query()->whereHas('project', fn (Builder $query) => $query->where('manager_id', $actor->id));
        $projectMemberUsers = User::query()
            ->whereHas('projectMemberships.project', fn (Builder $query) => $query->where('manager_id', $actor->id));

        return [
            'role' => 'Project Manager',
            'scope' => 'managed_projects',
            'statistics' => [
                'total_users' => (clone $projectMemberUsers)->distinct('users.id')->count('users.id'),
                'active_users' => (clone $projectMemberUsers)->where('is_active', true)->distinct('users.id')->count('users.id'),
                'total_projects' => (clone $projects)->count(),
                'active_projects' => (clone $projects)->where('status', 'active')->count(),
                'archived_projects' => (clone $projects)->where('status', 'archived')->count(),
                'total_tasks' => (clone $tasks)->count(),
                'overdue_tasks' => $this->overdueTasksCount(clone $tasks),
                'assigned_tasks' => (clone $tasks)->whereNotNull('assigned_to_id')->count(),
                'completed_tasks' => $this->completedTasksCount(clone $tasks),
            ],
            'tasks_by_status' => $this->tasksByStatus($tasks),
            'recent_activity' => $this->recentActivity($this->managedProjectsActivityQuery($actor)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function teamMemberDashboard(User $actor): array
    {
        $projects = Project::query()->whereHas('members', fn (Builder $query) => $query->whereKey($actor->id));
        $tasks = Task::query()->where('assigned_to_id', $actor->id);

        return [
            'role' => 'Team Member',
            'scope' => 'personal_workload',
            'statistics' => [
                'total_users' => 1,
                'active_users' => $actor->is_active ? 1 : 0,
                'total_projects' => (clone $projects)->count(),
                'active_projects' => (clone $projects)->where('status', 'active')->count(),
                'archived_projects' => (clone $projects)->where('status', 'archived')->count(),
                'total_tasks' => (clone $tasks)->count(),
                'overdue_tasks' => $this->overdueTasksCount(clone $tasks),
                'assigned_tasks' => (clone $tasks)->count(),
                'completed_tasks' => $this->completedTasksCount(clone $tasks),
            ],
            'tasks_by_status' => $this->tasksByStatus($tasks),
            'recent_activity' => $this->recentActivity($this->teamMemberActivityQuery($actor)),
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function tasksByStatus(Builder $taskScope): Collection
    {
        $counts = (clone $taskScope)
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

    private function overdueTasksCount(Builder $query): int
    {
        return $query
            ->whereDate('due_date', '<', now()->toDateString())
            ->whereNull('completed_at')
            ->count();
    }

    private function completedTasksCount(Builder $query): int
    {
        return $query->whereNotNull('completed_at')->count();
    }

    /**
     * @return Collection<int, ActivityLog>
     */
    private function recentActivity(Builder $query): Collection
    {
        return $query
            ->with('user.roles')
            ->latest('created_at')
            ->limit(10)
            ->get();
    }

    private function managedProjectsActivityQuery(User $actor): Builder
    {
        return ActivityLog::query()->where(function (Builder $query) use ($actor): void {
            $query->where(function (Builder $query) use ($actor): void {
                $query->where('subject_type', Project::class)
                    ->whereIn('subject_id', Project::query()->select('id')->where('manager_id', $actor->id));
            })->orWhere(function (Builder $query) use ($actor): void {
                $query->where('subject_type', Task::class)
                    ->whereIn('subject_id', Task::query()
                        ->select('tasks.id')
                        ->join('projects', 'projects.id', '=', 'tasks.project_id')
                        ->where('projects.manager_id', $actor->id));
            })->orWhere(function (Builder $query) use ($actor): void {
                $query->where('subject_type', TaskComment::class)
                    ->whereIn('subject_id', TaskComment::query()
                        ->select('task_comments.id')
                        ->join('tasks', 'tasks.id', '=', 'task_comments.task_id')
                        ->join('projects', 'projects.id', '=', 'tasks.project_id')
                        ->where('projects.manager_id', $actor->id));
            });
        });
    }

    private function teamMemberActivityQuery(User $actor): Builder
    {
        return ActivityLog::query()->where(function (Builder $query) use ($actor): void {
            $query->where('user_id', $actor->id)
                ->orWhere(function (Builder $query) use ($actor): void {
                    $query->where('subject_type', Task::class)
                        ->whereIn('subject_id', Task::query()->select('id')->where('assigned_to_id', $actor->id));
                })
                ->orWhere(function (Builder $query) use ($actor): void {
                    $query->where('subject_type', TaskComment::class)
                        ->whereIn('subject_id', TaskComment::query()
                            ->select('task_comments.id')
                            ->join('tasks', 'tasks.id', '=', 'task_comments.task_id')
                            ->where('tasks.assigned_to_id', $actor->id));
                });
        });
    }
}