import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';
// --- PERUBAHAN: Menghapus LayoutDashboard karena tidak lagi digunakan ---
import { SharedData } from '@/types';
import { LogOut, Menu, UserCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileRef]);

    return (
        <div className="fixed top-0 left-0 z-50 w-full">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mt-6 flex h-16 w-full flex-row items-center justify-between rounded-sm bg-[#955932] px-4">
                    {/* --- PERUBAHAN: Logo dan Brand kini menjadi link ke halaman utama --- */}
                    <Link href={route('home')} className="flex flex-row items-center gap-3">
                        <div className="h-fit rounded-sm bg-[#FCEDD5] p-1">
                            <img src={logo} alt="Logo Ruang Batikku" className="h-8 w-8" />
                        </div>
                        <div className="justify-start">
                            <span className="text-lg font-bold text-white [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">RUANG </span>
                            <span className="text-lg font-bold text-[#e5a378] [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">BATIKKU</span>
                        </div>
                    </Link>

                    {/* Navigasi Desktop */}
                    <div className="hidden items-center justify-start gap-[38px] lg:inline-flex">
                        {navbar.map((v, i) => (
                            <Link key={i} href={route(v.href)} className="relative cursor-pointer justify-start text-base font-bold text-white">
                                <p className="relative">{v.name}</p>
                                {route().current(v.href) && (
                                    <motion.div
                                        layoutId="navbar"
                                        transition={{ type: 'spring', duration: 0.7 }}
                                        className="absolute -bottom-1 left-0 h-1 w-full rounded-md bg-white"
                                    ></motion.div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Render Kondisional untuk Autentikasi di Desktop */}
                    <div className="hidden items-center lg:flex">
                        {auth.user ? (
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 text-white focus:outline-none"
                                >
                                    <img
                                        src={auth.user.avatar ? '/storage/' + auth.user.avatar : 'https://ui-avatars.com/api/?name=' + auth.user.name}
                                        alt={auth.user.name}
                                        className="h-9 w-9 rounded-full object-cover"
                                    />
                                </button>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none"
                                    >
                                        <div className="p-2" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                                            <div className="px-2 py-2">
                                                <p className="text-sm font-bold text-gray-900">{auth.user.name}</p>
                                                <p className="text-sm text-gray-500">{auth.user.email}</p>
                                            </div>
                                            <div className="my-1 h-px bg-gray-200" />
                                            <Link
                                                href={route('profile.edit')}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <UserCircle size={18} /> Profil Saya
                                            </Link>
                                            {/* --- PERUBAHAN: Link Dashboard dihapus dari sini --- */}
                                            <div className="my-1 h-px bg-gray-200" />
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut size={18} /> Keluar
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-row items-center gap-4">
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
                        )}
                    </div>

                    {/* Tombol Hamburger (Mobile) */}
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
                    {/* Navigasi Mobile */}
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

                    {/* Render Kondisional untuk Autentikasi di Mobile */}
                    <div className="flex w-full flex-col items-center gap-4">
                        {auth.user ? (
                            <>
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center text-lg font-bold text-white"
                                >
                                    Profil Saya
                                </Link>
                                {/* --- PERUBAHAN: Link Dashboard dihapus dari sini --- */}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="mt-2 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#fcedd5]"
                                >
                                    <div className="text-base font-bold text-red-600">KELUAR</div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center text-lg font-bold text-white"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route('register')}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#fcedd5]"
                                >
                                    <div className="text-base font-bold text-black">DAFTAR</div>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
