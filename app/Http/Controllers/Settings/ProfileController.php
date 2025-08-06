<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            // Hapus file lama jika ada
            if ($request->user()->avatar && Storage::disk('public')->exists($request->user()->avatar)) {
                Storage::disk('public')->delete($request->user()->avatar);
            }

            $file = $request->file('avatar');
            $imagePath = $file->getRealPath();
            $mime = $file->getMimeType();

            $src = match ($mime) {
                'image/jpeg' => imagecreatefromjpeg($imagePath),
                'image/png' => imagecreatefrompng($imagePath),
                'image/webp' => imagecreatefromwebp($imagePath),
                default => null,
            };

            if ($src) {
                $width = imagesx($src);
                $height = imagesy($src);

                if ($width > 512 || $height > 512) {
                    $cropSize = 512;
                    $x = ($width - $cropSize) / 2;
                    $y = ($height - $cropSize) / 2;

                    $cropped = imagecrop($src, ['x' => $x, 'y' => $y, 'width' => $cropSize, 'height' => $cropSize]);
                } else {
                    $cropped = $src;
                }

                ob_start();
                imagepng($cropped);
                $imageData = ob_get_clean();

                $filename = 'avatars/' . $request->user()->id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.png';
                Storage::disk('public')->put($filename, $imageData);

                imagedestroy($src);
                if ($cropped !== $src) {
                    imagedestroy($cropped);
                }

                $request->user()->avatar = $filename;
            } else {
                // fallback: simpan original jika format tidak didukung
                $filename = 'avatars/' . $request->user()->id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('avatars', $file, basename($filename));
                $request->user()->avatar = $filename;
            }
        }

        $request->user()->save();

        return to_route('profile.edit');
    }


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
