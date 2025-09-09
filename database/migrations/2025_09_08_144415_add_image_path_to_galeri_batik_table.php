<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('galeri_batik', function (Blueprint $table) {
            // Menambahkan kolom untuk path gambar setelah kolom 'description'
            $table->string('image_path')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galeri_batik', function (Blueprint $table) {
            // Menghapus kolom jika migration di-rollback
            $table->dropColumn('image_path');
        });
    }
};
