<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Seed permissions and assign them to system roles.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->permissions() as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        foreach ($this->rolePermissions() as $roleName => $permissions) {
            Role::findOrCreate($roleName, 'web')->syncPermissions($permissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @return list<string>
     */
    private function permissions(): array
    {
        return [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.restore',
            'users.force_delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.view',
            'permissions.assign',
            'projects.view',
            'projects.create',
            'projects.update',
            'projects.delete',
            'projects.restore',
            'projects.force_delete',
            'projects.assign_manager',
            'project_members.view',
            'project_members.manage',
            'tasks.view',
            'tasks.create',
            'tasks.assign',
            'tasks.update',
            'tasks.update_progress',
            'tasks.delete',
            'tasks.restore',
            'tasks.force_delete',
            'tasks.comment',
            'task_statuses.view',
            'task_statuses.manage',
            'comments.view',
            'comments.create',
            'comments.update',
            'comments.delete',
            'dashboard.view',
            'reports.view',
            'activity_logs.view',
        ];
    }

    /**
     * @return array<string, list<string>>
     */
    private function rolePermissions(): array
    {
        return [
            'Administrator' => $this->permissions(),
            'Project Manager' => [
                'projects.view',
                'projects.create',
                'projects.update',
                'projects.delete',
                'project_members.view',
                'project_members.manage',
                'tasks.view',
                'tasks.create',
                'tasks.assign',
                'tasks.update',
                'tasks.update_progress',
                'tasks.delete',
                'tasks.comment',
                'comments.view',
                'comments.create',
                'comments.update',
                'comments.delete',
                'dashboard.view',
                'reports.view',
                'activity_logs.view',
            ],
            'Team Member' => [
                'projects.view',
                'tasks.view',
                'tasks.update_progress',
                'tasks.comment',
                'comments.view',
                'comments.create',
                'comments.update',
                'comments.delete',
                'dashboard.view',
            ],
        ];
    }
}