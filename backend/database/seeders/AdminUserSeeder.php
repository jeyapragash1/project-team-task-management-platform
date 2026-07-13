<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the default administrator account.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Password@123'),
                'is_active' => true,
            ]
        );

        $administratorRole = Role::findOrCreate('Administrator', 'web');

        if (! $admin->hasRole($administratorRole)) {
            $admin->assignRole($administratorRole);
        }
    }
}