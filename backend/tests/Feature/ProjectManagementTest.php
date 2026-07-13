<?php

namespace Tests\Feature;

class ProjectManagementTest extends ApiFeatureTestCase
{
    public function test_administrator_can_create_update_archive_delete_and_restore_project(): void
    {
        $admin = $this->actingAsRole('Administrator');
        $manager = $this->createUserWithRole('Project Manager');

        $response = $this->postJson('/api/v1/projects', [
            'name' => 'Assessment Platform',
            'description' => 'Project created by feature test.',
            'status' => 'active',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'manager_id' => $manager->id,
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $projectId = $response->json('data.id');

        $this->getJson('/api/v1/projects?search=Assessment&status=active')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/projects/{$projectId}", [
            'name' => 'Updated Assessment Platform',
            'description' => 'Updated by feature test.',
            'status' => 'on_hold',
            'start_date' => now()->toDateString(),
            'due_date' => now()->addDays(45)->toDateString(),
            'manager_id' => $manager->id,
        ])->assertOk()
            ->assertJsonPath('data.status', 'on_hold');

        $this->patchJson("/api/v1/projects/{$projectId}/archive")
            ->assertOk()
            ->assertJsonPath('data.status', 'archived');

        $this->deleteJson("/api/v1/projects/{$projectId}")
            ->assertOk();

        $this->assertSoftDeleted('projects', ['id' => $projectId]);

        $this->postJson("/api/v1/projects/{$projectId}/restore")
            ->assertOk();
    }

    public function test_project_creation_requires_project_manager_role_for_manager(): void
    {
        $this->actingAsRole('Administrator');
        $teamMember = $this->createUserWithRole('Team Member');

        $this->postJson('/api/v1/projects', [
            'name' => 'Invalid Manager Project',
            'manager_id' => $teamMember->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('manager_id');
    }

    public function test_team_member_cannot_create_project(): void
    {
        $this->actingAsRole('Team Member');
        $manager = $this->createUserWithRole('Project Manager');

        $this->postJson('/api/v1/projects', [
            'name' => 'Blocked Project',
            'manager_id' => $manager->id,
        ])->assertForbidden();
    }
}