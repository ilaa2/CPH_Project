<?php

namespace App\Http\Requests;

use App\Models\Pelanggan; // <-- Pastikan model Pelanggan Anda ada di sini
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PelangganProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Izinkan semua pelanggan yang login untuk update profil
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            // Pastikan validasi email unik menargetkan tabel 'pelanggans'
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(Pelanggan::class)->ignore($this->user('pelanggan')->id)],
            'telepon' => ['nullable', 'string', 'max:15'],
            'alamat' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'], // Maksimal 2MB
        ];
    }
}
