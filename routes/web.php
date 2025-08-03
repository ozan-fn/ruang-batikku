<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/ruang-batik', function () {
    return Inertia::render('ruang-batik');
})->name('ruang-batik');

Route::get('/galeri-batik', function () {
    return Inertia::render('galeri-batik');
})->name('galeri-batik');

Route::get('/peringkat', function () {
    return Inertia::render('peringkat');
})->name('peringkat');

Route::get('/komunitas', function () {
    return Inertia::render('komunitas');
})->name('komunitas');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
