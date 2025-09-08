<?php

use App\Http\Controllers\GaleriBatikController;
use App\Http\Controllers\MotifBatikController;
use App\Http\Controllers\RuangBatikController;
use App\Models\GaleriBatik;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/ruang-batik', [RuangBatikController::class, 'index'])->name('ruang-batik.index');

Route::get('/galeri', function () {
    $galleries = GaleriBatik::latest()->get()->map(function ($item) {
        return [
            'id' => $item->id,
            'nama' => $item->name,
            'asal' => $item->origin,
            'deskripsi' => $item->description,
            'sumberFoto' => $item->image_path ? Storage::url($item->image_path) : null,
        ];
    });

    return Inertia::render('galeri-batik', [
        'galleries' => $galleries
    ]);
})->name('galeri-batik');
Route::get('/peringkat', function () {
    return Inertia::render('peringkat', [
        'leaderboard' => User::select('id', 'name', 'avatar') // <-- Tambahkan 'avatar'
            ->withSum('batikHistories', 'score')
            ->orderBy('batik_histories_sum_score', 'desc')
            ->paginate(20)
            ->through(fn($user) => [ // Gunakan 'through' untuk transformasi data
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null, // Ubah path menjadi URL
                'batik_histories_sum_score' => $user->batik_histories_sum_score,
            ]),
    ]);
})->name('peringkat');

// Route::get('/peringkat', fn() => Inertia::render('peringkat'))->name('peringkat');
Route::get('/komunitas', fn() => Inertia::render('komunitas'))->name('komunitas');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/ruang-batik/store', [RuangBatikController::class, 'store'])->name('ruang-batik.store');
    Route::get('/ruang-batik/history', [RuangBatikController::class, 'history'])->name('ruang-batik.history');

    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    Route::middleware('admin')->group(function () {
        Route::resource('/settings/motif-batik', MotifBatikController::class);
        Route::resource('/settings/galeri-batik', GaleriBatikController::class);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
