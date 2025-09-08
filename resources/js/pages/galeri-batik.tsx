import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import GuestLayout from '@/layouts/guest-layout';
import { Head, usePage } from '@inertiajs/react'; // <-- Import usePage untuk mengambil props
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export interface MotifBatik {
    id: number;
    nama: string;
    asal: string;
    deskripsi: string;
    sumberFoto: string;
}

// Tipe untuk props yang diterima dari controller
type PageProps = {
    galleries: MotifBatik[];
};

export default function GaleriBatik() {
    // Ambil data 'galleries' dari props yang dikirim oleh controller
    const { galleries } = usePage<PageProps>().props;

    const [selectedMotif, setSelectedMotif] = useState<MotifBatik | null>(null);

    return (
        <GuestLayout>
            <Head title="Galeri Batik" />

            <div className="mx-auto mt-24 flex w-full max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 flex-col gap-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
                        <h1 className="text-2xl font-bold sm:text-3xl">MACAM-MACAM MOTIF BATIK DI INDONESIA</h1>
                        <p className="mt-2 max-w-3xl">
                            Kenali berbagai motif batik tradisional Indonesia yang kaya akan makna dan cerita. Setiap pola mencerminkan filosofi dan
                            identitas budaya dari daerah asalnya. Jelajahi keindahan visual dan nilai luhur yang tertanam dalam warisan kain
                            nusantara.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 overflow-hidden sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Gunakan data 'galleries' dari props untuk me-render list */}
                        {galleries.map((v, i) => (
                            <motion.div
                                key={v.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                onClick={() => setSelectedMotif(v)}
                                className="cursor-pointer"
                            >
                                <CardContainer className="w-full" containerClassName="py-0">
                                    <CardBody className="group/card relative h-full w-full rounded-xl border border-black/[0.1] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl">
                                        <CardItem translateZ="50" className="text-xl font-bold text-neutral-800">
                                            {v.nama}
                                        </CardItem>
                                        <CardItem as="p" translateZ="60" className="mt-2 line-clamp-3 text-sm text-neutral-600">
                                            {v.deskripsi}
                                        </CardItem>
                                        <CardItem translateZ="100" className="mt-4 aspect-video w-full">
                                            <motion.img
                                                layoutId={`image-${v.id}`}
                                                src={v.sumberFoto}
                                                className="h-full w-full rounded-lg object-cover"
                                                alt={`Batik ${v.nama}`}
                                            />
                                        </CardItem>
                                    </CardBody>
                                </CardContainer>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedMotif && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
                            <motion.button
                                onClick={() => setSelectedMotif(null)}
                                className="absolute top-4 right-4 z-10 rounded-full bg-white/70 p-2 text-gray-700 transition-colors hover:bg-white hover:text-black"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                            <div className="max-h-[90vh] overflow-y-auto">
                                <motion.img
                                    layoutId={`image-${selectedMotif.id}`}
                                    src={selectedMotif.sumberFoto}
                                    className="aspect-video w-full object-cover"
                                    alt={`Batik ${selectedMotif.nama}`}
                                />
                                <div className="p-6 md:p-8">
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                                        className="text-3xl font-bold text-gray-900"
                                    >
                                        {selectedMotif.nama}
                                    </motion.h2>
                                    <motion.h3
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
                                        className="mt-1 text-lg font-semibold text-indigo-600"
                                    >
                                        Asal: {selectedMotif.asal}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
                                        className="mt-4 leading-relaxed text-gray-700"
                                    >
                                        {selectedMotif.deskripsi}
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                        {/* Backdrop untuk menutup modal saat diklik di luar area konten */}
                        <div className="absolute inset-0 -z-10" onClick={() => setSelectedMotif(null)}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
