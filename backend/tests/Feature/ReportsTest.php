<?php

namespace Tests\Feature;

class ReportsTest extends ApiFeatureTestCase
{
    public function test_administrator_can_view_all_report_endpoints_with_filters(): void
    {
        $admin = $this->actingAsRole('Administrator');
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->createUserWithRole('Team Member');
        $project = $this->createProject($manager, $admin);
        $this->createProjectMember($project, $member, $manager);
        $status = $this->createTaskStatus(['name' => 'In Progress', 'slug' => 'in-progress']);
        $this->createTask($project, $member, $status);

        $query = http_build_query([
            'date_from' => now()->subDay()->toDateString(),
            'date_to' => now()->addDay()->toDateString(),
            'project_id' => $project->id,
            'user_id' => $member->id,
            'task_status_id' => $status->id,
            'role' => 'Team Member',
            'limit' => 10,
        ]);

        foreach (['users', 'projects', 'tasks', 'project-progress', 'workload'] as $report) {
            $this->getJson("/api/v1/reports/{$report}?{$query}")
                ->assertOk()
                ->assertJsonPath('success', true)
                ->assertJsonStructure([
                    'data' => ['type', 'scope', 'filters', 'summary', 'charts', 'table'],
                ]);
        }
    }

    public function test_project_manager_reports_are_allowed_and_scoped(): void
    {
        $manager = $this->actingAsRole('Project Manager');
        $member = $this->createUserWithRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $this->createTask($project, $member);

        $this->getJson('/api/v1/reports/tasks')
            ->assertOk()
            ->assertJsonPath('data.scope', 'managed_projects');
    }

    public function test_team_member_cannot_access_reports(): void
    {
        $this->actingAsRole('Team Member');

        $this->getJson('/api/v1/reports/tasks')
            ->assertForbidden();
    }

    public function test_reports_validate_filter_values(): void
    {
        $this->actingAsRole('Administrator');

        $this->getJson('/api/v1/reports/tasks?date_from=2026-07-15&date_to=2026-07-14&limit=0')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date_to', 'limit']);
    }
}