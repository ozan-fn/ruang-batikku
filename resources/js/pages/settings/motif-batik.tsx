// src/Pages/settings/motif-batik.tsx

'use client';

import { FormEventHandler, useState } from 'react';

// Import komponen dari shadcn/ui
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error'; // Menggunakan komponen error dari contoh Anda
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Menggunakan Label dasar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import SettingsLayout from '@/layouts/settings/layout';
// Import hooks dari Inertia. Ini adalah satu-satunya hook form yang kita perlukan.
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

// Tipe data dari Laravel
type BatikMotif = {
    id: number;
    name: string;
    description: string | null;
    original_image_path: string; // Ini akan menjadi URL
    difficulty: 'mudah' | 'sedang' | 'sulit';
};

// Tipe props dari controller
type PageProps = {
    motifs: BatikMotif[];
    flash: {
        success?: string;
    };
};

// Tipe untuk data form
type MotifFormData = {
    name: string;
    description: string;
    difficulty: 'mudah' | 'sedang' | 'sulit';
    original_image_path: File | null;
    _method: 'POST' | 'PUT' | 'PATCH';
};

// Komponen utama
export default function MotifBatik() {
    const { motifs } = usePage<PageProps>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMotif, setEditingMotif] = useState<BatikMotif | null>(null);

    // 1. Gunakan useForm dari @inertiajs/react sebagai satu-satunya pengelola form
    const { data, setData, post, errors, processing, recentlySuccessful, reset, clearErrors } = useForm<MotifFormData>({
        name: '',
        description: '',
        difficulty: 'sedang',
        original_image_path: null,
        _method: 'POST',
    });

    // 2. Fungsi submit sekarang langsung menggunakan 'post' dari hook Inertia
    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const onFinish = () => {
            closeDialog();
        };

        if (editingMotif) {
            // Untuk update, kita kirim via POST tapi dengan _method: 'PATCH'
            post(route('motif-batik.update', editingMotif.id), {
                onSuccess: onFinish,
                preserveScroll: true,
            });
        } else {
            post(route('motif-batik.store'), {
                onSuccess: onFinish,
                preserveScroll: true,
            });
        }
    };

    const openDialog = (motif: BatikMotif | null = null) => {
        clearErrors();
        setEditingMotif(motif);
        if (motif) {
            setData({
                name: motif.name,
                description: motif.description || '',
                difficulty: motif.difficulty,
                original_image_path: null,
                _method: 'PATCH',
            });
        } else {
            // Fungsi reset() dari hook Inertia akan mengembalikan form ke state awal
            reset();
            setData('description', ''); // Pastikan deskripsi juga kosong
            setData('_method', 'POST');
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingMotif(null);
        reset();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus motif ini?')) {
            router.delete(route('motif-batik.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Kelola Motif Batik" />

            <SettingsLayout>
                <div className="flex flex-col space-y-6">
                    <HeadingSmall title="Motif Batik" description="Kelola daftar motif batik yang ada di dalam sistem." />

                    <div className="flex justify-end">
                        <Button onClick={() => openDialog()}>Tambah Motif Baru</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Gambar</TableHead>
                                <TableHead>Nama Motif</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Tingkat Kesulitan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {motifs.map((motif) => (
                                <TableRow key={motif.id}>
                                    <TableCell>{motif.id}</TableCell>
                                    <TableCell>
                                        <img src={motif.original_image_path} alt={motif.name} className="h-12 w-12 rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{motif.name}</TableCell>
                                    <TableCell>{motif.description}</TableCell>
                                    <TableCell className="capitalize">{motif.difficulty}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="sm" onClick={() => openDialog(motif)}>
                                            Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(motif.id)}>
                                            Hapus
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingMotif ? 'Edit Motif Batik' : 'Tambah Motif Batik Baru'}</DialogTitle>
                                <DialogDescription>
                                    {editingMotif
                                        ? 'Lakukan perubahan pada detail motif di bawah ini.'
                                        : 'Isi detail untuk menambahkan motif baru ke dalam koleksi.'}
                                </DialogDescription>
                            </DialogHeader>

                            {/* 3. Stuktur form disederhanakan, tanpa <Form> dan <FormField> */}
                            <form onSubmit={onSubmit} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Motif</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Mega Mendung"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Jelaskan sedikit tentang makna atau asal-usul motif..."
                                        className="resize-none"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Tingkat Kesulitan</Label>
                                    <Select
                                        onValueChange={(value: 'mudah' | 'sedang' | 'sulit') => setData('difficulty', value)}
                                        value={data.difficulty}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tingkat kesulitan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mudah">Mudah</SelectItem>
                                            <SelectItem value="sedang">Sedang</SelectItem>
                                            <SelectItem value="sulit">Sulit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.difficulty} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="image">Gambar Asli</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('original_image_path', e.target.files ? e.target.files[0] : null)}
                                    />
                                    <InputError message={errors.original_image_path} />
                                    {data.original_image_path && (
                                        <img
                                            src={URL.createObjectURL(data.original_image_path)}
                                            alt="Preview"
                                            className="mt-2 h-20 w-20 rounded-md object-cover"
                                        />
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={closeDialog}>
                                        Batal
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : editingMotif ? 'Simpan Perubahan' : 'Tambah Motif'}
                                        </Button>
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">Tersimpan.</p>
                                        </Transition>
                                    </div>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </GuestLayout>
    );
}
