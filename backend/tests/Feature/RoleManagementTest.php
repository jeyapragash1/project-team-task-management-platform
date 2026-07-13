<?php

namespace Tests\Feature;

use Spatie\Permission\Models\Role;

class RoleManagementTest extends ApiFeatureTestCase
{
    public function test_administrator_can_manage_custom_roles_and_permissions(): void
    {
        $this->actingAsRole('Administrator');

        $response = $this->postJson('/api/v1/roles', [
            'name' => 'QA Lead',
            'permissions' => ['projects.view', 'tasks.view'],
        ])->assertCreated()
            ->assertJsonPath('success', true);

        $roleId = $response->json('data.id');

        $this->getJson('/api/v1/roles?search=QA')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/roles/{$roleId}", ['name' => 'Quality Lead'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Quality Lead');

        $this->putJson("/api/v1/roles/{$roleId}/permissions", [
            'permissions' => ['projects.view'],
        ])->assertOk();

        $this->deleteJson("/api/v1/roles/{$roleId}/permissions", [
            'permissions' => ['projects.view'],
        ])->assertOk();

        $this->deleteJson("/api/v1/roles/{$roleId}")
            ->assertOk();
    }

    public function test_protected_system_roles_cannot_be_deleted(): void
    {
        $this->actingAsRole('Administrator');
        $role = Role::where('name', 'Administrator')->firstOrFail();

        $this->deleteJson("/api/v1/roles/{$role->id}")
            ->assertForbidden();
    }

    public function test_non_administrator_cannot_manage_roles(): void
    {
        $this->actingAsRole('Project Manager');

        $this->postJson('/api/v1/roles', ['name' => 'Blocked Role'])
            ->assertForbidden();
    }
}