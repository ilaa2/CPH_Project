<?php

use App\Models\User;
use App\Models\PosTable;
use App\Models\PosFoodCategory;
use App\Models\PosFood;
use App\Models\PosOrder;
use App\Models\PosPayment;

beforeEach(function () {
    // Create roles
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->kasir = User::factory()->create(['role' => 'kasir']);
    $this->dapur = User::factory()->create(['role' => 'dapur']);
    $this->customer = User::factory()->create(['role' => 'customer']);

    // Create table & food
    $this->table = PosTable::create(['nomor_meja' => '01', 'status' => 'AVAILABLE']);
    $this->category = PosFoodCategory::create(['nama_kategori' => 'Makanan', 'status' => 'Aktif']);
    $this->food = PosFood::create([
        'category_id' => $this->category->id,
        'nama' => 'Nasi Goreng Test',
        'harga' => 15000,
        'status' => 'Aktif',
    ]);
});

test('unauthenticated users are redirected from POS and Kitchen', function () {
    $this->get('/order')->assertRedirect('/login');
    $this->get('/kitchen')->assertRedirect('/login');
});

test('customer users cannot access POS or Kitchen Display', function () {
    $this->actingAs($this->customer)->get('/order')->assertRedirect('/');
    $this->actingAs($this->customer)->get('/kitchen')->assertRedirect('/');
});

test('kasir user can access POS and create order', function () {
    $response = $this->actingAs($this->kasir)->get('/order');
    $response->assertStatus(200);

    $orderResponse = $this->actingAs($this->kasir)->post('/pos/order', [
        'table_id' => $this->table->id,
        'items' => [
            ['food_id' => $this->food->id, 'jumlah' => 2, 'catatan' => 'Pedas'],
        ],
        'catatan' => 'Tanpa bawang',
    ]);

    $orderResponse->assertSessionHasNoErrors();
    $this->assertDatabaseHas('pos_orders', [
        'table_id' => $this->table->id,
        'cashier_id' => $this->kasir->id,
        'order_status' => 'NEW',
        'payment_status' => 'UNPAID',
        'total' => 30000,
    ]);

    $this->assertDatabaseHas('pos_tables', [
        'id' => $this->table->id,
        'status' => 'OCCUPIED',
    ]);
});

test('cannot create duplicate order on occupied table', function () {
    $this->table->update(['status' => 'OCCUPIED']);

    $response = $this->actingAs($this->kasir)->post('/pos/order', [
        'table_id' => $this->table->id,
        'items' => [
            ['food_id' => $this->food->id, 'jumlah' => 1],
        ],
    ]);

    $response->assertSessionHas('error');
});

test('dapur user can update order status from NEW to PROCESSING to READY', function () {
    $order = PosOrder::create([
        'nomor_pesanan' => 'CP-POS-20260914-001',
        'table_id' => $this->table->id,
        'cashier_id' => $this->kasir->id,
        'order_status' => 'NEW',
        'payment_status' => 'UNPAID',
        'subtotal' => 15000,
        'total' => 15000,
    ]);

    // Step 1: NEW -> PROCESSING
    $this->actingAs($this->dapur)->post("/kitchen/order/{$order->id}/status", [
        'order_status' => 'PROCESSING',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'id' => $order->id,
        'order_status' => 'PROCESSING',
    ]);

    // Step 2: PROCESSING -> READY
    $this->actingAs($this->dapur)->post("/kitchen/order/{$order->id}/status", [
        'order_status' => 'READY',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'id' => $order->id,
        'order_status' => 'READY',
    ]);
});

test('cashier processes payment after customer finishes eating', function () {
    $order = PosOrder::create([
        'nomor_pesanan' => 'CP-POS-20260914-002',
        'table_id' => $this->table->id,
        'cashier_id' => $this->kasir->id,
        'order_status' => 'READY',
        'payment_status' => 'UNPAID',
        'subtotal' => 15000,
        'total' => 15000,
    ]);

    $response = $this->actingAs($this->kasir)->post('/pos/payment', [
        'order_id' => $order->id,
        'metode_pembayaran' => 'Cash',
        'jumlah_bayar' => 20000,
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_orders', [
        'id' => $order->id,
        'order_status' => 'COMPLETED',
        'payment_status' => 'PAID',
    ]);

    $this->assertDatabaseHas('pos_payments', [
        'order_id' => $order->id,
        'cashier_id' => $this->kasir->id,
        'metode_pembayaran' => 'Cash',
        'jumlah_bayar' => 20000,
        'kembalian' => 5000,
    ]);

    $this->assertDatabaseHas('pos_tables', [
        'id' => $this->table->id,
        'status' => 'NEEDS_CLEANING',
    ]);
});

test('staff can clean table to make it AVAILABLE again', function () {
    $this->table->update(['status' => 'NEEDS_CLEANING']);

    $response = $this->actingAs($this->dapur)->post("/kitchen/table/{$this->table->id}/clean");
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('pos_tables', [
        'id' => $this->table->id,
        'status' => 'AVAILABLE',
    ]);
});
