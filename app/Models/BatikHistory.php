<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatikHistory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'motif_id',
        'submitted_image_path', // Path ke gambar hasil karya user
        'score', // Skor yang didapat setelah perbandingan
    ];

    /**
     * Mendapatkan user yang memiliki history ini.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendapatkan motif yang terkait dengan history ini.
     */
    public function motif()
    {
        return $this->belongsTo(Motif::class);
    }
}
