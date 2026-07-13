<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function view(User $user, Permission $permission): bool
    {
        return $this->isAdministrator($user);
    }

    private function isAdministrator(User $user): bool
    {
        return $user->hasRole('Administrator');
    }
}