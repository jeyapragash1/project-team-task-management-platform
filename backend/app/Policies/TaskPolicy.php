<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.view');
    }

    public function view(User $user, Task $task): bool
    {
        return $user->can('tasks.view') && $this->canAccessTask($user, $task);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->can('tasks.create') && $this->canManageProjectTasks($user, $project);
    }

    public function update(User $user, Task $task): bool
    {
        return $user->can('tasks.update') && $this->canManageProjectTasks($user, $task->project);
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->can('tasks.delete') && $this->canManageProjectTasks($user, $task->project);
    }

    public function restore(User $user, Task $task): bool
    {
        return $user->can('tasks.restore') && $this->canManageProjectTasks($user, $task->project);
    }

    public function assign(User $user, Task $task): bool
    {
        return $user->can('tasks.assign') && $this->canManageProjectTasks($user, $task->project);
    }

    public function updateStatus(User $user, Task $task): bool
    {
        if ($user->can('tasks.update') && $this->canManageProjectTasks($user, $task->project)) {
            return true;
        }

        return $user->can('tasks.update_progress')
            && (int) $task->assigned_to_id === (int) $user->id;
    }

    private function canAccessTask(User $user, Task $task): bool
    {
        return $user->hasRole('Administrator')
            || $this->managesProject($user, $task->project)
            || (int) $task->assigned_to_id === (int) $user->id;
    }

    private function canManageProjectTasks(User $user, Project $project): bool
    {
        return $user->hasRole('Administrator') || $this->managesProject($user, $project);
    }

    private function managesProject(User $user, Project $project): bool
    {
        return (int) $project->manager_id === (int) $user->id;
    }
}