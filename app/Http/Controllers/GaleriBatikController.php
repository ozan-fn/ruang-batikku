<?php

namespace App\Http\Controllers;

use App\Models\GaleriBatik; // Pastikan model sudah di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GaleriBatikController extends Controller
{
    /**
     * Menampilkan halaman galeri batik dengan semua data.
     */
    public function index()
    {
        // Ambil semua data dan transformasikan path gambar menjadi URL yang bisa diakses
        $galleries = GaleriBatik::latest()->get()->map(function ($item) {
            $item->image_path = $item->image_path ? Storage::url($item->image_path) : null;
            return $item;
        });

        return Inertia::render('settings/galeri-batik', [
            'galleries' => $galleries,
        ]);
    }

    /**
     * Menyimpan item baru ke dalam database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'origin' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_path' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $path = $request->file('image_path')->store('galleries', 'public');

        GaleriBatik::create([
            'name' => $validated['name'],
            'origin' => $validated['origin'],
            'description' => $validated['description'],
            'image_path' => $path,
        ]);

        return Redirect::route('galeri-batik.index')->with('success', 'Item berhasil ditambahkan.');
    }

    /**
     * Memperbarui item yang ada di database.
     * Menggunakan Route Model Binding ($galeri_batik)
     */
    public function update(Request $request, GaleriBatik $galeri_batik)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'origin' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Tidak wajib saat update
        ]);

        $dataToUpdate = [
            'name' => $validated['name'],
            'origin' => $validated['origin'],
            'description' => $validated['description'],
        ];

        if ($request->hasFile('image_path')) {
            // Hapus gambar lama jika ada
            if ($galeri_batik->image_path) {
                Storage::disk('public')->delete($galeri_batik->image_path);
            }
            // Simpan gambar baru
            $dataToUpdate['image_path'] = $request->file('image_path')->store('galleries', 'public');
        }

        $galeri_batik->update($dataToUpdate);

        return Redirect::route('galeri-batik.index')->with('success', 'Item berhasil diperbarui.');
    }

    /**
     * Menghapus item dari database.
     */
    public function destroy(GaleriBatik $galeri_batik)
    {
        // Hapus file gambar dari storage
        if ($galeri_batik->image_path) {
            Storage::disk('public')->delete($galeri_batik->image_path);
        }

        // Hapus record dari database
        $galeri_batik->delete();

        return Redirect::route('galeri-batik.index')->with('success', 'Item berhasil dihapus.');
    }

    // Metode di bawah ini tidak digunakan dalam alur CRUD Inertia dengan modal,
    // jadi bisa dibiarkan kosong.
    public function create() {}
    public function show(string $id) {}
    public function edit(string $id) {}
}
