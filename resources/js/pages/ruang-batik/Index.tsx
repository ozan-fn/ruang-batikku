import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { BookOpen, Eraser, HelpCircle, LogIn, Pen, Trash2, Undo, User } from 'lucide-react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Image, Layer, Line, Rect, Stage } from 'react-konva';
import useImage from 'use-image';

interface HistoryData {
    id: number;
    score: number;
    submitted_image_url: string;
    created_at: string;
    motif: {
        id: number;
        name: string;
    };
}

// ====================================================================
// 1. DEFINISI TIPE (TYPESCRIPT)
// ====================================================================
// Tipe data motif dari controller
interface MotifData {
    id: number;
    name: string;
    src: string;
}

// Tipe props dari controller
interface PageProps {
    motifs: MotifData[];
    errors: any;
    auth: any; // Tambahkan auth jika perlu
    [key: string]: unknown; // Index signature to satisfy Inertia PageProps constraint
    flash: {
        success?: string;
        error?: string;
        score?: number;
    };
    userStats: {
        total_score: number;
        submission_count: number;
    } | null;
}

type Tool = 'pen' | 'eraser';

interface LineData {
    tool: Tool;
    points: number[];
    color: string;
    size: number;
}

interface StageState {
    scale: number;
    x: number;
    y: number;
}

interface DrawingCanvasProps {
    motifSrc: string;
    brushColor: string;
    brushSize: number;
    width: number;
    height: number;
    activeTool: Tool;
}

export interface CanvasHandle {
    undo: () => void;
    clear: () => void;
    getDownloadDataURL: () => string | null;
}

// ====================================================================
// 2. KOMPONEN KANVAS
// ====================================================================

const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const DrawingCanvas = forwardRef<CanvasHandle, DrawingCanvasProps>(({ motifSrc, brushColor, brushSize, width, height, activeTool }, ref) => {
    const [image] = useImage(motifSrc, 'anonymous');
    const [lines, setLines] = useState<LineData[]>([]);
    const [stage, setStage] = useState<StageState>({ scale: 1, x: 0, y: 0 });
    const [isSpaceDown, setIsSpaceDown] = useState(false);

    const isDrawing = useRef(false);
    const lastDist = useRef(0);
    const lastCenter = useRef<{ x: number; y: number } | null>(null);

    const stageRef = useRef<Konva.Stage>(null);
    const drawingLayerRef = useRef<Konva.Layer>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsSpaceDown(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsSpaceDown(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // --- Logika untuk memposisikan gambar dan kanvas putih ---
    let imgProps = { x: 0, y: 0, width: 0, height: 0 };
    let canvasRectProps = { x: 0, y: 0, width: 0, height: 0 };

    if (image) {
        const stageWidth = width;
        const stageHeight = height;

        const imgAspectRatio = image.width / image.height;
        const stageAspectRatio = stageWidth / stageHeight;
        let drawWidth = image.width;
        let drawHeight = image.height;

        if (imgAspectRatio > stageAspectRatio) {
            drawWidth = stageWidth * 0.9;
            drawHeight = drawWidth / imgAspectRatio;
        } else {
            drawHeight = stageHeight * 0.9;
            drawWidth = drawHeight * imgAspectRatio;
        }

        const baseSize = Math.max(drawWidth, drawHeight);
        const canvasSide = baseSize * 1.5;
        const finalCanvasSide = Math.min(canvasSide, stageWidth * 0.95, stageHeight * 0.95);

        canvasRectProps = {
            width: finalCanvasSide,
            height: finalCanvasSide,
            x: (stageWidth - finalCanvasSide) / 2,
            y: (stageHeight - finalCanvasSide) / 2,
        };

        imgProps = {
            width: drawWidth,
            height: drawHeight,
            x: canvasRectProps.x + (finalCanvasSide - drawWidth) / 2,
            y: canvasRectProps.y + (finalCanvasSide - drawHeight) / 2,
        };
    }

    useImperativeHandle(ref, () => ({
        undo: () => setLines(lines.slice(0, -1)),
        clear: () => setLines([]),
        getDownloadDataURL: () => {
            if (!image || !drawingLayerRef.current) return null;

            const tempContainer = document.createElement('div');
            const tempStage = new Konva.Stage({
                container: tempContainer,
                width: image.width,
                height: image.height,
            });
            const tempLayer = new Konva.Layer();
            tempStage.add(tempLayer);

            const scaleX = image.width / imgProps.width;

            lines.forEach((line) => {
                const transformedPoints = line.points.map((point, i) => {
                    if (i % 2 === 0) {
                        return (point - imgProps.x) * scaleX;
                    } else {
                        return (point - imgProps.y) * scaleX;
                    }
                });

                tempLayer.add(
                    new Konva.Line({
                        points: transformedPoints,
                        stroke: line.color,
                        strokeWidth: line.size * scaleX,
                        tension: 0.5,
                        lineCap: 'round',
                        lineJoin: 'round',
                        globalCompositeOperation: line.tool === 'eraser' ? 'destination-out' : 'source-over',
                    }),
                );
            });

            tempLayer.draw();
            return tempStage.toDataURL({ mimeType: 'image/png' });
        },
    }));

    const handleEvent = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        const stageNode = e.target.getStage();
        if (!stageNode) return null;
        const pos = stageNode.getPointerPosition();
        if (!pos) return null;
        return {
            x: (pos.x - stageNode.x()) / stageNode.scaleX(),
            y: (pos.y - stageNode.y()) / stageNode.scaleY(),
        };
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        if (isSpaceDown || e.evt.button !== 0) return;
        isDrawing.current = true;
        const pos = handleEvent(e);
        if (pos) {
            setLines([...lines, { points: [pos.x, pos.y], color: brushColor, size: brushSize, tool: activeTool }]);
        }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing.current || isSpaceDown) return;
        const pos = handleEvent(e);
        if (pos) {
            let lastLine = lines[lines.length - 1];
            lastLine.points = lastLine.points.concat([pos.x, pos.y]);
            setLines([...lines.slice(0, -1), lastLine]);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
        e.evt.preventDefault();
        const touches = e.evt.touches;
        if (touches.length === 1) {
            isDrawing.current = true;
            const pos = handleEvent(e);
            if (pos) {
                setLines([...lines, { points: [pos.x, pos.y], color: brushColor, size: brushSize, tool: activeTool }]);
            }
        } else if (touches.length > 1) {
            isDrawing.current = false;
            const touch1 = touches[0];
            const touch2 = touches[1];
            lastDist.current = getDistance({ x: touch1.clientX, y: touch1.clientY }, { x: touch2.clientX, y: touch2.clientY });
            lastCenter.current = { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };
        }
    };

    const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
        e.evt.preventDefault();
        const touches = e.evt.touches;
        const stageNode = e.target.getStage();
        if (!stageNode) return;

        if (touches.length === 1 && isDrawing.current) {
            const pos = handleEvent(e);
            if (pos) {
                let lastLine = lines[lines.length - 1];
                lastLine.points = lastLine.points.concat([pos.x, pos.y]);
                setLines([...lines.slice(0, -1), lastLine]);
            }
        } else if (touches.length > 1) {
            const touch1 = touches[0];
            const touch2 = touches[1];
            const newDist = getDistance({ x: touch1.clientX, y: touch1.clientY }, { x: touch2.clientX, y: touch2.clientY });
            const newCenter = { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };

            if (!lastDist.current || !lastCenter.current) return;

            const oldScale = stageNode.scaleX();
            const newScale = oldScale * (newDist / lastDist.current);
            const dx = newCenter.x - lastCenter.current.x;
            const dy = newCenter.y - lastCenter.current.y;

            setStage({ scale: newScale, x: stageNode.x() + dx, y: stageNode.y() + dy });
            lastDist.current = newDist;
            lastCenter.current = newCenter;
        }
    };

    const handleTouchEnd = () => {
        isDrawing.current = false;
        lastDist.current = 0;
        lastCenter.current = null;
    };

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stageNode = e.target.getStage();
        if (!stageNode) return;

        if (e.evt.ctrlKey || e.evt.metaKey) {
            const scaleBy = 1.05;
            const oldScale = stageNode.scaleX();
            const pointer = stageNode.getPointerPosition();
            if (!pointer) return;
            const mousePointTo = { x: (pointer.x - stageNode.x()) / oldScale, y: (pointer.y - stageNode.y()) / oldScale };
            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
            setStage({ scale: newScale, x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
        } else {
            const panSpeedFactor = 4;
            let dx = e.evt.shiftKey ? e.evt.deltaY / panSpeedFactor : e.evt.deltaX / panSpeedFactor;
            let dy = e.evt.shiftKey ? 0 : e.evt.deltaY / panSpeedFactor;
            setStage((prevStage) => ({ ...prevStage, x: prevStage.x - dx, y: prevStage.y - dy }));
        }
    };

    const clipFunc = (ctx: Konva.Context) => {
        ctx.rect(imgProps.x, imgProps.y, imgProps.width, imgProps.height);
    };

    return (
        <div style={{ cursor: isSpaceDown ? 'grab' : activeTool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}>
            <Stage
                ref={stageRef}
                width={width}
                height={height}
                style={{ backgroundColor: '#f0f0f0' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                draggable={isSpaceDown}
                scaleX={stage.scale}
                scaleY={stage.scale}
                x={stage.x}
                y={stage.y}
            >
                <Layer>
                    <Rect {...canvasRectProps} fill="white" shadowBlur={10} shadowOpacity={0.2} cornerRadius={4} />
                    <Image image={image} {...imgProps} />
                </Layer>
                <Layer ref={drawingLayerRef} clipFunc={clipFunc}>
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke={line.color}
                            strokeWidth={line.size}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
});

// ====================================================================
// 3. KOMPONEN UTAMA HALAMAN (RUANG BATIK)
// ====================================================================

const RuangBatik: React.FC = () => {
    const { motifs, auth, userStats, flash } = usePage<PageProps>().props;
    const isLoggedIn = !!auth.user;

    const [selectedMotif, setSelectedMotif] = useState<MotifData | null>(motifs[0] || null);
    const [brushColor, setBrushColor] = useState<string>('#000000');
    const [brushSize, setBrushSize] = useState<number>(5);
    const [activeTool, setActiveTool] = useState<Tool>('pen');
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk semua dialog/modal
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [showMyDetailsDialog, setShowMyDetailsDialog] = useState(false);
    const [showMyWorksDialog, setShowMyWorksDialog] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false); // State baru untuk dialog bantuan

    const [submittedScore, setSubmittedScore] = useState<number | null>(null);
    const [userHistory, setUserHistory] = useState<HistoryData[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const canvasRef = useRef<CanvasHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const colorOptions = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = window.innerHeight * 0.5;
                setCanvasDimensions({ width, height });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (flash.success && flash.score !== undefined && flash.score !== null) {
            setSubmittedScore(flash.score);
            setShowScoreDialog(true);
        }
    }, [flash]);

    const handleUndo = () => {
        if (!isLoggedIn) return setShowLoginDialog(true);
        canvasRef.current?.undo();
    };

    const handleErase = () => {
        if (!isLoggedIn) return setShowLoginDialog(true);
        canvasRef.current?.clear();
    };

    const handleSubmitKarya = () => {
        if (!isLoggedIn) return setShowLoginDialog(true);
        if (!canvasRef.current || !selectedMotif) return alert('Pilih motif dan gambarlah sesuatu terlebih dahulu.');
        const imageDataURL = canvasRef.current.getDownloadDataURL();
        if (!imageDataURL) return alert('Gagal mengambil data gambar dari kanvas.');
        setIsSubmitting(true);
        router.post(
            route('ruang-batik.store'),
            {
                motif_id: selectedMotif.id,
                image_data_url: imageDataURL,
            },
            { onFinish: () => setIsSubmitting(false) },
        );
    };

    const fetchUserHistory = () => {
        if (!isLoggedIn) return;
        setIsLoadingHistory(true);
        setShowMyWorksDialog(true);
        axios.get(route('ruang-batik.history')).then((response) => {
            setUserHistory(response.data);
            setIsLoadingHistory(false);
        });
    };

    return (
        <GuestLayout>
            <Head title="Ruang Batik" />
            <div className="mx-auto mt-24 flex w-full max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
                {/* --- Kumpulan Semua Dialog/Modal --- */}
                {/* Dialog Hasil Skor */}
                <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Karya Berhasil Dikumpulkan!</DialogTitle>
                            <DialogDescription className="mt-2 text-base">Selamat! Anda telah menyelesaikan tantangan batik ini.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center p-4">
                            <p className="text-5xl font-extrabold text-[#955932]">{submittedScore}</p>
                            <span className="text-3xl font-bold text-gray-500">/100</span>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" className="bg-[#955932] hover:bg-[#4A2E20]">
                                    Oke
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog Perintah Login */}
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Akses Terbatas</DialogTitle>
                            <DialogDescription className="mt-2 text-base">
                                Anda harus masuk ke akun Anda untuk dapat menggambar dan mengumpulkan karya.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Nanti Saja
                                </Button>
                            </DialogClose>
                            <Link href={route('login')}>
                                <Button className="bg-[#955932] hover:bg-[#4A2E20]">Masuk Sekarang</Button>
                            </Link>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog Detail Saya */}
                <Dialog open={showMyDetailsDialog} onOpenChange={setShowMyDetailsDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Statistik Saya</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
                                <span className="font-medium text-gray-600">Nama Pengguna</span>
                                <span className="font-bold">{auth.user?.name}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
                                <span className="font-medium text-gray-600">Total Karya Terkumpul</span>
                                <span className="font-bold">{userStats?.submission_count || 0}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
                                <span className="font-medium text-gray-600">Akumulasi Skor</span>
                                <span className="font-bold">{userStats?.total_score || 0}</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" className="bg-[#955932] hover:bg-[#4A2E20]">
                                    Tutup
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog Karya Saya */}
                <Dialog open={showMyWorksDialog} onOpenChange={setShowMyWorksDialog}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Riwayat Karyaku</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto p-1">
                            {isLoadingHistory ? (
                                <p>Memuat riwayat...</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    {userHistory.map((history) => (
                                        <div key={history.id} className="group relative overflow-hidden rounded-lg border">
                                            <img
                                                src={history.submitted_image_url}
                                                alt={`Karya ${history.motif.name}`}
                                                className="aspect-square w-full object-cover"
                                            />
                                            <div className="absolute bottom-0 w-full bg-black/50 p-2 text-white transition-opacity group-hover:opacity-100 md:opacity-0">
                                                <p className="font-bold">{history.motif.name}</p>
                                                <p className="text-sm">Skor: {history.score}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog Bantuan (BARU) */}
                <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Bantuan Ruang Batik</DialogTitle>
                            <DialogDescription className="mt-2 text-base">
                                Pelajari cara menggunakan kanvas digital untuk membuat karya batik Anda.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-[#955932]">Navigasi Kanvas</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="min-w-[80px] font-medium text-gray-600">Menggambar:</span>
                                        <span>Klik dan geser mouse atau gunakan satu jari pada layar sentuh.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="min-w-[80px] font-medium text-gray-600">Geser (Pan):</span>
                                        <span>Tahan tombol **Spasi**, lalu klik & geser.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="min-w-[80px] font-medium text-gray-600">Zoom (PC):</span>
                                        <span>Tahan **Ctrl** (atau **Cmd** di Mac), lalu gunakan **scroll wheel**.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="min-w-[80px] font-medium text-gray-600">Zoom (HP):</span>
                                        <span>Gunakan dua jari untuk mencubit (pinch-to-zoom).</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="min-w-[80px] font-medium text-gray-600">Geser Hor.:</span>
                                        <span>Tahan **Shift**, lalu gunakan **scroll wheel**.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" className="bg-[#955932] hover:bg-[#4A2E20]">
                                    Mengerti
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- Akhir Kumpulan Dialog --- */}

                <div className="flex w-full flex-col gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold sm:text-3xl">SELAMAT DATANG DI RUANG BATIK</h1>
                        <p className="mt-2 max-w-3xl">
                            Jelajahi dunia batik digital interaktif. Pilih motif, beri warna, dan kumpulkan karya Anda untuk mendapatkan penilaian.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#fcedd5] p-2 shadow-md">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTool('pen')}
                                    className={`flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition ${
                                        activeTool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 shadow hover:bg-gray-50'
                                    }`}
                                    disabled={!isLoggedIn}
                                >
                                    <Pen size={16} />
                                    Pen
                                </button>
                                <button
                                    onClick={() => setActiveTool('eraser')}
                                    className={`flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition ${
                                        activeTool === 'eraser' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 shadow hover:bg-gray-50'
                                    }`}
                                    disabled={!isLoggedIn}
                                >
                                    <Eraser size={16} />
                                    Eraser
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-gray-700">Warna:</span>
                                <div className="flex flex-wrap gap-1">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBrushColor(color)}
                                            className={`h-8 w-8 rounded border-2 transition ${
                                                brushColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300 hover:border-gray-500'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            disabled={!isLoggedIn}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Ukuran:</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="h-2 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200"
                                    disabled={!isLoggedIn}
                                />
                                <span className="min-w-[2rem] text-sm font-medium text-gray-700">{brushSize}px</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleUndo}
                                    className="flex items-center gap-1.5 rounded bg-yellow-600 px-3 py-2 text-sm text-white shadow transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-yellow-800"
                                    disabled={!isLoggedIn}
                                >
                                    <Undo size={16} />
                                    Undo
                                </button>
                                <button
                                    onClick={handleErase}
                                    className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-2 text-sm text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-800"
                                    disabled={!isLoggedIn}
                                >
                                    <Trash2 size={16} />
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {isLoggedIn ? (
                                <>
                                    <Button
                                        onClick={() => setShowMyDetailsDialog(true)}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1.5"
                                    >
                                        <User size={16} /> Detail Saya
                                    </Button>
                                    <Button onClick={fetchUserHistory} variant="outline" size="sm" className="flex items-center gap-1.5">
                                        <BookOpen size={16} /> Karya Saya
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setShowLoginDialog(true)} variant="outline" size="sm" className="flex items-center gap-1.5">
                                    <LogIn size={16} /> Masuk untuk Berkarya
                                </Button>
                            )}
                            <button
                                onClick={handleSubmitKarya}
                                disabled={isSubmitting || !isLoggedIn}
                                className="rounded bg-green-700 px-3 py-1 text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-900"
                            >
                                {isSubmitting ? 'Mengumpulkan...' : 'Kumpulkan & Nilai'}
                            </button>
                            <button
                                onClick={() => setShowHelpDialog(true)}
                                className="flex items-center gap-1.5 rounded bg-sky-600 px-3 py-1 text-white shadow transition hover:bg-sky-700"
                            >
                                <HelpCircle size={16} /> Bantuan
                            </button>
                        </div>
                    </div>

                    <div ref={containerRef} className="w-full">
                        {canvasDimensions.width > 0 && selectedMotif && (
                            <DrawingCanvas
                                ref={canvasRef}
                                motifSrc={selectedMotif.src}
                                brushColor={brushColor}
                                brushSize={brushSize}
                                width={canvasDimensions.width}
                                height={canvasDimensions.height}
                                activeTool={activeTool}
                            />
                        )}
                    </div>
                </div>

                <div className="w-full">
                    <h2 className="mb-4 text-center text-xl font-bold text-[#4A2E20] sm:text-2xl">Pilih Motif Tersedia</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {motifs.map((motif) => (
                            <div
                                key={motif.id}
                                className={`group cursor-pointer overflow-hidden rounded-lg border-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl ${
                                    selectedMotif?.id === motif.id ? 'border-blue-500' : 'border-[#955932]'
                                }`}
                                onClick={() => setSelectedMotif(motif)}
                            >
                                <img
                                    src={motif.src}
                                    alt={motif.name}
                                    className="h-32 w-full object-cover transition-transform group-hover:scale-105 sm:h-40"
                                />
                                <p className="bg-[#fcedd5] p-2 text-center font-semibold text-[#4A2E20]">{motif.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default RuangBatik;
