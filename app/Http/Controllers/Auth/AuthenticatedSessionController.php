<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Kode baru yang sudah benar
        if (Auth::guard('pelanggan')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/'); // Arahkan ke dashboard customer
        }

        // Anda bisa menambahkan pengecekan untuk admin jika perlu
        if (Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard'); // Arahkan ke dashboard admin
        }

        // 🔹 Kalau keduanya gagal
        throw ValidationException::withMessages([
            'email' => __('Email atau password salah.'),
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Logout dari guard 'web' (admin) jika sedang login
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
        }

        // Logout dari guard 'pelanggan' jika sedang login
        if (Auth::guard('pelanggan')->check()) {
            Auth::guard('pelanggan')->logout();
        }

        // Hancurkan semua data session untuk memastikan bersih total
        $request->session()->invalidate();

        // Buat ulang token CSRF untuk keamanan
        $request->session()->regenerateToken();

        // Arahkan ke halaman utama
        return redirect('/');
    }

}
