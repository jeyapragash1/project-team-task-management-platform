<?php

use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (ValidationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ApiResponse::error('The given data was invalid.', 422, $exception->errors());
            }

            return null;
        });

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ApiResponse::error('Unauthenticated.', 401);
            }

            return null;
        });

        $exceptions->render(function (AuthorizationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ApiResponse::error('Forbidden.', 403);
            }

            return null;
        });
    })->create();