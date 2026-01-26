<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Credentials
    |--------------------------------------------------------------------------
    |
    | Konfigurasi kredensial Midtrans. Pastikan untuk mengisi nilai-nilai
    | ini di file .env Anda.
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Production Mode
    |--------------------------------------------------------------------------
    |
    | Set ke true jika menggunakan production environment.
    | Default: false (sandbox mode)
    |
    */

    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    |--------------------------------------------------------------------------
    | Sanitization & 3DS
    |--------------------------------------------------------------------------
    */

    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_IS_3DS', true),

    /*
    |--------------------------------------------------------------------------
    | Snap Base URL
    |--------------------------------------------------------------------------
    */

    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',

    /*
    |--------------------------------------------------------------------------
    | Notification/Callback URL
    |--------------------------------------------------------------------------
    |
    | URL yang akan dipanggil oleh Midtrans untuk mengirim notifikasi
    | status pembayaran. Harus diset di Midtrans Dashboard juga.
    |
    */

    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', '/midtrans/notification'),
];
