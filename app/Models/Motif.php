<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Motif extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'original_image_path', // Path ke gambar motif asli
        'difficulty', // Contoh: 'mudah', 'sedang', 'sulit'
    ];

    /**
     * Mendapatkan semua history yang terkait dengan motif ini.
     */
    public function batikHistories()
    {
        return $this->hasMany(BatikHistory::class);
    }
}
