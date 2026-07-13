<?php

namespace Tests\Feature;

class TaskCommentManagementTest extends ApiFeatureTestCase
{
    public function test_project_member_can_create_list_view_update_and_delete_own_comment(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->actingAsRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $task = $this->createTask($project, $member);

        $response = $this->postJson("/api/v1/tasks/{$task->id}/comments", [
            'body' => 'Initial comment body.',
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $commentId = $response->json('data.id');

        $this->getJson("/api/v1/tasks/{$task->id}/comments?sort=created_at&direction=asc")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->getJson("/api/v1/tasks/{$task->id}/comments/{$commentId}")
            ->assertOk()
            ->assertJsonPath('data.body', 'Initial comment body.');

        $this->putJson("/api/v1/tasks/{$task->id}/comments/{$commentId}", [
            'body' => 'Updated comment body.',
        ])->assertOk()
            ->assertJsonPath('data.body', 'Updated comment body.');

        $this->deleteJson("/api/v1/tasks/{$task->id}/comments/{$commentId}")
            ->assertOk();

        $this->assertSoftDeleted('task_comments', ['id' => $commentId]);
    }

    public function test_non_project_member_cannot_view_or_create_comments(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $member = $this->createUserWithRole('Team Member');
        $outsider = $this->actingAsRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $member, $manager);
        $task = $this->createTask($project, $member);

        $this->getJson("/api/v1/tasks/{$task->id}/comments")
            ->assertForbidden();

        $this->postJson("/api/v1/tasks/{$task->id}/comments", [
            'body' => 'Should be blocked.',
        ])->assertForbidden();
    }

    public function test_user_cannot_update_another_users_comment_but_admin_can(): void
    {
        $manager = $this->createUserWithRole('Project Manager');
        $author = $this->createUserWithRole('Team Member');
        $otherMember = $this->actingAsRole('Team Member');
        $project = $this->createProject($manager, $manager);
        $this->createProjectMember($project, $author, $manager);
        $this->createProjectMember($project, $otherMember, $manager);
        $task = $this->createTask($project, $author);
        $comment = $this->createTaskComment($task, $author);

        $this->putJson("/api/v1/tasks/{$task->id}/comments/{$comment->id}", [
            'body' => 'Blocked update.',
        ])->assertForbidden();

        $this->actingAsRole('Administrator');

        $this->putJson("/api/v1/tasks/{$task->id}/comments/{$comment->id}", [
            'body' => 'Admin update.',
        ])->assertOk()
            ->assertJsonPath('data.body', 'Admin update.');
    }
}