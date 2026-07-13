<?php

namespace App\Services\Roles;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleService
{
    /** @var list<string> */
    private array $protectedRoles = ['Administrator', 'Project Manager', 'Team Member'];

    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Role::query()->with('permissions');

        $this->applySearch($query, $filters['search'] ?? null);
        $this->applyGuardFilter($query, $filters['guard_name'] ?? null);

        $sort = $filters['sort'] ?? 'name';
        $direction = $filters['direction'] ?? 'asc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): Role
    {
        $permissions = Arr::pull($data, 'permissions', []);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        if ($permissions !== []) {
            $role->syncPermissions($permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role->load('permissions');
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(Role $role, array $data): Role
    {
        $this->ensureRoleIsNotProtected($role, 'Protected system roles cannot be renamed.');

        $role->forceFill([
            'name' => $data['name'],
        ])->save();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role->refresh()->load('permissions');
    }

    public function delete(Role $role): void
    {
        $this->ensureRoleIsNotProtected($role, 'Protected system roles cannot be deleted.');

        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => ['This role is assigned to users and cannot be deleted.'],
            ]);
        }

        $role->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @param list<string> $permissions
     */
    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role->refresh()->load('permissions');
    }

    /**
     * @param list<string> $permissions
     */
    public function removePermissions(Role $role, array $permissions): Role
    {
        foreach ($permissions as $permission) {
            $role->revokePermissionTo($permission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role->refresh()->load('permissions');
    }

    private function ensureRoleIsNotProtected(Role $role, string $message): void
    {
        if (in_array($role->name, $this->protectedRoles, true)) {
            throw ValidationException::withMessages([
                'role' => [$message],
            ]);
        }
    }

    private function applySearch(Builder $query, mixed $search): void
    {
        if (! is_string($search) || $search === '') {
            return;
        }

        $query->where('name', 'like', "%{$search}%");
    }

    private function applyGuardFilter(Builder $query, mixed $guardName): void
    {
        if (! is_string($guardName) || $guardName === '') {
            return;
        }

        $query->where('guard_name', $guardName);
    }
}