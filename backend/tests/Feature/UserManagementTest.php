<?php

namespace Tests\Feature;

class UserManagementTest extends ApiFeatureTestCase
{
    public function test_administrator_can_create_list_update_deactivate_delete_and_restore_users(): void
    {
        $this->actingAsRole('Administrator');

        $response = $this->postJson('/api/v1/users', [
            'name' => 'Managed User',
            'email' => 'managedusertest@gmail.com',
            'password' => $this->password,
            'password_confirmation' => $this->password,
            'roles' => ['Team Member'],
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $userId = $response->json('data.id');

        $this->getJson('/api/v1/users?search=Managed&role=Team Member&status=active')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/users/{$userId}", [
            'name' => 'Updated User',
            'email' => 'updatedusertest@gmail.com',
            'roles' => ['Project Manager'],
        ])->assertOk()
            ->assertJsonPath('data.email', 'updatedusertest@gmail.com');

        $this->patchJson("/api/v1/users/{$userId}/status", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson("/api/v1/users/{$userId}")
            ->assertOk();

        $this->assertSoftDeleted('users', ['id' => $userId]);

        $this->postJson("/api/v1/users/{$userId}/restore")
            ->assertOk();
    }

    public function test_non_administrator_cannot_manage_users(): void
    {
        $this->actingAsRole('Project Manager');

        $this->getJson('/api/v1/users')
            ->assertForbidden();
    }

    public function test_user_creation_validates_required_fields(): void
    {
        $this->actingAsRole('Administrator');

        $this->postJson('/api/v1/users', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password', 'roles']);
    }
}