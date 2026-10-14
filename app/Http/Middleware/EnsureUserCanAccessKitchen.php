<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessKitchen
{
    /**
     * Handle an incoming request.
     * Allow users with role 'admin' or 'dapur' to access Kitchen Display.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (!auth()->user()->canAccessKitchen()) {
            return redirect()->route('home')->with('error', 'Anda tidak memiliki akses ke halaman Dapur / Kitchen Display.');
        }

        return $next($request);
    }
}
