<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SetelanController extends Controller
{
    public function index()
    {
        return Inertia::render('Setelan/Index');
    }
}
