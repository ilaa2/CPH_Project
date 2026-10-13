<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Auto-heal / Auto-bust stale route cache di cPanel jika ada pembaruan rute atau pos.monitor belum tercatat
$webRoutesFile = __DIR__ . '/../routes/web.php';
foreach (['routes-v7.php', 'routes.php'] as $cacheName) {
    $rFile = __DIR__ . '/cache/' . $cacheName;
    if (file_exists($rFile)) {
        $staleByTime = file_exists($webRoutesFile) && (filemtime($webRoutesFile) > filemtime($rFile));
        $content = @file_get_contents($rFile);
        $missingMonitor = ($content !== false && strpos($content, 'pos.monitor') === false);
        if ($staleByTime || $missingMonitor) {
            @unlink($rFile);
        }
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register middleware aliases for role-based access
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'customer' => \App\Http\Middleware\EnsureUserIsCustomer::class,
            'pos.access' => \App\Http\Middleware\EnsureUserCanAccessPos::class,
            'kitchen.access' => \App\Http\Middleware\EnsureUserCanAccessKitchen::class,
        ]);

        // Exclude retry-payment routes from CSRF verification
        // These routes are already protected by auth middleware
        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
            'customer/pesanan/*/retry-payment',
            'customer/kunjungan/*/retry-payment',
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
