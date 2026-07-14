<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatus;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed realistic demo data for local development and assessment review.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            AdminUserSeeder::class,
        ]);

        $statuses = $this->seedTaskStatuses();
        $users = $this->seedUsers();
        $projects = $this->seedProjects($users);

        $this->seedProjectMembers($projects, $users);
        $tasks = $this->seedTasks($projects, $users, $statuses);
        $this->seedTaskComments($tasks, $users);
        $this->seedActivityLogs($projects, $tasks, $users);
    }

    /**
     * @return array<string, TaskStatus>
     */
    private function seedTaskStatuses(): array
    {
        $statusRows = [
            ['name' => 'Pending', 'slug' => 'pending', 'sort_order' => 1, 'is_default' => true],
            ['name' => 'In Progress', 'slug' => 'in-progress', 'sort_order' => 2, 'is_default' => false],
            ['name' => 'In Review', 'slug' => 'in-review', 'sort_order' => 3, 'is_default' => false],
            ['name' => 'Completed', 'slug' => 'completed', 'sort_order' => 4, 'is_default' => false],
            ['name' => 'Blocked', 'slug' => 'blocked', 'sort_order' => 5, 'is_default' => false],
        ];

        $statuses = [];

        foreach ($statusRows as $row) {
            $statuses[$row['slug']] = TaskStatus::query()->updateOrCreate(
                ['slug' => $row['slug']],
                $row,
            );
        }

        return $statuses;
    }

    /**
     * @return array<string, User>
     */
    private function seedUsers(): array
    {
        $password = Hash::make('Password@123');

        $userRows = [
            'pm-kisho' => ['name' => 'Kisho Jeyapragash', 'email' => 'kisho.pm@example.com', 'role' => 'Project Manager'],
            'pm-amara' => ['name' => 'Amara Fernando', 'email' => 'amara.pm@example.com', 'role' => 'Project Manager'],
            'member-nimal' => ['name' => 'Nimal Perera', 'email' => 'nimal.member@example.com', 'role' => 'Team Member'],
            'member-sara' => ['name' => 'Sara Wijesinghe', 'email' => 'sara.member@example.com', 'role' => 'Team Member'],
            'member-ravi' => ['name' => 'Ravi Kumar', 'email' => 'ravi.member@example.com', 'role' => 'Team Member'],
            'member-dilani' => ['name' => 'Dilani Silva', 'email' => 'dilani.member@example.com', 'role' => 'Team Member'],
            'member-arun' => ['name' => 'Arun Thevan', 'email' => 'arun.member@example.com', 'role' => 'Team Member'],
        ];

        $users = [
            'admin' => User::query()->where('email', 'admin@example.com')->firstOrFail(),
        ];

        foreach ($userRows as $key => $row) {
            $user = User::query()->updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => $password,
                    'is_active' => true,
                ],
            );

            $user->syncRoles([$row['role']]);
            $users[$key] = $user;
        }

        return $users;
    }

    /**
     * @param array<string, User> $users
     * @return array<string, Project>
     */
    private function seedProjects(array $users): array
    {
        $projectRows = [
            'client-portal-redesign' => [
                'name' => 'Client Portal Redesign',
                'description' => 'Redesign the authenticated client portal with improved dashboard, project tracking, and task visibility.',
                'status' => 'active',
                'start_date' => CarbonImmutable::now()->subDays(20)->toDateString(),
                'due_date' => CarbonImmutable::now()->addDays(40)->toDateString(),
                'manager_key' => 'pm-kisho',
            ],
            'mobile-api-stabilization' => [
                'name' => 'Mobile API Stabilization',
                'description' => 'Improve API reliability, validation coverage, and response consistency for the mobile application team.',
                'status' => 'active',
                'start_date' => CarbonImmutable::now()->subDays(12)->toDateString(),
                'due_date' => CarbonImmutable::now()->addDays(24)->toDateString(),
                'manager_key' => 'pm-amara',
            ],
            'legacy-data-cleanup' => [
                'name' => 'Legacy Data Cleanup',
                'description' => 'Audit and clean legacy project records before the next reporting cycle.',
                'status' => 'on_hold',
                'start_date' => CarbonImmutable::now()->subDays(45)->toDateString(),
                'due_date' => CarbonImmutable::now()->addDays(15)->toDateString(),
                'manager_key' => 'pm-kisho',
            ],
            'qa-process-rollout' => [
                'name' => 'QA Process Rollout',
                'description' => 'Roll out standardized QA checklists, release gates, and test reporting processes.',
                'status' => 'completed',
                'start_date' => CarbonImmutable::now()->subDays(70)->toDateString(),
                'due_date' => CarbonImmutable::now()->subDays(5)->toDateString(),
                'manager_key' => 'pm-amara',
            ],
        ];

        $projects = [];

        foreach ($projectRows as $slug => $row) {
            $projects[$slug] = Project::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'status' => $row['status'],
                    'start_date' => $row['start_date'],
                    'due_date' => $row['due_date'],
                    'manager_id' => $users[$row['manager_key']]->id,
                    'created_by_id' => $users['admin']->id,
                ],
            );
        }

        return $projects;
    }

    /**
     * @param array<string, Project> $projects
     * @param array<string, User> $users
     */
    private function seedProjectMembers(array $projects, array $users): void
    {
        $memberships = [
            'client-portal-redesign' => ['pm-kisho', 'member-nimal', 'member-sara', 'member-ravi'],
            'mobile-api-stabilization' => ['pm-amara', 'member-ravi', 'member-dilani', 'member-arun'],
            'legacy-data-cleanup' => ['pm-kisho', 'member-nimal', 'member-dilani'],
            'qa-process-rollout' => ['pm-amara', 'member-sara', 'member-arun'],
        ];

        foreach ($memberships as $projectSlug => $memberKeys) {
            foreach ($memberKeys as $memberKey) {
                ProjectMember::query()->updateOrCreate(
                    [
                        'project_id' => $projects[$projectSlug]->id,
                        'user_id' => $users[$memberKey]->id,
                    ],
                    [
                        'added_by_id' => $users['admin']->id,
                    ],
                );
            }
        }
    }

    /**
     * @param array<string, Project> $projects
     * @param array<string, User> $users
     * @param array<string, TaskStatus> $statuses
     * @return array<string, Task>
     */
    private function seedTasks(array $projects, array $users, array $statuses): array
    {
        $taskRows = [
            'design-dashboard-wireframes' => ['project' => 'client-portal-redesign', 'status' => 'completed', 'assignee' => 'member-sara', 'creator' => 'pm-kisho', 'title' => 'Design dashboard wireframes', 'priority' => 'high', 'progress' => 100, 'due_offset' => -8],
            'implement-project-summary-api' => ['project' => 'client-portal-redesign', 'status' => 'in-progress', 'assignee' => 'member-nimal', 'creator' => 'pm-kisho', 'title' => 'Implement project summary API integration', 'priority' => 'high', 'progress' => 65, 'due_offset' => 8],
            'fix-responsive-navigation' => ['project' => 'client-portal-redesign', 'status' => 'pending', 'assignee' => 'member-ravi', 'creator' => 'pm-kisho', 'title' => 'Fix responsive sidebar navigation states', 'priority' => 'medium', 'progress' => 10, 'due_offset' => 14],
            'review-token-auth-flow' => ['project' => 'mobile-api-stabilization', 'status' => 'in-review', 'assignee' => 'member-dilani', 'creator' => 'pm-amara', 'title' => 'Review token authentication flow', 'priority' => 'urgent', 'progress' => 85, 'due_offset' => 3],
            'add-api-validation-tests' => ['project' => 'mobile-api-stabilization', 'status' => 'in-progress', 'assignee' => 'member-arun', 'creator' => 'pm-amara', 'title' => 'Add API validation test coverage', 'priority' => 'high', 'progress' => 55, 'due_offset' => 12],
            'document-error-response-format' => ['project' => 'mobile-api-stabilization', 'status' => 'pending', 'assignee' => 'member-ravi', 'creator' => 'pm-amara', 'title' => 'Document standard error response format', 'priority' => 'medium', 'progress' => 0, 'due_offset' => 18],
            'audit-duplicate-project-records' => ['project' => 'legacy-data-cleanup', 'status' => 'blocked', 'assignee' => 'member-nimal', 'creator' => 'pm-kisho', 'title' => 'Audit duplicate project records', 'priority' => 'medium', 'progress' => 30, 'due_offset' => -2],
            'prepare-cleanup-report' => ['project' => 'legacy-data-cleanup', 'status' => 'pending', 'assignee' => 'member-dilani', 'creator' => 'pm-kisho', 'title' => 'Prepare cleanup report', 'priority' => 'low', 'progress' => 0, 'due_offset' => 10],
            'publish-qa-checklist' => ['project' => 'qa-process-rollout', 'status' => 'completed', 'assignee' => 'member-sara', 'creator' => 'pm-amara', 'title' => 'Publish QA checklist', 'priority' => 'medium', 'progress' => 100, 'due_offset' => -18],
            'complete-release-gate-review' => ['project' => 'qa-process-rollout', 'status' => 'completed', 'assignee' => 'member-arun', 'creator' => 'pm-amara', 'title' => 'Complete release gate review', 'priority' => 'high', 'progress' => 100, 'due_offset' => -9],
        ];

        $tasks = [];

        foreach ($taskRows as $key => $row) {
            $isCompleted = $row['status'] === 'completed';

            $tasks[$key] = Task::query()->updateOrCreate(
                [
                    'project_id' => $projects[$row['project']]->id,
                    'title' => $row['title'],
                ],
                [
                    'status_id' => $statuses[$row['status']]->id,
                    'assigned_to_id' => $users[$row['assignee']]->id,
                    'created_by_id' => $users[$row['creator']]->id,
                    'description' => $this->taskDescription($row['title']),
                    'priority' => $row['priority'],
                    'progress' => $row['progress'],
                    'due_date' => CarbonImmutable::now()->addDays($row['due_offset'])->toDateString(),
                    'completed_at' => $isCompleted ? CarbonImmutable::now()->subDays(3) : null,
                ],
            );
        }

        return $tasks;
    }

    /**
     * @param array<string, Task> $tasks
     * @param array<string, User> $users
     */
    private function seedTaskComments(array $tasks, array $users): void
    {
        $comments = [
            ['task' => 'implement-project-summary-api', 'user' => 'pm-kisho', 'body' => 'Please keep the response shape consistent with the dashboard summary cards.'],
            ['task' => 'implement-project-summary-api', 'user' => 'member-nimal', 'body' => 'API integration is in progress. I am validating empty and partial dashboard states.'],
            ['task' => 'review-token-auth-flow', 'user' => 'pm-amara', 'body' => 'Prioritize Sanctum token handling and unauthorized response checks.'],
            ['task' => 'audit-duplicate-project-records', 'user' => 'member-nimal', 'body' => 'Blocked until we receive the latest exported records from operations.'],
            ['task' => 'publish-qa-checklist', 'user' => 'member-sara', 'body' => 'Checklist has been reviewed and shared with the team.'],
        ];

        foreach ($comments as $comment) {
            TaskComment::query()->firstOrCreate(
                [
                    'task_id' => $tasks[$comment['task']]->id,
                    'user_id' => $users[$comment['user']]->id,
                    'body' => $comment['body'],
                ],
            );
        }
    }

    /**
     * @param array<string, Project> $projects
     * @param array<string, Task> $tasks
     * @param array<string, User> $users
     */
    private function seedActivityLogs(array $projects, array $tasks, array $users): void
    {
        $logs = [
            ['user' => 'admin', 'action' => 'project.created', 'subject' => $projects['client-portal-redesign'], 'label' => 'Client Portal Redesign'],
            ['user' => 'pm-kisho', 'action' => 'task.created', 'subject' => $tasks['implement-project-summary-api'], 'label' => 'Implement project summary API integration'],
            ['user' => 'member-nimal', 'action' => 'task.progress_updated', 'subject' => $tasks['implement-project-summary-api'], 'label' => 'Implement project summary API integration'],
            ['user' => 'pm-amara', 'action' => 'task.status_updated', 'subject' => $tasks['review-token-auth-flow'], 'label' => 'Review token authentication flow'],
            ['user' => 'member-sara', 'action' => 'task.completed', 'subject' => $tasks['publish-qa-checklist'], 'label' => 'Publish QA checklist'],
        ];

        foreach ($logs as $log) {
            ActivityLog::query()->firstOrCreate(
                [
                    'user_id' => $users[$log['user']]->id,
                    'action' => $log['action'],
                    'subject_type' => $log['subject']::class,
                    'subject_id' => $log['subject']->id,
                    'entity_label' => $log['label'],
                ],
                [
                    'metadata' => ['source' => 'demo-seeder'],
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Laravel DemoDataSeeder',
                ],
            );
        }
    }

    private function taskDescription(string $title): string
    {
        return sprintf(
            '%s. This demo task is seeded for assessment review, dashboard metrics, filtering, and role-based workflow testing.',
            $title,
        );
    }
}
