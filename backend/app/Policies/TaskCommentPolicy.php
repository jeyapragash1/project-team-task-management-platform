<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;

class TaskCommentPolicy
{
    public function viewAny(User $user, Task $task): bool
    {
        return $user->can('comments.view') && $this->canAccessTaskComments($user, $task);
    }

    public function view(User $user, TaskComment $taskComment): bool
    {
        return $user->can('comments.view') && $this->canAccessTaskComments($user, $taskComment->task);
    }

    public function create(User $user, Task $task): bool
    {
        return $user->can('comments.create')
            && $user->can('tasks.comment')
            && $this->canAccessTaskComments($user, $task);
    }

    public function update(User $user, TaskComment $taskComment): bool
    {
        if (! $user->can('comments.update')) {
            return false;
        }

        return $user->hasRole('Administrator')
            || ((int) $taskComment->user_id === (int) $user->id && $this->isProjectMember($user, $taskComment->task));
    }

    public function delete(User $user, TaskComment $taskComment): bool
    {
        if (! $user->can('comments.delete')) {
            return false;
        }

        return $user->hasRole('Administrator')
            || ((int) $taskComment->user_id === (int) $user->id && $this->isProjectMember($user, $taskComment->task));
    }

    private function canAccessTaskComments(User $user, Task $task): bool
    {
        return $user->hasRole('Administrator') || $this->isProjectMember($user, $task);
    }

    private function isProjectMember(User $user, Task $task): bool
    {
        return $task->project->members()->whereKey($user->id)->exists();
    }
}