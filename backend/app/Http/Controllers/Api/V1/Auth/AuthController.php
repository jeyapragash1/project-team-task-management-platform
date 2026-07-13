<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $authenticated = $this->authService->login($request->validated(), $request);

        return ApiResponse::success('Logged in successfully.', [
            'user' => new UserResource($authenticated['user']),
            'token' => $authenticated['token'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return ApiResponse::success('Logged out successfully.');
    }

    public function user(Request $request): JsonResponse
    {
        $user = $this->authService->authenticatedUser($request)->loadMissing('roles', 'permissions');

        return ApiResponse::success('Authenticated user retrieved successfully.', new UserResource($user));
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $this->authService->authenticatedUser($request)->loadMissing('roles', 'permissions');

        return ApiResponse::success('Profile retrieved successfully.', new UserResource($user));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($request->user(), $request->validated());

        return ApiResponse::success('Profile updated successfully.', new UserResource($user));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword($request->user(), $request->validated());

        return ApiResponse::success('Password changed successfully.');
    }
}