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
            <div className="flex h-screen flex-col bg-[#FCEDD5] py-6">
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

                <div className="relative mt-16 flex flex-1 flex-col overflow-auto">{props.children}</div>

                <Header />
            </div>
        </>
    );
}
