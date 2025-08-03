import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';
import logo from '../assets/logo.svg';

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

export default function GuestLayout(props: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    console.log(route().current());
    return (
        <>
            <Head title="Welcome">
                {/* <link rel="preconnect" href="https://fonts.bunny.net" /> */}
                {/* <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" /> */}
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FCEDD5] py-6">
                <div className="fixed top-0 left-0 h-screen w-screen">
                    <motion.div
                        // animate={{ y: [-16, 16] }}
                        // transition={{ ease: 'easeInOut' }}
                        className="absolute top-0 left-0 size-[727px] rounded-full bg-[#532f16]/30 blur-[200px]"
                    />
                    <motion.div
                        // animate={{ y: [-16, 16] }}
                        // transition={{ ease: 'easeInOut' }}
                        className="absolute right-0 bottom-0 size-[529px] rounded-full bg-[#532f16]/30 blur-[200px]"
                    />
                </div>

                {/* Header */}
                <div className="relative mx-auto flex h-16 w-full max-w-7xl flex-row items-center justify-between rounded-sm bg-[#955932] px-4">
                    <div className="flex flex-row items-center gap-3">
                        <div className="h-fit rounded-sm bg-[#FCEDD5] p-1">
                            <img src={logo} alt="" />
                        </div>
                        <div className="justify-start">
                            <span className="text-lg font-bold text-white [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">RUANG </span>
                            <span className="text-lg font-bold text-[#e5a378] [text-shadow:_0px_0px_4px_rgb(0_0_0_/_0.25)]">BATIKKU</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center justify-start gap-[38px]">
                        {navbar.map((v, i) => {
                            return (
                                <Link key={i} href={route(v.href)} className="relative cursor-pointer justify-start text-base font-bold text-white">
                                    <p className="relative">{v.name}</p>
                                    {v.href === route().current() && (
                                        <motion.div
                                            layoutId="navbar"
                                            transition={{ type: 'spring', duration: 0.7 }}
                                            className="absolute -bottom-1 left-0 h-1 w-12 rounded-md bg-white"
                                        ></motion.div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="ga[-4 flex flex-row items-center gap-4">
                        <Link href={route('login')} className="cursor-pointer justify-start text-base font-bold text-white hover:underline-offset-1">
                            Masuk
                        </Link>

                        <Link
                            href={route('register')}
                            className="inline-flex h-10 w-[150px] cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-[#fcedd5] px-6"
                        >
                            <div className="justify-start text-base font-bold text-black">DAFTAR</div>
                        </Link>
                    </div>
                </div>

                <div className="relative flex flex-1 flex-col">{props.children}</div>
            </div>
        </>
    );
}
