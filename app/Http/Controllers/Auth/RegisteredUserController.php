<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pelanggan;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.Pelanggan::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $pelanggan = Pelanggan::create([
                'nama' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            event(new Registered($pelanggan));

            return redirect()->route('login')->with('success', 'Pendaftaran berhasil, silakan login.');

        } catch (QueryException $e) {
            if ($e->errorInfo[1] == 1062) { // 1062 is the MySQL error code for duplicate entry
                throw ValidationException::withMessages([
                    'email' => 'Email ini sudah terdaftar. Silakan gunakan email lain.',
                ]);
            }
            // For other database errors, rethrow the exception
            throw $e;
        }
    }
}
