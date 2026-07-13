<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function view(User $user, User $model): bool
    {
        return $this->isAdministrator($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdministrator($user);
    }

    public function update(User $user, User $model): bool
    {
        return $this->isAdministrator($user);
    }

    public function delete(User $user, User $model): bool
    {
        return $this->isAdministrator($user) && $user->isNot($model);
    }

    public function restore(User $user, User $model): bool
    {
        return $this->isAdministrator($user);
    }

    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }

    public function activate(User $user, User $model): bool
    {
        return $this->isAdministrator($user) && $user->isNot($model);
    }

    private function isAdministrator(User $user): bool
    {
        return $user->hasRole('Administrator');
    }
}