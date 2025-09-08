<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GaleriBatik extends Model
{
    use HasFactory;

    /**
     * Menentukan nama tabel yang digunakan oleh model ini.
     *
     * @var string
     */
    protected $table = 'galeri_batik';

    /**
     * Atribut yang boleh diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'origin',
        'description',
        'image_path',
    ];
}
