<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;

class AuthenticationTest extends ApiFeatureTestCase
{
    public function test_active_user_can_login_and_fetch_current_user(): void
    {
        $user = $this->createUserWithRole('Administrator', [
            'email' => 'authadmintest@gmail.com',
            'password' => Hash::make($this->password),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $this->password,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email);

        $this->actingAsRole('Administrator');

        $this->getJson('/api/v1/auth/user')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = $this->createUserWithRole('Team Member', [
            'email' => 'inactiveusertest@gmail.com',
            'password' => Hash::make($this->password),
            'is_active' => false,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $this->password,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_authenticated_user_can_change_password_with_valid_current_password(): void
    {
        $user = $this->actingAsRole('Team Member');

        $this->putJson('/api/v1/auth/password', [
            'current_password' => $this->password,
            'password' => 'NewPassword@123',
            'password_confirmation' => 'NewPassword@123',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('NewPassword@123', $user->fresh()->password));
    }

    public function test_change_password_requires_current_password(): void
    {
        $this->actingAsRole('Team Member');

        $this->putJson('/api/v1/auth/password', [
            'current_password' => 'wrong-password',
            'password' => 'NewPassword@123',
            'password_confirmation' => 'NewPassword@123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');
    }
}