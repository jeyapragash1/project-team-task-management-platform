<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectMemberController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\TaskCommentController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('login', [AuthController::class, 'login'])->middleware('guest');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('user', [AuthController::class, 'user']);
            Route::get('profile', [AuthController::class, 'profile']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::put('password', [AuthController::class, 'changePassword']);
        });
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
        Route::post('users/{user}/restore', [UserController::class, 'restore']);

        Route::get('roles', [RoleController::class, 'index']);
        Route::post('roles', [RoleController::class, 'store']);
        Route::get('roles/{role}', [RoleController::class, 'show']);
        Route::put('roles/{role}', [RoleController::class, 'update']);
        Route::delete('roles/{role}', [RoleController::class, 'destroy']);
        Route::put('roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
        Route::delete('roles/{role}/permissions', [RoleController::class, 'removePermissions']);

        Route::get('permissions', [PermissionController::class, 'index']);

        Route::get('dashboard', [DashboardController::class, 'show']);

        Route::prefix('reports')->group(function (): void {
            Route::get('users', [ReportController::class, 'users']);
            Route::get('projects', [ReportController::class, 'projects']);
            Route::get('tasks', [ReportController::class, 'tasks']);
            Route::get('project-progress', [ReportController::class, 'projectProgress']);
            Route::get('workload', [ReportController::class, 'workload']);
        });

        Route::get('tasks', [TaskController::class, 'index']);
        Route::post('tasks', [TaskController::class, 'store']);
        Route::get('tasks/{task}/comments', [TaskCommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store']);
        Route::get('tasks/{task}/comments/{taskComment}', [TaskCommentController::class, 'show']);
        Route::put('tasks/{task}/comments/{taskComment}', [TaskCommentController::class, 'update']);
        Route::delete('tasks/{task}/comments/{taskComment}', [TaskCommentController::class, 'destroy']);
        Route::get('tasks/{task}', [TaskController::class, 'show']);
        Route::put('tasks/{task}', [TaskController::class, 'update']);
        Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
        Route::post('tasks/{task}/restore', [TaskController::class, 'restore']);
        Route::patch('tasks/{task}/assign', [TaskController::class, 'assign']);
        Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus']);

        Route::get('projects', [ProjectController::class, 'index']);
        Route::post('projects', [ProjectController::class, 'store']);
        Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
        Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
        Route::get('projects/{project}/members/{projectMember}', [ProjectMemberController::class, 'show']);
        Route::delete('projects/{project}/members/{projectMember}', [ProjectMemberController::class, 'destroy']);
        Route::get('projects/{project}', [ProjectController::class, 'show']);
        Route::put('projects/{project}', [ProjectController::class, 'update']);
        Route::delete('projects/{project}', [ProjectController::class, 'destroy']);
        Route::post('projects/{project}/restore', [ProjectController::class, 'restore']);
        Route::patch('projects/{project}/archive', [ProjectController::class, 'archive']);
        Route::patch('projects/{project}/activate', [ProjectController::class, 'activate']);
    });
});