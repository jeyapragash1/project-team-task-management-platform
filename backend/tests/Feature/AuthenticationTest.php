<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;

class AuthenticationTest extends ApiFeatureTestCase
{
    public function test_active_user_can_login_receive_token_and_fetch_current_user_with_bearer_token(): void
    {
        $user = $this->createUserWithRole('Administrator', [
            'email' => 'admin@example.com',
            'password' => Hash::make($this->password),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $this->password,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);

        $token = $response->json('data.token');
        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->getJson('/api/v1/auth/user')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email);
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