<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Memindahkan data dari tabel pelanggans ke tabel users
     */
    public function up(): void
    {
        // Set existing users as admin
        DB::table('users')->update(['role' => 'admin']);

        // Check if pelanggans table exists
        if (!Schema::hasTable('pelanggans')) {
            return;
        }

        // Get all pelanggan data
        $pelanggans = DB::table('pelanggans')->get();

        foreach ($pelanggans as $pelanggan) {
            // Check if email already exists in users
            $existingUser = DB::table('users')->where('email', $pelanggan->email)->first();
            
            if ($existingUser) {
                // If email exists, skip or update (we'll skip to avoid conflicts)
                continue;
            }

            // Insert pelanggan data into users table
            DB::table('users')->insert([
                'name' => $pelanggan->nama,
                'email' => $pelanggan->email,
                'password' => $pelanggan->password, // Already hashed
                'role' => 'customer',
                'phone' => $pelanggan->telepon ?? null,
                'avatar' => $pelanggan->foto_profil ?? null,
                'alamat' => $pelanggan->alamat ?? null,
                'email_verified_at' => now(),
                'created_at' => $pelanggan->created_at ?? now(),
                'updated_at' => $pelanggan->updated_at ?? now(),
            ]);
        }

        // Create mapping table for old pelanggan_id to new user_id
        Schema::create('pelanggan_user_mapping', function (Blueprint $table) {
            $table->unsignedBigInteger('old_pelanggan_id');
            $table->unsignedBigInteger('new_user_id');
            $table->primary('old_pelanggan_id');
        });

        // Fill the mapping table
        $pelanggans = DB::table('pelanggans')->get();
        foreach ($pelanggans as $pelanggan) {
            $user = DB::table('users')->where('email', $pelanggan->email)->first();
            if ($user) {
                DB::table('pelanggan_user_mapping')->insert([
                    'old_pelanggan_id' => $pelanggan->id,
                    'new_user_id' => $user->id,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop mapping table
        Schema::dropIfExists('pelanggan_user_mapping');
        
        // Delete customer users (keep admins)
        DB::table('users')->where('role', 'customer')->delete();
    }
};
