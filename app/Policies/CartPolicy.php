<?php

namespace App\Policies;

use App\Models\Cart;
// GANTI 'User' DENGAN MODEL PELANGGAN ANDA
use App\Models\Pelanggan; // <-- Pastikan path dan nama model ini benar
use Illuminate\Auth\Access\Response;

// app/Policies/CartPolicy.php
class CartPolicy
{
    public function update(Pelanggan $pelanggan, Cart $cart): bool
    {
        // Ganti $cart->user_id menjadi $cart->pelanggan_id
        return $pelanggan->id === $cart->pelanggan_id;
    }

    public function delete(Pelanggan $pelanggan, Cart $cart): bool
    {
        // Ganti $cart->user_id menjadi $cart->pelanggan_id
        return $pelanggan->id === $cart->pelanggan_id;
    }
}
