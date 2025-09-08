<?php

namespace App\Http\Controllers;

use App\Models\Motif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class MotifBatikController extends Controller
{
    /**
     * Menampilkan daftar semua motif batik.
     */
    public function index()
    {
        // Ambil semua data motif, diurutkan dari yang terbaru.
        $motifs = Motif::latest()->get();

        // Transformasi koleksi untuk membuat URL gambar secara manual di controller.
        $transformedMotifs = $motifs->map(function ($motif) {
            // Ganti path gambar yang tersimpan di database menjadi URL lengkap.
            // React component akan menerima path ini sebagai URL.
            $motif->original_image_path = $motif->original_image_path
                ? Storage::url($motif->original_image_path)
                : 'https://via.placeholder.com/150'; // Sediakan gambar default jika tidak ada.
            return $motif;
        });

        return Inertia::render('settings/motif-batik', [
            'motifs' => $transformedMotifs,
        ]);
    }

    /**
     * Menyimpan motif batik baru ke dalam database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'description' => 'nullable|string',
            'difficulty' => ['required', Rule::in(['mudah', 'sedang', 'sulit'])],
            'original_image_path' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Simpan file di storage/app/public/motifs dan dapatkan path relatifnya.
        $path = $request->file('original_image_path')->store('motifs', 'public');

        Motif::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'difficulty' => $validated['difficulty'],
            'original_image_path' => $path, // Simpan path relatif ke database.
        ]);

        return Redirect::route('motif-batik.index')->with('success', 'Motif berhasil ditambahkan.');
    }

    /**
     * Memperbarui motif batik yang ada.
     */
    public function update(Request $request, Motif $motif_batik)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'description' => 'nullable|string',
            'difficulty' => ['required', Rule::in(['mudah', 'sedang', 'sulit'])],
            'original_image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Siapkan data untuk diupdate.
        $dataToUpdate = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'difficulty' => $validated['difficulty'],
        ];

        // Cek jika ada file gambar baru yang di-upload.
        if ($request->hasFile('original_image_path')) {
            // Hapus gambar lama dari storage jika ada.
            if ($motif_batik->original_image_path) {
                Storage::disk('public')->delete($motif_batik->original_image_path);
            }
            // Simpan gambar baru dan tambahkan path-nya ke data yang akan di-update.
            $dataToUpdate['original_image_path'] = $request->file('original_image_path')->store('motifs', 'public');
        }

        $motif_batik->update($dataToUpdate);

        return Redirect::route('motif-batik.index')->with('success', 'Motif berhasil diperbarui.');
    }

    /**
     * Menghapus motif batik dari database.
     */
    public function destroy(Motif $motif_batik)
    {
        // Hapus file gambar dari storage berdasarkan path yang ada di database.
        if ($motif_batik->original_image_path) {
            Storage::disk('public')->delete($motif_batik->original_image_path);
        }

        // Hapus record dari database.
        $motif_batik->delete();

        return Redirect::route('motif-batik.index')->with('success', 'Motif berhasil dihapus.');
    }
}
