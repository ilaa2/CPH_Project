<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessPos
{
    /**
     * Handle an incoming request.
     * Allow users with role 'admin' or 'kasir' to access POS.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (!auth()->user()->canAccessPos()) {
            return redirect()->route('home')->with('error', 'Anda tidak memiliki akses ke halaman POS.');
        }

        return $next($request);
    }
}
