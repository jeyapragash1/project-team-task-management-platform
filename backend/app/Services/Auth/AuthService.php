<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * @param array{email: string, password: string, remember?: bool} $credentials
     */
    public function login(array $credentials, Request $request): User
    {
        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive. Please contact an administrator.'],
            ]);
        }

        Auth::guard('web')->login($user, $credentials['remember'] ?? false);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $user;
    }

    public function logout(Request $request): void
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    /**
     * @param array{name: string, email: string} $data
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->fill($data);
        $user->save();

        return $user->refresh();
    }

    /**
     * @param array{current_password: string, password: string} $data
     */
    public function changePassword(User $user, array $data): void
    {
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => $data['password'],
        ])->save();
    }

    public function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user) {
            throw new AuthenticationException();
        }

        return $user;
    }
}