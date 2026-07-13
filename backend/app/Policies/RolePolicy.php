<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function view(User $user, Role $role): bool
    {
        return $this->isAdministrator($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function update(User $user, Role $role): bool
    {
        return $this->isAdministrator($user) && ! $this->isProtectedRole($role);
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->isAdministrator($user) && ! $this->isProtectedRole($role);
    }

    public function assignPermissions(User $user, Role $role): bool
    {
        return $this->isAdministrator($user);
    }

    private function isAdministrator(User $user): bool
    {
        return $user->hasRole('Administrator');
    }

    private function isProtectedRole(Role $role): bool
    {
        return in_array($role->name, ['Administrator', 'Project Manager', 'Team Member'], true);
    }
}