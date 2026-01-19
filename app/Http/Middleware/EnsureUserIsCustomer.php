<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCustomer
{
    /**
     * Handle an incoming request.
     * Only allow users with role 'customer' to access.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'customer') {
            // Redirect admins to dashboard
            return redirect()->route('dashboard')->with('error', 'Halaman ini khusus untuk customer.');
        }

        return $next($request);
    }
}
