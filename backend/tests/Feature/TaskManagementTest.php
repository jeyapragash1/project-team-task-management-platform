<?php

namespace Tests\Feature;

class TaskManagementTest extends ApiFeatureTestCase
{
    public function test_project_manager_can_create_update_assign_status_delete_and_administrator_can_restore_task(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $project = $this->createProject($manager, $manager);
        $member = $this->createUserWithRole('Team Member');
        $this->createProjectMember($project, $member, $manager);
        $todo = $this->createTaskStatus(['name' => 'To Do', 'slug' => 'to-do']);
        $done = $this->createTaskStatus(['name' => 'Completed', 'slug' => 'completed', 'sort_order' => 2]);

        $response = $this->postJson('/api/v1/tasks', [
            'project_id' => $project->id,
            'status_id' => $todo->id,
            'assigned_to_id' => $member->id,
            'title' => 'Build task API tests',
            'description' => 'Feature test task.',
            'priority' => 'high',
            'progress' => 10,
            'due_date' => now()->addDays(5)->toDateString(),
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $taskId = $response->json('data.id');

        $this->getJson("/api/v1/tasks?project_id={$project->id}&task_status_id={$todo->id}&priority=high")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/tasks/{$taskId}", [
            'title' => 'Update task API tests',
            'priority' => 'urgent',
            'progress' => 50,
        ])->assertOk()
            ->assertJsonPath('data.priority', 'urgent');

        $this->patchJson("/api/v1/tasks/{$taskId}/assign", [
            'assigned_to_id' => $member->id,
        ])->assertOk()
            ->assertJsonPath('data.assigned_to_id', $member->id);

        $this->patchJson("/api/v1/tasks/{$taskId}/status", [
            'status_id' => $done->id,
            'progress' => 100,
        ])->assertOk()
            ->assertJsonPath('data.progress', 100);

        $this->deleteJson("/api/v1/tasks/{$taskId}")
            ->assertOk();

        $this->assertSoftDeleted('tasks', ['id' => $taskId]);

        $this->actingAsRole('Administrator');

        $this->postJson("/api/v1/tasks/{$taskId}/restore")
            ->assertOk();
    }

    public function test_task_assignee_must_belong_to_project(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $project = $this->createProject($manager, $manager);
        $outsideUser = $this->createUserWithRole('Team Member');
        $status = $this->createTaskStatus();

        $this->postJson('/api/v1/tasks', [
            'project_id' => $project->id,
            'status_id' => $status->id,
            'assigned_to_id' => $outsideUser->id,
            'title' => 'Invalid assignment',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('assigned_to_id');
    }

    public function test_assigned_team_member_can_update_task_status_only(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->actingAsRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $todo = $this->createTaskStatus(['name' => 'To Do', 'slug' => 'to-do']);
        $doing = $this->createTaskStatus(['name' => 'In Progress', 'slug' => 'in-progress', 'sort_order' => 2]);
        $task = $this->createTask($project, $member, $todo);

        $this->patchJson("/api/v1/tasks/{$task->id}/status", [
            'status_id' => $doing->id,
            'progress' => 40,
        ])->assertOk()
            ->assertJsonPath('data.status_id', $doing->id);

        $this->putJson("/api/v1/tasks/{$task->id}", [
            'title' => 'Forbidden full update',
        ])->assertForbidden();
    }
}