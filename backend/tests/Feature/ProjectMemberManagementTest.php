<?php

namespace Tests\Feature;

class ProjectMemberManagementTest extends ApiFeatureTestCase
{
    public function test_project_manager_can_add_list_view_and_remove_project_members(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $project = $this->createProject($manager, $manager);
        $member = $this->createUserWithRole('Team Member');

        $response = $this->postJson("/api/v1/projects/{$project->id}/members", [
            'user_ids' => [$member->id],
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $membershipId = $response->json('data.0.id');

        $this->getJson("/api/v1/projects/{$project->id}/members?search={$member->email}&role=Team Member")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson("/api/v1/projects/{$project->id}/members/{$membershipId}")
            ->assertOk()
            ->assertJsonPath('data.user.email', $member->email);

        $this->deleteJson("/api/v1/projects/{$project->id}/members/{$membershipId}")
            ->assertOk();

        $this->assertDatabaseMissing('project_members', ['id' => $membershipId]);
    }

    public function test_duplicate_project_memberships_are_rejected(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $project = $this->createProject($manager, $manager);
        $member = $this->createUserWithRole('Team Member');
        $this->createProjectMember($project, $member, $manager);

        $this->postJson("/api/v1/projects/{$project->id}/members", [
            'user_ids' => [$member->id],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('user_ids');
    }

    public function test_unassigned_project_manager_cannot_manage_members(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $otherManager = $this->actingAsRole('Project Manager');
        $project = $this->createProject($manager, $manager);
        $member = $this->createUserWithRole('Team Member');

        $this->postJson("/api/v1/projects/{$project->id}/members", [
            'user_ids' => [$member->id],
        ])->assertForbidden();
    }
}