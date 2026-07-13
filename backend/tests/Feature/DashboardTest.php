<?php

namespace Tests\Feature;

class DashboardTest extends ApiFeatureTestCase
{
    public function test_administrator_dashboard_returns_system_statistics(): void
    {
        $admin = $this->actingAsRole('Administrator');
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->createUserWithRole('Team Member');
        $project = $this->createProject($manager, $admin);
        $this->createProjectMember($project, $member, $manager);
        $this->createTask($project, $member);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role', 'Administrator')
            ->assertJsonStructure([
                'data' => [
                    'statistics' => ['total_users', 'active_users', 'total_projects', 'total_tasks'],
                    'tasks_by_status',
                    'recent_activity',
                ],
            ]);
    }

    public function test_project_manager_dashboard_is_scoped_to_managed_projects(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $member = $this->createUserWithRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $this->createTask($project, $member);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('data.role', 'Project Manager')
            ->assertJsonPath('data.scope', 'managed_projects');
    }

    public function test_team_member_dashboard_returns_personal_workload(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->actingAsRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $this->createTask($project, $member);

        $this->getJson('/api/v1/dashboard')
            ->assertOk()
            ->assertJsonPath('data.role', 'Team Member')
            ->assertJsonPath('data.scope', 'personal_workload');
    }
}