import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import { lazy, ReactNode } from 'react';

const Header = lazy(() => import('@/components/header'));

export default function GuestLayout(props: { children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                {/* <link rel="preconnect" href="https://fonts.bunny.net" /> */}
                {/* <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" /> */}
            </Head>
            {/* PERUBAHAN RESPONSIVE: Padding disesuaikan untuk mobile (py-4) dan desktop (sm:py-6) */}
            <div className="flex min-h-screen flex-col bg-[#FCEDD5] py-4 sm:py-6">
                <div className="fixed top-0 left-0 h-screen w-screen overflow-hidden">
                    {/* PERUBAHAN RESPONSIVE: Ukuran dan blur disesuaikan untuk berbagai layar */}
                    <motion.div
                        // animate={{ y: [-16, 16] }}
                        // transition={{ ease: 'easeInOut' }}
                        className="absolute top-0 left-0 size-[300px] rounded-full bg-[#532f16]/30 blur-[150px] sm:size-[500px] lg:size-[727px] lg:blur-[200px]"
                    />
                    {/* PERUBAHAN RESPONSIVE: Ukuran dan blur disesuaikan untuk berbagai layar */}
                    <motion.div
                        // animate={{ y: [-16, 16] }}
                        // transition={{ ease: 'easeInOut' }}
                        className="absolute right-0 bottom-0 size-[250px] rounded-full bg-[#532f16]/30 blur-[150px] sm:size-[400px] lg:size-[529px] lg:blur-[200px]"
                    />
                </div>

                {/* PERUBAHAN RESPONSIVE: Margin atas disesuaikan untuk mobile (mt-20) dan desktop (sm:mt-16) */}
                <div className="relative flex flex-1 flex-col">{props.children}</div>

                <Header />
            </div>
        </>
    );
}
