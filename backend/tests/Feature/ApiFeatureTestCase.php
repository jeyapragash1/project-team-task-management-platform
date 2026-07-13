<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

abstract class ApiFeatureTestCase extends TestCase
{
    use RefreshDatabase;

    protected string $password = 'Password@123';

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    protected function actingAsRole(string $roleName): User
    {
        $user = $this->createUserWithRole($roleName);
        Sanctum::actingAs($user);

        return $user;
    }

    protected function createUserWithRole(string $roleName, array $attributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'password' => Hash::make($this->password),
            'is_active' => true,
        ], $attributes));

        $user->assignRole($roleName);

        return $user;
    }

    protected function createProject(?User $manager = null, ?User $creator = null, array $attributes = []): Project
    {
        $manager ??= $this->createUserWithRole('Project Manager');
        $creator ??= $this->createUserWithRole('Administrator');
        $name = $attributes['name'] ?? 'Project '.fake()->unique()->numberBetween(1000, 9999);

        return Project::create(array_merge([
            'name' => $name,
            'slug' => str($name)->slug().'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => 'Feature test project.',
            'status' => 'active',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(10)->toDateString(),
            'manager_id' => $manager->id,
            'created_by_id' => $creator->id,
        ], $attributes));
    }

    protected function createProjectMember(Project $project, User $user, ?User $addedBy = null): ProjectMember
    {
        $addedBy ??= $this->createUserWithRole('Administrator');

        return ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'added_by_id' => $addedBy->id,
        ]);
    }

    protected function createTaskStatus(array $attributes = []): TaskStatus
    {
        $name = $attributes['name'] ?? 'To Do';

        return TaskStatus::create(array_merge([
            'name' => $name,
            'slug' => str($name)->slug().'-'.fake()->unique()->numberBetween(1000, 9999),
            'sort_order' => 1,
            'is_default' => false,
        ], $attributes));
    }

    protected function createTask(Project $project, ?User $assignee = null, ?TaskStatus $status = null, array $attributes = []): Task
    {
        $status ??= $this->createTaskStatus();
        $creator = $this->createUserWithRole('Project Manager');

        if ($assignee !== null && ! $project->members()->whereKey($assignee->id)->exists()) {
            $this->createProjectMember($project, $assignee, $creator);
        }

        return Task::create(array_merge([
            'project_id' => $project->id,
            'status_id' => $status->id,
            'assigned_to_id' => $assignee?->id,
            'created_by_id' => $creator->id,
            'title' => 'Feature test task',
            'description' => 'Task created by a feature test.',
            'priority' => 'medium',
            'progress' => 0,
            'due_date' => now()->addDay()->toDateString(),
        ], $attributes));
    }

    protected function createTaskComment(Task $task, User $user, array $attributes = []): TaskComment
    {
        return TaskComment::create(array_merge([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'body' => 'Feature test comment.',
        ], $attributes));
    }
}