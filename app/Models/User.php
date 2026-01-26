<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'alamat',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ===== ROLE HELPERS =====

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is customer
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    // ===== RELATIONSHIPS =====

    /**
     * Get user's orders (pesanan)
     */
    public function pesanan()
    {
        return $this->hasMany(\App\Models\Pesanan::class, 'user_id');
    }

    /**
     * Get user's visit bookings (kunjungan)
     */
    public function kunjungan()
    {
        return $this->hasMany(\App\Models\Kunjungan::class, 'user_id');
    }

    /**
     * Get user's reviews (ulasan)
     */
    public function ulasan()
    {
        return $this->hasMany(\App\Models\Ulasan::class, 'user_id');
    }

    /**
     * Get user's cart
     */
    public function cart()
    {
        return $this->hasOne(\App\Models\Cart::class, 'user_id');
    }

    /**
     * Get user's active cart (create if not exists)
     */
    public function getOrCreateCart()
    {
        return $this->cart ?? $this->cart()->create();
    }
}
