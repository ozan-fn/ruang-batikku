<?php

namespace App\Http\Controllers;

use App\Models\BatikHistory;
use App\Models\Motif;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

// Library perceptual hashing
use Jenssegers\ImageHash\ImageHash;
use Jenssegers\ImageHash\Implementations\DifferenceHash;

class RuangBatikController extends Controller
{
    /**
     * Menampilkan halaman utama Ruang Batik.
     */
    public function index()
    {
        $motifs = Motif::select('id', 'name', 'original_image_path')->get()->map(function ($motif) {
            $motif->src = $motif->original_image_path ? Storage::url($motif->original_image_path) : null;
            return $motif;
        });

        // Siapkan data statistik jika user sudah login
        $userStats = null;
        if (Auth::check()) {
            $user = Auth::user();
            $userStats = [
                // ignore type error
                'total_score' => $user->batikHistories()->sum('score'),
                'submission_count' => $user->batikHistories()->count(),
            ];
        }

        return Inertia::render('ruang-batik/Index', [
            'motifs' => $motifs,
            'userStats' => $userStats,
        ]);
    }

    /**
     * Menyediakan data riwayat karya milik user yang sedang login.
     */
    public function history()
    {
        $userHistories = BatikHistory::where('user_id', Auth::id())
            ->with('motif:id,name') // Ambil relasi motif untuk ditampilkan
            ->latest()
            ->get()
            ->map(function ($history) {
                // Format data agar mudah digunakan di frontend
                $history->submitted_image_url = Storage::url($history->submitted_image_path);
                return $history;
            });

        // Inertia akan mengirimkan ini sebagai partial reload
        return response()->json($userHistories);
    }

    /**
     * Menyimpan hasil karya batik dari user, membandingkannya, dan memberi skor.
     */
    public function store(Request $request)
    {
        $request->validate([
            'motif_id' => 'required|exists:motifs,id',
            'image_data_url' => 'required|string', // Frontend akan mengirim gambar dalam format base64
        ]);

        // 1. Parse data URL dengan lebih aman
        $imageDataUrl = $request->image_data_url;

        if (!preg_match('/^data:image\/(?P<ext>[a-zA-Z0-9]+);base64,(?P<data>.+)$/', $imageDataUrl, $matches)) {
            return Redirect::route('ruang-batik.index')->with('error', 'Format gambar tidak valid.');
        }

        $ext = strtolower($matches['ext']);
        if ($ext === 'jpeg') $ext = 'jpg';
        $allowed = ['png', 'jpg', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            return Redirect::route('ruang-batik.index')->with('error', 'Jenis file gambar tidak didukung.');
        }

        $decoded = base64_decode($matches['data']);
        if ($decoded === false) {
            return Redirect::route('ruang-batik.index')->with('error', 'Gagal mendecode gambar.');
        }

        $imageName = 'submission_' . Auth::id() . '_' . time() . '.' . $ext;
        $submittedImagePath = 'submissions/' . $imageName;
        Storage::disk('public')->put($submittedImagePath, $decoded);

        // default values
        $score = 0;
        $similarity = 0.0;
        $distance = null;

        // 2. Siapkan perbandingan dengan library (jenssegers/imagehash)
        $motif = Motif::find($request->motif_id);

        if ($motif && $motif->original_image_path && Storage::disk('public')->exists($motif->original_image_path)) {
            $originalFullPath = Storage::disk('public')->path($motif->original_image_path);
            $userFullPath = Storage::disk('public')->path($submittedImagePath);

            try {
                // 2.a - Jika canvas user kosong (transparan / putih hampir seluruhnya) -> skor 0
                if ($this->isImageBlank($userFullPath)) {
                    $score = 0;
                    $similarity = 0.0;
                    $distance = null;
                } else {
                    // gunakan DifferenceHash (atau ganti ke PerceptualHash jika diinginkan)
                    $hasher = new ImageHash(new DifferenceHash());

                    $hashOriginal = $hasher->hash($originalFullPath);
                    $hashUser = $hasher->hash($userFullPath);

                    // hitung hamming distance
                    // $hashOriginal->distance($hashUser) atau $hasher->distance(...)
                    $distance = $hashOriginal->distance($hashUser);

                    // jumlah bit hash = panjang string toBits()
                    $bits = strlen($hashOriginal->toBits());
                    if ($bits <= 0) {
                        // fallback ke metode MSE sederhana jika hash gagal
                        $similarity = $this->fallbackSimilarity($originalFullPath, $userFullPath);
                    } else {
                        $similarity = (1 - ($distance / $bits)) * 100; // 0..100
                    }

                    // round dan pastikan 0..100
                    $similarity = max(0, min(100, round($similarity, 2)));
                    $score = (int) round($similarity);
                }
            } catch (\Throwable $e) {
                // jika error di hashing, beri skor 0 (jangan crash produksi)
                // Anda bisa juga log error di sini jika ingin
                $score = 0;
                $similarity = 0.0;
                $distance = null;
            }
        } else {
            // motif asli tidak ditemukan -> skor 0
            $score = 0;
            $similarity = 0.0;
            $distance = null;
        }

        // 3. Simpan ke database
        $history = BatikHistory::create([
            'user_id' => Auth::id(),
            'motif_id' => $request->motif_id,
            'submitted_image_path' => $submittedImagePath,
            'score' => $score,
        ]);

        // 4. Redirect dengan flash message yang berisi skor + similarity (agar frontend bisa tampilkan)
        // juga sertakan distance bila perlu
        $redirect = Redirect::route('ruang-batik.index')
            ->with('success', 'Karya berhasil dikumpulkan!')
            ->with('score', $score)
            ->with('similarity', $similarity);

        if (!is_null($distance)) {
            $redirect = $redirect->with('distance', $distance);
        }

        return $redirect;
    }

    /**
     * Deteksi apakah suatu gambar "kosong" — hampir seluruhnya transparan atau putih.
     * Metode sampling untuk performa. Mengembalikan true jika jumlah piksel non-blank
     * relatif kecil (default <1%).
     */
    private function isImageBlank(string $path, int $step = 6, float $thresholdPercent = 0.01): bool
    {
        if (!file_exists($path)) return true;

        $data = @file_get_contents($path);
        if ($data === false) return true;

        $im = @imagecreatefromstring($data);
        if (!$im) return true;

        $w = imagesx($im);
        $h = imagesy($im);
        $totalSamples = 0;
        $nonBlank = 0;

        for ($y = 0; $y < $h; $y += $step) {
            for ($x = 0; $x < $w; $x += $step) {
                $totalSamples++;
                $color = imagecolorat($im, $x, $y);

                // alpha: 0 (opaque) .. 127 (fully transparent)
                $alpha = ($color >> 24) & 0x7F;
                if ($alpha >= 120) {
                    // treat highly transparent pixel as blank: continue
                    continue;
                }

                $r = ($color >> 16) & 0xFF;
                $g = ($color >> 8) & 0xFF;
                $b = $color & 0xFF;

                // jika bukan putih hampir murni, berarti ada isi
                if (!($r > 250 && $g > 250 && $b > 250)) {
                    $nonBlank++;
                }
            }
        }

        imagedestroy($im);

        if ($totalSamples === 0) {
            return true;
        }

        $ratio = $nonBlank / $totalSamples;
        return ($ratio < $thresholdPercent);
    }

    /**
     * Fallback similarity (jika hashing gagal): metode sederhana berbasis grayscale MSE -> similarity 0..100
     * (digunakan hanya sebagai cadangan).
     */
    private function fallbackSimilarity(string $path1, string $path2): float
    {
        try {
            $data1 = @file_get_contents($path1);
            $data2 = @file_get_contents($path2);
            if ($data1 === false || $data2 === false) return 0.0;
            $im1 = @imagecreatefromstring($data1);
            $im2 = @imagecreatefromstring($data2);
            if (!$im1 || !$im2) return 0.0;

            $width = 200;
            $height = 200;
            $res1 = imagecreatetruecolor($width, $height);
            $res2 = imagecreatetruecolor($width, $height);
            imagealphablending($res1, false);
            imagesavealpha($res1, true);
            imagealphablending($res2, false);
            imagesavealpha($res2, true);

            imagecopyresampled($res1, $im1, 0, 0, 0, 0, $width, $height, imagesx($im1), imagesy($im1));
            imagecopyresampled($res2, $im2, 0, 0, 0, 0, $width, $height, imagesx($im2), imagesy($im2));

            imagefilter($res1, IMG_FILTER_GRAYSCALE);
            imagefilter($res2, IMG_FILTER_GRAYSCALE);

            $mse = 0.0;
            for ($y = 0; $y < $height; $y++) {
                for ($x = 0; $x < $width; $x++) {
                    $c1 = imagecolorat($res1, $x, $y) & 0xFF;
                    $c2 = imagecolorat($res2, $x, $y) & 0xFF;
                    $diff = $c1 - $c2;
                    $mse += ($diff * $diff);
                }
            }
            $mse = $mse / ($width * $height);
            $rmse = sqrt($mse);
            $similarity = (1 - ($rmse / 255)) * 100;
            imagedestroy($im1);
            imagedestroy($im2);
            imagedestroy($res1);
            imagedestroy($res2);
            return max(0, min(100, round($similarity, 2)));
        } catch (\Throwable $e) {
            return 0.0;
        }
    }
}
