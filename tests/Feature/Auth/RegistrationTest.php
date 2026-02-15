<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register with strong password', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password1@',
        'password_confirmation' => 'Password1@',
    ]);

    $response->assertRedirect(route('login'));
});

test('weak password is rejected', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'weak@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('password');
});
