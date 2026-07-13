<?php

namespace Tests\Feature;

class PermissionManagementTest extends ApiFeatureTestCase
{
    public function test_administrator_can_list_permissions(): void
    {
        $this->actingAsRole('Administrator');

        $this->getJson('/api/v1/permissions?search=projects')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_non_administrator_cannot_list_permissions(): void
    {
        $this->actingAsRole('Project Manager');

        $this->getJson('/api/v1/permissions')
            ->assertForbidden();
    }
}