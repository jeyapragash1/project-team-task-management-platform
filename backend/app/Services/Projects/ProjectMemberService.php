<?php

namespace App\Services\Projects;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProjectMemberService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(Project $project, array $filters): LengthAwarePaginator
    {
        $query = ProjectMember::query()
            ->whereBelongsTo($project)
            ->with(['user.roles', 'addedBy.roles']);

        $this->applySearch($query, $filters['search'] ?? null);
        $this->applyRoleFilter($query, $filters['role'] ?? null);
        $this->applyStatusFilter($query, $filters['status'] ?? null);

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 15);

        return $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param array<int, int> $userIds
     * @return Collection<int, ProjectMember>
     */
    public function addMembers(Project $project, User $actor, array $userIds): Collection
    {
        $userIds = array_values(array_unique(array_map('intval', $userIds)));

        $inactiveUserIds = User::query()
            ->whereIn('id', $userIds)
            ->where('is_active', false)
            ->pluck('id')
            ->all();

        if ($inactiveUserIds !== []) {
            throw ValidationException::withMessages([
                'user_ids' => ['Inactive users cannot be added to projects.'],
            ]);
        }

        $existingUserIds = ProjectMember::query()
            ->whereBelongsTo($project)
            ->whereIn('user_id', $userIds)
            ->pluck('user_id')
            ->all();

        if ($existingUserIds !== []) {
            throw ValidationException::withMessages([
                'user_ids' => ['One or more selected users are already project members.'],
            ]);
        }

        DB::transaction(function () use ($project, $actor, $userIds): void {
            foreach ($userIds as $userId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id' => $userId,
                    'added_by_id' => $actor->id,
                ]);
            }
        });

        return ProjectMember::query()
            ->whereBelongsTo($project)
            ->whereIn('user_id', $userIds)
            ->with(['user.roles', 'addedBy.roles'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getProjectMember(Project $project, ProjectMember $projectMember): ProjectMember
    {
        $this->ensureMemberBelongsToProject($project, $projectMember);

        return $projectMember->load(['user.roles', 'addedBy.roles']);
    }

    public function removeMember(Project $project, ProjectMember $projectMember): void
    {
        $this->ensureMemberBelongsToProject($project, $projectMember);

        $projectMember->delete();
    }

    private function ensureMemberBelongsToProject(Project $project, ProjectMember $projectMember): void
    {
        if ((int) $projectMember->project_id !== (int) $project->id) {
            throw (new ModelNotFoundException())->setModel(ProjectMember::class, [$projectMember->id]);
        }
    }

    private function applySearch(Builder $query, mixed $search): void
    {
        if (! is_string($search) || $search === '') {
            return;
        }

        $query->whereHas('user', function (Builder $query) use ($search): void {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    private function applyRoleFilter(Builder $query, mixed $role): void
    {
        if (! is_string($role) || $role === '') {
            return;
        }

        $query->whereHas('user.roles', fn (Builder $query) => $query->where('name', $role));
    }

    private function applyStatusFilter(Builder $query, mixed $status): void
    {
        if (! is_string($status) || $status === '') {
            return;
        }

        $query->whereHas('user', fn (Builder $query) => $query->where('is_active', $status === 'active'));
    }
}
