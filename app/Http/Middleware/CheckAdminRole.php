<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Periksa apakah pengguna sudah login DAN perannya adalah 'admin'
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            // Jika tidak, tolak akses dengan halaman error 403 (Forbidden)
            abort(403, 'ANDA TIDAK MEMILIKI AKSES KE HALAMAN INI.');
        }

        // Jika pengguna adalah admin, lanjutkan permintaan ke controller
        return $next($request);
    }
}
