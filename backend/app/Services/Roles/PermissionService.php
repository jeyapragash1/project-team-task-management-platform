<?php

namespace App\Services\Roles;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Permission::query();

        $this->applySearch($query, $filters['search'] ?? null);
        $this->applyGuardFilter($query, $filters['guard_name'] ?? null);

        $sort = $filters['sort'] ?? 'name';
        $direction = $filters['direction'] ?? 'asc';
        $perPage = (int) ($filters['per_page'] ?? 50);

        return $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
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