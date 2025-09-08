import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GuestLayout from '@/layouts/guest-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Trophy, UserCircle2 } from 'lucide-react'; // Import ikon user
import { useEffect, useRef, useState } from 'react';

// Tipe data untuk item leaderboard
type LeaderboardItem = {
    id: number;
    name: string;
    avatar: string | null; // Tambahkan avatar
    batik_histories_sum_score?: number;
};

// Tipe data untuk objek paginator dari Laravel
interface Paginator<T> {
    data: T[];
    links: { first: string; last: string; prev: string | null; next: string | null };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

// Tipe props dari controller
type PageProps = {
    leaderboard: Paginator<LeaderboardItem>;
};

export default function Peringkat() {
    const { leaderboard: initialLeaderboard } = usePage<PageProps>().props;

    const [leaderboardItems, setLeaderboardItems] = useState(initialLeaderboard?.data || []);
    const [pagination, setPagination] = useState(initialLeaderboard?.meta);

    const loadMoreRef = useRef(null);

    const loadMoreItems = () => {
        if (!pagination || pagination.current_page >= pagination.last_page) {
            return;
        }

        router.get(
            route('peringkat.index', { page: pagination.current_page + 1 }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const newProps = page.props as any;
                    if (newProps.leaderboard && newProps.leaderboard.data) {
                        setLeaderboardItems((prevItems) => [...prevItems, ...newProps.leaderboard.data]);
                        setPagination(newProps.leaderboard.meta);
                    }
                },
            },
        );
    };

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreItems();
                }
            },
            { threshold: 1.0 },
        );

        observer.observe(loadMoreRef.current);

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [pagination]);

    const getMedal = (rank: number) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return rank + 1;
    };

    return (
        <GuestLayout>
            <Head title="Peringkat" />

            <div className="mx-auto mt-24 flex w-full max-w-4xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                    <h1 className="mt-4 text-2xl font-bold sm:text-3xl">PAPAN PERINGKAT</h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Lihat daftar pemain dengan skor akumulasi tertinggi. Scroll ke bawah untuk melihat lebih banyak.
                    </p>
                </div>

                <div className="w-full rounded-lg border shadow-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20 text-center">Peringkat</TableHead>
                                <TableHead>Nama Pemain</TableHead>
                                <TableHead className="text-right">Total Skor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboardItems.map((player, index) => (
                                <TableRow key={player.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                                    <TableCell className="text-center text-lg font-bold">{getMedal(index)}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {/* --- BAGIAN BARU UNTUK AVATAR --- */}
                                            {player.avatar ? (
                                                <img src={player.avatar} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                                                    <UserCircle2 size={24} />
                                                </div>
                                            )}
                                            <span>{player.name}</span>
                                            {/* --- AKHIR BAGIAN AVATAR --- */}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {player.batik_histories_sum_score?.toLocaleString('id-ID') || 0}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {pagination && pagination.current_page < pagination.last_page && (
                    <div ref={loadMoreRef} className="py-8 text-center text-muted-foreground">
                        Memuat lebih banyak...
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
