import GuestLayout from '@/layouts/guest-layout';

import motifTujuhRupa from '@/assets/batik/batik-tujuh-rupa-min.jpg';
import motifGentongan from '@/assets/batik/genthongan-madura.jpg';
import motifKawung from '@/assets/batik/kawung.webp';
import motifKeraton from '@/assets/batik/keraton.png';
import motifMegaMendung from '@/assets/batik/mega-mendung.png';
import motifParang from '@/assets/batik/Motif-Batik-Parang-Kusumo-3.jpg.webp';
import motifSimbut from '@/assets/batik/Motif-batik-simbut.png';
import motifPringSedapur from '@/assets/batik/pring-sedapur.jpg';
import motifPriyangan from '@/assets/batik/priyangan.jpg';
import motifSogan from '@/assets/batik/sogan.jpg';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export interface MotifBatik {
    id: number;
    nama: string;
    asal: string;
    deskripsi: string;
    sumberFoto: string;
}

export const dataMotifBatik: MotifBatik[] = [
    {
        id: 1,
        nama: 'Motif Batik Tujuh Rupa',
        asal: 'Pekalongan',
        deskripsi:
            'Sangat kental dengan nuansa alam, menampilkan berbagai bentuk motif dengan gambar hewan maupun tumbuhan. Motif ini merupakan hasil campuran kebudayaan lokal dengan etnis Cina, karena Pekalongan dahulu merupakan tempat transit para pedagang dari berbagai negara. Ciri khasnya berhubungan dengan alam, seperti motif buketan, jlamprang, semen, terang bulan, lung-lungan, dan pisan bali.',
        sumberFoto: motifTujuhRupa,
    },
    {
        id: 2,
        nama: 'Motif Batik Sogan',
        asal: 'Solo',
        deskripsi:
            'Telah ada sejak zaman nenek moyang suku Jawa. Memiliki warna dominan cokelat muda dengan motif khas berupa gambar bunga dengan aksen titik-titik maupun lengkungan garis. Awalnya, batik ini hanya dikenakan oleh raja-raja di keraton kesultanan Solo, namun sekarang sudah umum digunakan oleh siapa saja.',
        sumberFoto: motifSogan,
    },
    {
        id: 3,
        nama: 'Motif Batik Gentongan',
        asal: 'Madura',
        deskripsi:
            'Menggunakan motif abstrak sederhana, tanaman, atau kombinasi keduanya dengan warna-warna terang seperti merah, hijau, kuning, atau ungu. Nama "gentongan" berasal dari gentong, yaitu gerabah yang digunakan sebagai wadah untuk mencelupkan kain batik ke dalam cairan pewarna.',
        sumberFoto: motifGentongan,
    },
    {
        id: 4,
        nama: 'Motif Batik Mega Mendung',
        asal: 'Cirebon',
        deskripsi:
            'Merupakan motif yang sederhana namun memberi kesan mewah. Motifnya berupa awan di langit mega dengan nuansa warna cerah, menjadikannya cocok digunakan oleh semua kalangan, baik tua maupun muda, laki-laki maupun perempuan.',
        sumberFoto: motifMegaMendung,
    },
    {
        id: 5,
        nama: 'Motif Batik Keraton',
        asal: 'Yogyakarta',
        deskripsi:
            'Berasal dari kebudayaan Jawa yang kental akan sistem kesultanan dan menjadi lambang kearifan, kebijaksanaan, serta kharisma raja-raja Jawa. Ciri khasnya adalah motif bunga yang simetris atau sayap burung yang dikenal sebagai motif sawat lar. Awalnya hanya untuk warga keraton, kini sudah umum dipakai.',
        sumberFoto: motifKeraton,
    },
    {
        id: 6,
        nama: 'Motif Batik Simbut',
        asal: 'Banten',
        deskripsi:
            'Memiliki gambar menyerupai bentuk daun talas dan merupakan motif yang paling sederhana, hanya dengan menyusun satu jenis motif saja. Berasal dari suku Badui pedalaman, motif ini kemudian berkembang di pesisir Banten dan dikenal juga sebagai batik Banten.',
        sumberFoto: motifSimbut,
    },
    {
        id: 7,
        nama: 'Motif Parang',
        asal: 'Pulau Jawa',
        deskripsi:
            'Berasal dari kata "pereng" yang berarti miring, motif ini berbentuk seperti huruf "S" yang miring berombak dan memanjang. Motif ini tersebar di seluruh Jawa (Tengah, Yogyakarta, Barat) dengan variasi aksen yang berbeda, seperti parang rusak, parang barong, parang slobog, dan parang klisik.',
        sumberFoto: motifParang,
    },
    {
        id: 8,
        nama: 'Motif Batik Kawung',
        asal: 'Jawa Tengah',
        deskripsi:
            'Terinspirasi dari bentuk buah kolang-kaling yang lonjong dan disusun pada empat sisi membentuk lingkaran. Motif ini sering dianggap kuno namun merupakan salah satu yang paling banyak digunakan. Berkembang di Jawa Tengah dan Yogyakarta dengan perbedaan hanya pada hiasan atau aksennya.',
        sumberFoto: motifKawung,
    },
    {
        id: 9,
        nama: 'Motif Pring Sedapur',
        asal: 'Magetan',
        deskripsi:
            'Memiliki ciri khas yang elegan dan sederhana dengan motif utama berupa gambar bambu (pring). Filosofinya memberikan makna ketentraman, kerukunan, dan keteduhan, serta mengajarkan bahwa hidup harus memberi manfaat bagi orang lain.',
        sumberFoto: motifPringSedapur,
    },
    {
        id: 10,
        nama: 'Motif Priyangan',
        asal: 'Tasikmalaya',
        deskripsi:
            'Terinspirasi dari tumbuhan yang digambar dan disusun secara simetris dan rapi, memberikan kesan elegan. Warnanya cenderung terang namun kalem dan tidak mencolok, membuatnya cocok untuk berbagai suasana dan acara.',
        sumberFoto: motifPriyangan,
    },
];

export default function GaleriBatik() {
    const [selectedMotif, setSelectedMotif] = useState<MotifBatik | null>(null);

    return (
        <GuestLayout>
            <div className="mx-auto mt-12 flex w-full max-w-7xl flex-1 flex-col overflow-auto">
                <div className="flex flex-1 flex-col gap-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
                        <h1 className="font-['Anek_Latin'] text-3xl font-bold text-gray-800 md:text-4xl">MACAM-MACAM MOTIF BATIK DI INDONESIA</h1>
                        <p className="mt-2 max-w-3xl text-gray-600">
                            Kenali berbagai motif batik tradisional Indonesia yang kaya akan makna dan cerita. Setiap pola mencerminkan filosofi dan
                            identitas budaya dari daerah asalnya. Jelajahi keindahan visual dan nilai luhur yang tertanam dalam warisan kain
                            nusantara.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 overflow-hidden sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                        {dataMotifBatik.map((v, i) => (
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
                                    className="h-auto w-full object-cover md:h-96"
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
                        {/* This is the backdrop with the close function */}
                        <div className="absolute inset-0 -z-10" onClick={() => setSelectedMotif(null)}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
