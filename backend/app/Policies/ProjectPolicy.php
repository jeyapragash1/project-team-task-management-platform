<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('projects.view');
    }

    public function view(User $user, Project $project): bool
    {
        return $this->isAdministrator($user)
            || $this->managesProject($user, $project)
            || $project->members()->whereKey($user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('projects.create');
    }

    public function update(User $user, Project $project): bool
    {
        return $this->isAdministrator($user)
            || ($user->can('projects.update') && $this->managesProject($user, $project));
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->isAdministrator($user)
            || ($user->can('projects.delete') && $this->managesProject($user, $project));
    }

    public function restore(User $user, Project $project): bool
    {
        return $this->isAdministrator($user);
    }

    public function archive(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }

    public function activate(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }

    private function isAdministrator(User $user): bool
    {
        return $user->hasRole('Administrator');
    }

    private function managesProject(User $user, Project $project): bool
    {
        return (int) $project->manager_id === (int) $user->id;
    }
}