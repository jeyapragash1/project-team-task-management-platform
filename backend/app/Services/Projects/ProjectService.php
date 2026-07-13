<?php

namespace App\Services\Projects;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProjectService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $query = Project::query()
            ->with(['manager', 'creator'])
            ->withCount(['tasks', 'members']);

        $this->applyVisibilityScope($query, $actor);
        $this->applySearch($query, $filters['search'] ?? null);
        $this->applySimpleFilter($query, 'status', $filters['status'] ?? null);
        $this->applySimpleFilter($query, 'manager_id', $filters['manager_id'] ?? null);
        $this->applySimpleFilter($query, 'created_by_id', $filters['created_by_id'] ?? null);
        $this->applyDueDateFilters($query, $filters);
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
    public function create(User $actor, array $data): Project
    {
        $this->validateManagerAssignment($actor, (int) $data['manager_id']);

        $data['slug'] = $this->prepareSlug($data['slug'] ?? null, $data['name']);
        $data['status'] = $data['status'] ?? 'active';
        $data['created_by_id'] = $actor->id;

        $project = Project::create($data);

        return $project->load(['manager', 'creator'])->loadCount(['tasks', 'members']);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function update(User $actor, Project $project, array $data): Project
    {
        $this->validateManagerAssignment($actor, (int) $data['manager_id']);

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->prepareSlug($data['slug'], $data['name']);
        }

        $project->fill($data);
        $project->save();

        return $project->refresh()->load(['manager', 'creator'])->loadCount(['tasks', 'members']);
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    public function restore(int|string $projectId): Project
    {
        $project = Project::withTrashed()->findOrFail($projectId);
        $project->restore();

        return $project->load(['manager', 'creator'])->loadCount(['tasks', 'members']);
    }

    public function archive(Project $project): Project
    {
        $project->forceFill(['status' => 'archived'])->save();

        return $project->refresh()->load(['manager', 'creator'])->loadCount(['tasks', 'members']);
    }

    public function activate(Project $project): Project
    {
        $project->forceFill(['status' => 'active'])->save();

        return $project->refresh()->load(['manager', 'creator'])->loadCount(['tasks', 'members']);
    }

    private function validateManagerAssignment(User $actor, int $managerId): void
    {
        $manager = User::query()->findOrFail($managerId);

        if (! $manager->hasRole('Project Manager')) {
            throw ValidationException::withMessages([
                'manager_id' => ['The selected manager must have the Project Manager role.'],
            ]);
        }

        if (! $actor->hasRole('Administrator') && $actor->id !== $manager->id) {
            throw ValidationException::withMessages([
                'manager_id' => ['Project managers may only assign themselves as project manager.'],
            ]);
        }
    }

    private function prepareSlug(?string $slug, string $name): string
    {
        return Str::slug($slug ?: $name);
    }

    private function applyVisibilityScope(Builder $query, User $actor): void
    {
        if ($actor->hasRole('Administrator')) {
            return;
        }

        if ($actor->hasRole('Project Manager')) {
            $query->where(function (Builder $query) use ($actor): void {
                $query->where('manager_id', $actor->id)
                    ->orWhere('created_by_id', $actor->id);
            });

            return;
        }

        $query->whereHas('members', fn (Builder $query) => $query->whereKey($actor->id));
    }

    private function applySearch(Builder $query, mixed $search): void
    {
        if (! is_string($search) || $search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($search): void {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    private function applySimpleFilter(Builder $query, string $column, mixed $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $query->where($column, $value);
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyDueDateFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['due_from'])) {
            $query->whereDate('due_date', '>=', $filters['due_from']);
        }

        if (! empty($filters['due_to'])) {
            $query->whereDate('due_date', '<=', $filters['due_to']);
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