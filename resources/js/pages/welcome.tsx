import { motion } from 'framer-motion'; // Mengimpor library 'framer-motion' untuk animasi
// Pastikan Anda memiliki komponen-komponen ini di proyek Anda
import dash_image from '@/assets/dash_image.png';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';

// Komponen utama untuk halaman "Welcome" atau beranda.
export default function Welcome() {
    return (
        // Menggunakan 'GuestLayout' sebagai pembungkus utama halaman,
        // yang biasanya menangani header, footer, dan latar belakang.
        <GuestLayout>
            <Head title="Selamat Datang" />
            {/* Kontainer utama dengan padding dan margin responsif.
                - mx-auto: Memusatkan kontainer.
                - max-w-7xl: Membatasi lebar maksimum di layar besar.
                - px-4 sm:px-6 lg:px-8: Padding horizontal yang beradaptasi dengan ukuran layar.
                - mt-*: Margin atas yang beradaptasi.
            */}
            <div className="mx-auto mt-22 w-full max-w-7xl px-4 pb-24 sm:px-6 md:mt-16 lg:mt-18 lg:px-8">
                {/*
                  - Tata letak fleksibel (flex) untuk konten utama.
                  - Awalnya tumpukan vertikal (flex-col) di layar kecil.
                  - Berubah menjadi berdampingan (lg:flex-row) di layar besar (lg).
                  - justify-between: Memberi jarak antara kolom teks dan gambar.
                */}
                <div className="relative flex flex-col items-center justify-between pt-10 lg:flex-row lg:items-center">
                    {/* --- Kolom Teks (Kiri di layar besar) --- */}
                    {/*
                      - order-2 lg:order-1: Di layar kecil, kolom ini ada di bawah gambar. Di layar besar, ia pindah ke urutan pertama (kiri).
                      - text-center lg:text-left: Teks rata tengah di layar kecil, dan rata kiri di layar besar.
                      - gap-6: Memberi jarak antar elemen di dalamnya.
                    */}
                    <div className="order-2 mt-10 flex flex-col items-center justify-center gap-6 text-center lg:order-1 lg:mt-0 lg:items-start lg:text-left">
                        {/* Tagline kecil dengan animasi masuk dari kiri */}
                        <motion.div
                            animate={{ x: [-12, 0], opacity: [0, 1] }}
                            transition={{ type: 'spring' }}
                            className="inline-flex w-fit items-center justify-start gap-2.5 overflow-hidden rounded-full bg-white px-3 py-2.5"
                        >
                            <div className="relative">
                                {/* Ikon titik berwarna */}
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g filter="url(#filter0_d_82_277)">
                                        <rect x="6" y="6" width="10" height="10" rx="5" fill="#955932" />
                                    </g>
                                    <defs>
                                        <filter
                                            id="filter0_d_82_277"
                                            x="0"
                                            y="0"
                                            width="22"
                                            height="22"
                                            filterUnits="userSpaceOnUse"
                                            colorInterpolationFilters="sRGB"
                                        >
                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                            <feColorMatrix
                                                in="SourceAlpha"
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                result="hardAlpha"
                                            />
                                            <feOffset />
                                            <feGaussianBlur stdDeviation="3" />
                                            <feComposite in2="hardAlpha" operator="out" />
                                            <feColorMatrix type="matrix" values="0 0 0 0 0.584314 0 0 0 0 0.34902 0 0 0 0 0.196078 0 0 0 1 0" />
                                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_82_277" />
                                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_82_277" result="shape" />
                                        </filter>
                                    </defs>
                                </svg>
                            </div>
                            <div className="justify-start text-sm font-bold text-black">Jelajahi Warisan Budaya Indonesia</div>
                        </motion.div>

                        {/* Judul utama */}
                        <div className="inline-flex flex-col items-center justify-start lg:items-start">
                            {/* Komponen untuk animasi teks ketik */}
                            <TextGenerateEffect
                                words="WARISAN DALAM GORESAN"
                                // Ukuran teks responsif: text-4xl di layar kecil, md:text-5xl di layar medium ke atas.
                                className="justify-start text-4xl font-bold text-gray-900 [text-shadow:_0px_0px_4px_rgb(113_63_30_/_1.00)] md:text-5xl"
                            />
                            {/* Nama aplikasi dengan animasi masuk dari bawah */}
                            <motion.div
                                animate={{ y: [12, 0], opacity: [0, 1] }}
                                transition={{ delay: 1, type: 'spring' }}
                                className="justify-start text-4xl font-bold text-[#b6632f] md:text-5xl"
                            >
                                RUANG BATIKKU
                            </motion.div>
                        </div>

                        {/* Deskripsi singkat dengan animasi masuk dari kanan */}
                        <motion.div
                            animate={{ x: [12, 0], opacity: [0, 1] }}
                            transition={{ type: 'spring', delay: 1.3 }}
                            // Lebar responsif: full-width di layar kecil, max-w-lg di layar besar.
                            className="w-full max-w-lg justify-start text-2xl font-normal text-gray-900 md:text-[32px]"
                        >
                            Platform interaktif untuk belajar, berkarya, dan melestarikan keindahan motif batik nusantara.
                        </motion.div>

                        {/* Tombol Aksi Utama (Call to Action) */}
                        {/* Menggunakan <Link> dari Inertia untuk navigasi SPA ke halaman ruang batik. */}
                        <Link href={route('ruang-batik.index')}>
                            <motion.div
                                animate={{ opacity: [0, 1], scale: [0.8, 1] }}
                                transition={{ delay: 1.6, type: 'spring' }}
                                className="inline-flex flex-col items-start justify-start gap-2.5 pt-3.5"
                            >
                                <div className="inline-flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-[#955932] px-6 py-3.5 shadow-[0px_0px_8px_0px_rgba(182,99,47,1.00)] transition-colors hover:bg-[#7d4a27]">
                                    <div className="justify-start text-base font-bold text-gray-50">Mulai Berkarya</div>
                                </div>
                            </motion.div>
                        </Link>
                    </div>

                    {/* --- Kolom Gambar (Kanan di layar besar) --- */}
                    {/*
                      - order-1 lg:order-2: Di layar kecil, gambar ini ada di atas teks. Di layar besar, ia pindah ke urutan kedua (kanan).
                      - w-full max-w-md: Lebarnya penuh di kontainer kecil, tapi dibatasi maksimumnya.
                      - lg:w-1/2: Di layar besar, lebarnya menjadi 50% dari kontainer.
                    */}
                    <div className="relative order-1 -mt-26 -mb-13 flex w-full max-w-md justify-center lg:order-2 lg:-my-4 lg:w-1/2 lg:max-w-none lg:justify-end">
                        {/* Gambar utama dengan animasi masuk dari kanan */}
                        <motion.img
                            animate={{ x: [12, 0], opacity: [0, 1] }}
                            transition={{ duration: 1.6, delay: 0.6, type: 'spring' }}
                            src={dash_image}
                            alt="Ilustrasi Batik"
                            // object-contain memastikan seluruh gambar terlihat tanpa terpotong.
                            className="h-auto w-full object-contain"
                        />

                        {/* Elemen Bintang Pertama (Kanan Atas) */}
                        {/* hidden lg:block: Elemen ini hanya akan terlihat di layar besar. */}
                        <motion.div
                            animate={{ y: [20, 0] }}
                            transition={{ delay: 1.3, type: 'spring', duration: 0.7 }}
                            className="absolute top-10 right-0 hidden h-[85.27px] w-[71.54px] md:right-10 lg:right-28 lg:block"
                        >
                            {/* SVG Bintang Dekoratif dengan animasi */}
                            <div className="absolute top-0 left-0 h-[85.27px] w-[71.54px]">
                                <div className="absolute top-[54.77px] left-0">
                                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.05176e-05 0.769531H18.531V19.6254H3.05176e-05V0.769531Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[55.10px] left-0">
                                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M9.23084 0.098877C8.3318 7.70059 7.60391 8.42848 0.00219727 9.32969C7.60391 10.2287 8.3318 10.9566 9.23084 18.5583C10.132 10.9566 10.8599 10.2287 18.4616 9.32969C10.8599 8.42848 10.132 7.70059 9.23084 0.098877Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-0 left-[38.50px]">
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.496063 0H19.352V18.7216H0.496063V0Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[0.01px] left-[38.82px]">
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M10.0519 18.4658C10.9509 10.8663 11.681 10.1362 19.2827 9.23716C11.681 8.33812 10.9509 7.60806 10.0519 0.00634766C9.15285 7.60806 8.42279 8.33595 0.823242 9.23716C8.42279 10.1362 9.15285 10.8663 10.0519 18.4658Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-[17.72px] left-[9.09px]">
                                    <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M24.9575 0.718506C22.5334 21.1992 20.5685 23.164 0.0900269 25.5882C20.5685 28.0102 22.5334 29.975 24.9575 50.4557C27.3817 29.975 29.3465 28.0102 49.8272 25.5882C29.3465 23.164 27.3817 21.1992 24.9575 0.718506Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-[54.22px] left-[40.71px]">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.714294 0.215088H31.5414V31.2675H0.714294V0.215088Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[54.38px] left-[40.79px]">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M16.1689 0.375244C14.6698 13.044 13.4544 14.2594 0.785645 15.7585C13.4544 17.2576 14.6698 18.4729 16.1689 31.1417C17.668 18.4729 18.8833 17.2576 31.5521 15.7585C18.8833 14.2594 17.668 13.044 16.1689 0.375244Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>

                        {/* Elemen Bintang Kedua (Kiri Bawah) */}
                        <motion.div
                            animate={{ y: [20, 0] }}
                            transition={{ delay: 1.3, type: 'spring', duration: 0.7 }}
                            className="absolute bottom-16 -left-10 hidden h-[85.27px] w-[71.54px] lg:block"
                        >
                            {/* SVG Bintang Dekoratif dengan animasi */}
                            <div className="absolute top-0 left-0 h-[85.27px] w-[71.54px]">
                                <div className="absolute top-[54.77px] left-0">
                                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.05176e-05 0.769531H18.531V19.6254H3.05176e-05V0.769531Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[55.10px] left-0">
                                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M9.23084 0.098877C8.3318 7.70059 7.60391 8.42848 0.00219727 9.32969C7.60391 10.2287 8.3318 10.9566 9.23084 18.5583C10.132 10.9566 10.8599 10.2287 18.4616 9.32969C10.8599 8.42848 10.132 7.70059 9.23084 0.098877Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-0 left-[38.50px]">
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.496063 0H19.352V18.7216H0.496063V0Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[0.01px] left-[38.82px]">
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M10.0519 18.4658C10.9509 10.8663 11.681 10.1362 19.2827 9.23716C11.681 8.33812 10.9509 7.60806 10.0519 0.00634766C9.15285 7.60806 8.42279 8.33595 0.823242 9.23716C8.42279 10.1362 9.15285 10.8663 10.0519 18.4658Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-[17.72px] left-[9.09px]">
                                    <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M24.9575 0.718506C22.5334 21.1992 20.5685 23.164 0.0900269 25.5882C20.5685 28.0102 22.5334 29.975 24.9575 50.4557C27.3817 29.975 29.3465 28.0102 49.8272 25.5882C29.3465 23.164 27.3817 21.1992 24.9575 0.718506Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                                <div className="absolute top-[54.22px] left-[40.71px]">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.714294 0.215088H31.5414V31.2675H0.714294V0.215088Z" fill="none" />
                                    </svg>
                                </div>
                                <div className="absolute top-[54.38px] left-[40.79px]">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M16.1689 0.375244C14.6698 13.044 13.4544 14.2594 0.785645 15.7585C13.4544 17.2576 14.6698 18.4729 16.1689 31.1417C17.668 18.4729 18.8833 17.2576 31.5521 15.7585C18.8833 14.2594 17.668 13.044 16.1689 0.375244Z"
                                            fill="#955932"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* SVG Latar Belakang Dekoratif */}
                    <motion.svg
                        className="absolute -bottom-28 left-56 hidden lg:block"
                        width="228"
                        height="199"
                        viewBox="0 0 228 199"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <mask id="mask0_83_281" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="228" height="199">
                            {/* Animasi garis terluar dari SVG */}
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                                d="M0 198.609L0 0H228V198.609H0Z"
                                fill="white"
                            />
                        </mask>
                        <g mask="url(#mask0_83_281)">
                            {/* Animasi pengisian warna pada SVG */}
                            <motion.path
                                initial={{ pathLength: 0, fill: 'none' }}
                                animate={{ pathLength: 1, fill: '#955932' }}
                                transition={{ duration: 2, delay: 1 }}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M99.1656 198.54C98.7482 198.57 98.3284 198.593 97.9086 198.609C97.9062 198.466 97.9039 198.322 97.9039 198.176V198.173C97.9039 197.9 97.9086 197.624 97.9155 197.35C97.9178 197.206 97.9225 197.062 97.9271 196.919C98.5116 181.135 110.025 168.126 125.112 165.246C109.802 162.323 98.1706 148.971 97.9086 132.875C97.9086 132.835 97.9086 132.794 97.9086 132.754C97.9062 132.664 97.9062 132.571 97.9039 132.48C97.7021 132.467 97.498 132.453 97.2963 132.436C96.0972 132.337 94.9143 132.177 93.7546 131.954C79.6067 129.254 68.6037 117.648 66.8039 103.203C65.0065 117.648 54.0012 129.254 39.8533 131.954C54.0012 134.656 65.0065 146.26 66.8039 160.704C66.9385 161.771 67.0196 162.857 67.0498 163.954C67.0521 164.016 67.0544 164.079 67.0544 164.144C67.0591 164.39 67.0637 164.636 67.0637 164.882C67.0637 164.993 67.0614 165.102 67.0614 165.213C66.8898 165.223 66.7204 165.232 66.5488 165.241C66.3006 165.25 66.0525 165.26 65.802 165.264C65.5492 165.271 65.2941 165.274 65.0389 165.274C62.8819 165.274 60.769 165.069 58.7257 164.677C44.8514 162.029 33.9993 150.817 31.8887 136.762C29.8708 150.407 19.617 161.384 6.34813 164.471C5.16758 164.747 3.96153 164.958 2.7346 165.104C2.25218 165.162 1.76744 165.211 1.27806 165.248C0.860577 165.278 0.440777 165.301 0.020977 165.318C0.0186577 165.174 0.0186577 165.03 0.0186577 164.884V164.882C0.0186577 164.606 0.020977 164.332 0.027935 164.058C0.0302543 163.914 0.0348931 163.771 0.041851 163.625C0.624004 147.844 12.1372 134.835 27.2268 131.954C11.9145 129.032 0.285381 115.677 0.0232964 99.5807C0.020977 99.5413 0.020977 99.5018 0.020977 99.4624C0.0186577 99.3186 0.0186577 99.1725 0.0186577 99.0264C0.0186577 98.7921 0.020977 98.5555 0.0256157 98.3236C0.0256157 98.2819 0.027935 98.2424 0.027935 98.203C0.450054 98.1868 0.869854 98.1612 1.28965 98.1288C1.28733 98.2169 1.28501 98.305 1.2827 98.3932C2.55833 98.4906 3.81309 98.6576 5.04234 98.8918C18.9166 101.541 29.7688 112.752 31.8794 126.81C33.9645 112.72 44.8282 101.476 58.7257 98.8246C44.8514 96.1736 33.9993 84.9642 31.8887 70.9067C31.6892 69.5708 31.5663 68.207 31.5292 66.8247C31.5268 66.7621 31.5268 66.6971 31.5245 66.6345C31.5199 66.3887 31.5176 66.1428 31.5176 65.897C31.5176 65.7856 31.5176 65.6743 31.5176 65.5653C31.7611 65.5491 32.0046 65.5375 32.2482 65.5282C32.4244 65.5212 32.6007 65.5166 32.777 65.5119C33.0298 65.5073 33.2849 65.505 33.54 65.505C35.6993 65.505 37.8099 65.7091 39.8533 66.0987C54.0012 68.8008 65.0065 80.4044 66.8039 94.8492C68.6037 80.4044 79.6067 68.8008 93.7546 66.0987C94.9166 65.8761 96.0995 65.716 97.3009 65.6163C97.5491 65.5978 97.7972 65.5792 98.0454 65.5653C98.217 65.5537 98.3887 65.5444 98.5603 65.5375C98.5603 65.6581 98.5626 65.7764 98.5626 65.897C98.5626 66.1521 98.558 66.4072 98.5533 66.66C98.551 66.7064 98.551 66.7528 98.5487 66.7969C98.5209 67.9032 98.4374 68.9956 98.3028 70.0741C96.503 84.5189 85.5001 96.1226 71.3522 98.8246C85.5001 101.524 96.503 113.128 98.3028 127.573C98.4536 128.781 98.5394 130.01 98.558 131.256C98.558 131.302 98.558 131.346 98.5603 131.393C98.5603 131.416 98.5603 131.439 98.5603 131.465C98.7667 131.451 98.9708 131.437 99.1749 131.421C99.1726 131.509 99.1703 131.597 99.1703 131.685C100.444 131.782 101.698 131.949 102.93 132.184C116.804 134.835 127.656 146.046 129.767 160.101C131.852 146.014 142.716 134.77 156.611 132.116C142.739 129.468 131.887 118.256 129.776 104.198C129.574 102.863 129.454 101.499 129.417 100.116C129.414 100.054 129.412 99.9889 129.412 99.9263C129.405 99.6804 129.403 99.4346 129.403 99.1887C129.403 99.0774 129.403 98.9661 129.405 98.857C129.419 98.8547 129.431 98.8547 129.445 98.8547C129.447 98.8176 129.447 98.7805 129.447 98.7434C129.452 98.5996 129.456 98.4535 129.461 98.3097C130.043 82.5289 141.556 69.5198 156.646 66.6391C141.333 63.7145 129.704 50.362 129.442 34.2659C129.442 34.2264 129.44 34.187 129.44 34.1476C129.438 34.0014 129.438 33.8577 129.438 33.7115C129.438 33.475 129.44 33.2407 129.445 33.0065C129.445 32.967 129.447 32.9276 129.447 32.8882C129.869 32.8719 130.291 32.8464 130.709 32.8139C130.706 32.9021 130.704 32.9902 130.702 33.0784C131.977 33.1758 133.232 33.3428 134.464 33.577C148.338 36.2257 159.188 47.4374 161.298 61.4949C163.383 47.4049 174.247 36.1608 188.145 33.5074C174.27 30.8587 163.421 19.6471 161.31 5.5919C161.108 4.25365 160.988 2.8922 160.948 1.50987C160.948 1.44493 160.946 1.38231 160.943 1.31969C160.939 1.07384 160.937 0.827988 160.937 0.579819C160.937 0.47081 160.937 0.359482 160.939 0.248154C161.18 0.234238 161.424 0.222641 161.669 0.213364C161.843 0.206406 162.02 0.201767 162.196 0.197128C162.451 0.19249 162.704 0.187851 162.959 0.187851C165.118 0.187851 167.229 0.394272 169.275 0.78392C183.42 3.48363 194.425 15.0896 196.223 29.5344C198.023 15.0896 209.028 3.48363 223.174 0.78392C224.336 0.561264 225.521 0.398911 226.722 0.301498C226.968 0.280624 227.216 0.264389 227.467 0.248154C227.636 0.238876 227.808 0.229599 227.979 0.222641C227.982 0.340927 227.982 0.461533 227.982 0.579819C227.982 0.834946 227.979 1.09007 227.972 1.3452C227.972 1.39159 227.97 1.43565 227.97 1.48204C227.94 2.58836 227.856 3.68077 227.722 4.75926C225.924 19.2041 214.919 30.8077 200.773 33.5074C214.919 36.2095 225.924 47.8131 227.722 62.2579C227.873 63.4663 227.958 64.6955 227.977 65.941C227.979 65.9851 227.979 66.0315 227.979 66.0779C227.982 66.1962 227.982 66.3168 227.982 66.435C227.982 66.6902 227.979 66.9453 227.972 67.2004C227.805 67.1935 227.638 67.1842 227.471 67.1749C227.219 67.1587 226.968 67.1401 226.715 67.1192C225.516 67.0218 224.336 66.8595 223.174 66.6391C209.028 63.9371 198.023 52.3335 196.223 37.8887C194.425 52.3335 183.42 63.9371 169.275 66.6391C183.42 69.3389 194.425 80.9448 196.223 95.3896C196.357 96.4565 196.441 97.542 196.469 98.6367C196.471 98.7017 196.473 98.7643 196.473 98.8269C196.48 99.0727 196.483 99.3186 196.483 99.5668C196.483 99.6781 196.483 99.7871 196.48 99.8984C196.466 99.8984 196.455 99.8984 196.441 99.9007C196.441 99.917 196.441 99.9355 196.439 99.9518C196.439 99.9982 196.436 100.045 196.436 100.091C196.406 101.195 196.325 102.29 196.19 103.366C194.391 117.811 183.388 129.414 169.24 132.116C183.388 134.816 194.391 146.42 196.19 160.864C196.341 162.075 196.427 163.302 196.446 164.548C196.446 164.594 196.446 164.64 196.446 164.684C196.448 164.805 196.448 164.923 196.448 165.044C196.448 165.299 196.446 165.554 196.439 165.807C196.272 165.8 196.107 165.791 195.94 165.781C195.687 165.765 195.434 165.749 195.182 165.728C193.982 165.628 192.802 165.468 191.642 165.246C177.494 162.546 166.489 150.942 164.692 136.498C162.892 150.942 151.889 162.546 137.741 165.246C151.889 167.948 162.892 179.551 164.692 193.996C164.824 195.065 164.907 196.149 164.937 197.246C164.937 197.308 164.94 197.373 164.942 197.436C164.947 197.682 164.949 197.927 164.949 198.173C164.949 198.285 164.949 198.396 164.947 198.505C164.777 198.517 164.606 198.524 164.434 198.533C164.186 198.542 163.938 198.551 163.69 198.556C163.434 198.563 163.182 198.565 162.927 198.565C160.767 198.565 158.657 198.361 156.611 197.972C142.739 195.323 131.887 184.111 129.776 170.054C127.756 183.698 117.502 194.676 104.236 197.763C103.053 198.039 101.847 198.252 100.622 198.398C100.14 198.454 99.6527 198.503 99.1656 198.54ZM128.132 166.744C111.908 168.02 100.594 179.767 100.001 196.172C99.9983 196.269 99.9936 196.364 99.9913 196.459C100.478 196.422 100.958 196.371 101.439 196.313C117.069 194.374 127.693 182.792 128.132 166.744ZM100.091 133.928C100.411 150.59 111.567 162.298 127.976 163.585C127.656 146.923 116.5 135.215 100.091 133.928ZM68.5458 100.339C68.838 116.95 80.1587 128.964 96.4822 130.356C96.1899 113.745 84.8669 101.731 68.5458 100.339ZM33.9227 130.154C34.1755 130.161 34.4283 130.163 34.6835 130.163C52.3336 130.163 64.814 117.811 65.0668 100.221C64.8116 100.214 64.5588 100.212 64.3037 100.212C46.6535 100.212 34.1732 112.564 33.9227 130.154ZM65.0575 163.291C64.5936 145.889 52.0344 133.571 34.5211 133.571C34.2683 133.571 34.0178 133.575 33.7673 133.58C34.2312 150.984 46.7904 163.3 64.3037 163.3C64.5565 163.3 64.807 163.297 65.0575 163.291ZM2.34959 162.922C2.83665 162.885 3.31675 162.836 3.79686 162.776C19.4269 160.837 29.4464 149.906 29.8848 133.86C13.661 135.136 2.95262 146.229 2.35887 162.636C2.35655 162.732 2.35191 162.827 2.34959 162.922ZM2.86216 101.29C3.18223 117.952 14.039 129.333 30.4483 130.62C30.1283 113.958 19.2715 102.577 2.86216 101.29ZM33.9297 67.8846C34.3959 85.2866 46.3822 97.048 63.8955 97.048C64.1483 97.048 64.3988 97.0433 64.6493 97.0387C64.1854 79.6344 52.1991 67.8754 34.6835 67.8754C34.433 67.8754 34.1802 67.8777 33.9297 67.8846ZM97.2893 66.8804C81.1026 68.265 69.4573 80.4763 68.9632 96.8972C85.1476 95.5149 96.7953 83.3036 97.2893 66.8804ZM162.871 133.594C162.618 133.587 162.363 133.584 162.11 133.584C144.458 133.584 131.569 146.338 131.319 163.931C131.571 163.935 131.827 163.938 132.082 163.938C149.732 163.938 162.62 151.184 162.871 133.594ZM131.49 100.88C131.954 118.284 144.349 130.419 161.864 130.419C162.115 130.419 162.368 130.416 162.618 130.412C162.154 113.007 149.757 100.873 132.244 100.873C131.991 100.873 131.741 100.875 131.49 100.88ZM159.095 68.7103C142.871 69.9859 132.209 81.077 131.615 97.484C131.613 97.5791 131.609 97.6742 131.606 97.7693C132.091 97.7322 132.573 97.6835 133.053 97.6232C148.683 95.6842 158.654 84.7555 159.095 68.7103ZM131.469 35.1565C131.789 51.8186 142.609 63.1996 159.018 64.4868C158.698 47.8247 147.879 36.4437 131.469 35.1565ZM194.732 34.6625C194.476 34.6578 194.224 34.6555 193.969 34.6555C176.318 34.6555 163.43 47.4095 163.179 64.9994C163.432 65.0063 163.685 65.0087 163.94 65.0087C181.59 65.0087 194.479 52.2546 194.732 34.6625ZM162.94 2.19176C163.407 19.5937 176.291 32.2086 193.806 32.2086C194.057 32.2086 194.309 32.2063 194.56 32.1993C194.094 14.7973 181.21 2.18248 163.694 2.18248C163.444 2.18248 163.191 2.1848 162.94 2.19176ZM225.783 2.54662C209.596 3.92894 198.303 15.732 197.812 32.1553C213.996 30.7706 225.289 18.9675 225.783 2.54662ZM225.191 64.2247C224.899 47.6136 214.01 36.17 197.686 34.7784C197.979 51.3895 208.868 62.8331 225.191 64.2247ZM194.395 97.8968C193.931 80.4925 181.372 68.2001 163.859 68.2001C163.606 68.2001 163.356 68.2047 163.105 68.2093C163.569 85.6113 176.128 97.9061 193.641 97.9061C193.894 97.9061 194.145 97.9015 194.395 97.8968ZM166.767 130.272C182.954 128.888 193.676 117.658 194.17 101.234C177.986 102.619 167.261 113.849 166.767 130.272ZM194.286 163.567C193.994 146.955 183.012 135.349 166.688 133.958C166.981 150.569 177.963 162.175 194.286 163.567ZM163.189 196.821C162.725 179.419 149.676 166.644 132.163 166.644C131.91 166.644 131.66 166.649 131.409 166.654C131.873 184.056 144.922 196.83 162.435 196.83C162.688 196.83 162.938 196.828 163.189 196.821ZM135.987 99.1052C136.577 99.1841 137.161 99.2815 137.741 99.3905C151.889 102.093 162.892 113.696 164.692 128.141C166.429 114.181 176.766 102.874 190.227 99.692C189.527 99.6039 188.831 99.4949 188.145 99.3627C174.27 96.714 163.421 85.5023 161.31 71.4471C159.301 85.0153 149.147 95.9463 135.987 99.1052Z"
                                stroke="#955932"
                            />
                        </g>
                    </motion.svg>
                </div>
            </div>
        </GuestLayout>
    );
}
