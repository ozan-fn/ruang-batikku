import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import logo from '../assets/logo.svg';
// --- BARU: Import state dan ikon untuk menu mobile ---
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

let navbar = [
    {
        name: 'Beranda',
        href: 'home',
    },
    {
        name: 'Ruang Batik',
        href: 'ruang-batik',
    },
    {
        name: 'Galeri Batik',
        href: 'galeri-batik',
    },
    {
        name: 'Peringkat',
        href: 'peringkat',
    },
    {
        name: 'Komunitas',
        href: 'komunitas',
    },
];

export default function Header() {
    // --- BARU: State untuk mengontrol menu mobile ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        // --- Wrapper utama yang fixed ---
        <div className="fixed top-0 left-0 z-50 w-full">
            {/* PERBAIKAN: Wrapper ini sekarang hanya untuk padding, memastikan ada jarak di tepi layar */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* PERBAIKAN: Menghapus margin (mx, mt) yang tidak perlu dari sini */}
                <div className="mt-6 flex h-16 w-full flex-row items-center justify-between rounded-sm bg-[#955932] px-4">
                    {/* Logo dan Brand */}
                    <div className="flex flex-row items-center gap-3">
                        <div className="h-fit rounded-sm bg-[#FCEDD5] p-1">
                            <img src={logo} alt="Logo Ruang Batikku" className="h-8 w-8" />
                        </div>
                        <div className="justify-start">
                            <span className="text-lg font-bold text-white [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">RUANG </span>
                            <span className="text-lg font-bold text-[#e5a378] [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">BATIKKU</span>
                        </div>
                    </div>

                    {/* Navigasi Desktop (muncul di layar besar) */}
                    <div className="hidden items-center justify-start gap-[38px] lg:inline-flex">
                        {navbar.map((v, i) => (
                            <Link key={i} href={route(v.href)} className="relative cursor-pointer justify-start text-base font-bold text-white">
                                <p className="relative">{v.name}</p>
                                {v.href === route().current() && (
                                    <motion.div
                                        layoutId="navbar"
                                        transition={{ type: 'spring', duration: 0.7 }}
                                        className="absolute -bottom-1 left-0 h-1 w-full rounded-md bg-white"
                                    ></motion.div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Tombol Autentikasi Desktop (muncul di layar besar) */}
                    <div className="hidden flex-row items-center gap-4 lg:flex">
                        <Link href={route('login')} className="cursor-pointer justify-start text-base font-bold text-white hover:underline">
                            Masuk
                        </Link>
                        <Link
                            href={route('register')}
                            className="inline-flex h-10 w-auto cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-[#fcedd5] px-6"
                        >
                            <div className="justify-start text-base font-bold text-black">DAFTAR</div>
                        </Link>
                    </div>

                    {/* Tombol Hamburger (hanya muncul di layar kecil) */}
                    <div className="flex items-center lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Panel Menu Mobile */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-24 right-0 left-0 mx-4 flex flex-col items-center gap-4 rounded-lg bg-[#955932] p-6 shadow-lg sm:mx-6 lg:hidden"
                >
                    {navbar.map((v, i) => (
                        <Link
                            key={i}
                            href={route(v.href)}
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full text-center text-lg font-bold text-white"
                        >
                            {v.name}
                        </Link>
                    ))}
                    <div className="my-2 h-px w-full bg-white/20" />
                    <div className="flex w-full flex-col items-center gap-4">
                        <Link href={route('login')} onClick={() => setIsMenuOpen(false)} className="w-full text-center text-lg font-bold text-white">
                            Masuk
                        </Link>
                        <Link
                            href={route('register')}
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#fcedd5]"
                        >
                            <div className="text-base font-bold text-black">DAFTAR</div>
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
