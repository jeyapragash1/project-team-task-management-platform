<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;

class ProjectMemberPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('project_members.view') && $this->canManageProjectMembers($user, $project);
    }

    public function view(User $user, ProjectMember $projectMember): bool
    {
        return $user->can('project_members.view')
            && $this->canManageProjectMembers($user, $projectMember->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->can('project_members.manage') && $this->canManageProjectMembers($user, $project);
    }

    public function delete(User $user, ProjectMember $projectMember): bool
    {
        return $user->can('project_members.manage')
            && $this->canManageProjectMembers($user, $projectMember->project);
    }

    private function canManageProjectMembers(User $user, Project $project): bool
    {
        return $user->hasRole('Administrator')
            || (int) $project->manager_id === (int) $user->id;
    }
}
