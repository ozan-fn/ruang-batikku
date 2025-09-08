import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react'; // <-- 1. Impor usePage
import { type PropsWithChildren } from 'react';

// Daftar semua item navigasi yang mungkin ada
const allSidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Motif Batik',
        href: '/settings/motif-batik',
        icon: null,
        // Tandai item ini sebagai khusus admin
        adminOnly: true,
    },
    {
        title: 'Galeri Batik',
        href: '/settings/galeri-batik',
        icon: null,
        // Tandai item ini sebagai khusus admin
        adminOnly: true,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // 2. Ambil data pengguna dari Inertia
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // 3. Filter item navigasi berdasarkan peran (role) pengguna
    const sidebarNavItems = allSidebarNavItems.filter((item) => {
        // Jika item ditandai sebagai 'adminOnly', periksa apakah peran pengguna adalah 'admin'
        if (item.adminOnly) {
            return user && user.role === 'admin';
        }
        // Jika tidak ditandai, tampilkan untuk semua pengguna
        return true;
    });

    // Ketika server-side rendering, kita hanya render layout di sisi klien...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="mx-auto mt-18 w-full max-w-7xl px-4 py-6 sm:px-6 md:mt-18 lg:px-8">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {/* 4. Render item navigasi yang sudah difilter */}
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="w-full">
                    <section className="w-full space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
