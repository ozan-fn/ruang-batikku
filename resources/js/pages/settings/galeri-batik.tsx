// src/Pages/settings/galeri-batik.tsx

'use client';

import { FormEventHandler, useState } from 'react';

// Import komponen UI dan Layout
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

// Tipe data dari model GaleriBatik di Laravel
type GaleriBatik = {
    id: number;
    name: string;
    origin: string;
    description: string | null;
    image_path: string | null; // Tambahkan image_path
};

// Tipe props yang diterima dari controller
type PageProps = {
    galleries: GaleriBatik[];
    flash: {
        success?: string;
    };
};

// Tipe untuk data form
type GaleriBatikFormData = {
    name: string;
    origin: string;
    description: string;
    image_path: File | null; // Untuk upload file
    _method: 'POST' | 'PUT' | 'PATCH';
};

// Komponen utama
export default function GaleriBatik() {
    // Ambil data 'galleries' yang dikirim dari controller
    const { galleries } = usePage<PageProps>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GaleriBatik | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null); // State untuk preview gambar

    const { data, setData, post, errors, processing, recentlySuccessful, reset, clearErrors } = useForm<GaleriBatikFormData>({
        name: '',
        origin: '',
        description: '',
        image_path: null, // Default null untuk file
        _method: 'POST',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const onFinish = () => {
            closeDialog();
        };

        if (editingItem) {
            // Kirim request update via POST dengan method spoofing
            post(route('galeri-batik.update', editingItem.id), {
                onSuccess: onFinish,
                preserveScroll: true,
                // Pastikan file dikirim dengan header multipart/form-data
                forceFormData: true,
            });
        } else {
            post(route('galeri-batik.store'), {
                onSuccess: onFinish,
                preserveScroll: true,
                forceFormData: true, // Pastikan file dikirim
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image_path', file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const openDialog = (item: GaleriBatik | null = null) => {
        clearErrors();
        setEditingItem(item);
        if (item) {
            setData({
                name: item.name,
                origin: item.origin,
                description: item.description || '',
                image_path: null, // Reset input file saat edit, agar user harus memilih ulang jika ingin ganti
                _method: 'PATCH',
            });
            // Tampilkan gambar yang sudah ada dari database sebagai preview
            setImagePreview(item.image_path || null);
        } else {
            reset();
            setData('_method', 'POST');
            setImagePreview(null); // Kosongkan preview jika tambah baru
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(null);
        reset(); // Reset form data
        setImagePreview(null); // Kosongkan preview
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item ini dari galeri?')) {
            router.delete(route('galeri-batik.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Kelola Galeri Batik" />

            <SettingsLayout>
                <div className="flex flex-col space-y-6">
                    <HeadingSmall title="Galeri Batik" description="Kelola daftar koleksi batik yang ada di dalam galeri." />

                    <div className="flex justify-end">
                        <Button onClick={() => openDialog()}>Tambah Item Baru</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Gambar</TableHead> {/* Kolom untuk gambar */}
                                <TableHead>Nama</TableHead>
                                <TableHead>Asal Daerah</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {galleries.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>
                                        {item.image_path ? (
                                            <img src={item.image_path} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.origin}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="sm" onClick={() => openDialog(item)}>
                                            Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
                                <DialogTitle>{editingItem ? 'Edit Item Galeri' : 'Tambah Item Baru'}</DialogTitle>
                                <DialogDescription>
                                    {editingItem
                                        ? 'Lakukan perubahan pada detail item di bawah ini.'
                                        : 'Isi detail untuk menambahkan item baru ke dalam galeri.'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={onSubmit} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Batik Parang"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="origin">Asal Daerah</Label>
                                    <Input
                                        id="origin"
                                        value={data.origin}
                                        onChange={(e) => setData('origin', e.target.value)}
                                        placeholder="Contoh: Yogyakarta"
                                    />
                                    <InputError message={errors.origin} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Jelaskan sedikit tentang item batik ini..."
                                        className="resize-none"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                {/* Bagian untuk input gambar */}
                                <div className="grid gap-2">
                                    <Label htmlFor="image_path">Gambar Batik</Label>
                                    <Input id="image_path" type="file" accept="image/*" onChange={handleImageChange} />
                                    <InputError message={errors.image_path} />
                                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 rounded-md object-cover" />}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={closeDialog}>
                                        Batal
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Item'}
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
