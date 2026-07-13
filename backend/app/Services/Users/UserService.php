<?php

namespace App\Services\Users;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class UserService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = User::query()->with('roles');

        $this->applySearch($query, $filters['search'] ?? null);
        $this->applyRoleFilter($query, $filters['role'] ?? null);
        $this->applyStatusFilter($query, $filters['status'] ?? null);
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
    public function create(array $data): User
    {
        $roles = Arr::pull($data, 'roles', []);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        $user->syncRoles($roles);

        return $user->load('roles');
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(User $user, array $data): User
    {
        $roles = Arr::pull($data, 'roles', []);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->fill($data);
        $user->save();
        $user->syncRoles($roles);

        return $user->refresh()->load('roles');
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function restore(int|string $userId): User
    {
        $user = User::withTrashed()->findOrFail($userId);
        $user->restore();

        return $user->load('roles');
    }

    public function updateStatus(User $user, bool $isActive): User
    {
        $user->forceFill(['is_active' => $isActive])->save();

        return $user->refresh()->load('roles');
    }

    private function applySearch(Builder $query, mixed $search): void
    {
        if (! is_string($search) || $search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($search): void {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    private function applyRoleFilter(Builder $query, mixed $role): void
    {
        if (! is_string($role) || $role === '') {
            return;
        }

        $query->role($role);
    }

    private function applyStatusFilter(Builder $query, mixed $status): void
    {
        if ($status === 'active') {
            $query->where('is_active', true);
        }

        if ($status === 'inactive') {
            $query->where('is_active', false);
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