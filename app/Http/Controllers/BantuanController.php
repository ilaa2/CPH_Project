<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class BantuanController extends Controller
{
    public function index()
    {
        return Inertia::render('Bantuan/Index');
    }
}
