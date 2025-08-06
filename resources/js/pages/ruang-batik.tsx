import GuestLayout from '@/layouts/guest-layout';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Eraser, HelpCircle, Pen } from 'lucide-react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Image, Layer, Line, Rect, Stage } from 'react-konva';
import useImage from 'use-image';

// ====================================================================
// 1. DEFINISI TIPE (TYPESCRIPT)
// ====================================================================

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

            // KUNCI PERBAIKAN: Buat div sementara untuk panggung ekspor
            const tempContainer = document.createElement('div');

            const tempStage = new Konva.Stage({
                container: tempContainer, // Hubungkan panggung ke div
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
const motifs = [{ id: 'parang-rusak', name: 'Parang Rusak', src: '/d.png' }];

const RuangBatik: React.FC = () => {
    const [selectedMotif, setSelectedMotif] = useState<string>(motifs[0].src);
    const [brushColor, setBrushColor] = useState<string>('#000000');
    const [brushSize, setBrushSize] = useState<number>(5);
    const [activeTool, setActiveTool] = useState<Tool>('pen');
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    const canvasRef = useRef<CanvasHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = window.innerHeight * 0.5; // 50vh for more space
                setCanvasDimensions({ width, height });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleUndo = () => canvasRef.current?.undo();
    const handleErase = () => canvasRef.current?.clear();
    const handleDownload = () => {
        const dataURL = canvasRef.current?.getDownloadDataURL();
        if (dataURL) {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'batik-karyaku_goresan.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    const handleHelp = () => {
        alert(
            'Bantuan Navigasi Kanvas:\n\n' +
                '- Gambar: Klik dan geser dengan mouse atau gunakan satu jari di layar sentuh.\n' +
                '- Geser (Pan): Tahan tombol Spasi, lalu klik dan geser.\n' +
                '- Zoom: Tahan tombol Ctrl (atau Cmd di Mac), lalu gunakan scroll wheel, atau gunakan dua jari (pinch-to-zoom) di layar sentuh.\n' +
                '- Geser Vertikal: Gunakan scroll wheel.\n' +
                '- Geser Horizontal: Tahan tombol Shift, lalu gunakan scroll wheel.',
        );
    };

    return (
        <GuestLayout>
            <div className="mx-auto mt-24 flex w-full max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold sm:text-3xl">SELAMAT DATANG DI RUANG BATIK</h1>
                        <p className="mt-2 max-w-3xl">
                            Jelajahi dunia batik digital yang interaktif. Pilih motif khas, beri warna sesuai imajinasi, dan unduh karya Anda sebagai
                            bentuk ekspresi budaya.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#fcedd5] p-2 shadow-md">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 rounded-md bg-white/50 p-1">
                                <button
                                    onClick={() => setActiveTool('pen')}
                                    className={`rounded p-2 transition-colors ${activeTool === 'pen' ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200'}`}
                                    title="Pen"
                                >
                                    <Pen size={20} />
                                </button>
                                <button
                                    onClick={() => setActiveTool('eraser')}
                                    className={`rounded p-2 transition-colors ${activeTool === 'eraser' ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200'}`}
                                    title="Eraser"
                                >
                                    <Eraser size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="color" className="font-medium text-[#4A2E20]">
                                    Warna:
                                </label>
                                <input
                                    id="color"
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => setBrushColor(e.target.value)}
                                    className="h-8 w-8 cursor-pointer rounded border-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="brushSize" className="font-medium text-[#4A2E20]">
                                    Ukuran:
                                </label>
                                <input
                                    id="brushSize"
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="cursor-pointer"
                                />
                                <span className="text-[#4A2E20]">{brushSize}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={handleUndo} className="rounded bg-[#955932] px-3 py-1 text-white shadow transition hover:bg-[#4A2E20]">
                                Undo
                            </button>
                            <button onClick={handleErase} className="rounded bg-[#955932] px-3 py-1 text-white shadow transition hover:bg-[#4A2E20]">
                                Erase
                            </button>
                            <button
                                onClick={handleDownload}
                                className="rounded bg-green-700 px-3 py-1 text-white shadow transition hover:bg-green-800"
                            >
                                Download
                            </button>
                            <button
                                onClick={handleHelp}
                                className="flex items-center gap-1.5 rounded bg-sky-600 px-3 py-1 text-white shadow transition hover:bg-sky-700"
                            >
                                <HelpCircle size={16} />
                                <span>Bantuan</span>
                            </button>
                        </div>
                    </div>

                    <div ref={containerRef} className="w-full">
                        {canvasDimensions.width > 0 && (
                            <DrawingCanvas
                                ref={canvasRef}
                                motifSrc={selectedMotif}
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
                                className={`group cursor-pointer overflow-hidden rounded-lg border-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl ${selectedMotif === motif.src ? 'border-blue-500' : 'border-[#955932]'}`}
                                onClick={() => setSelectedMotif(motif.src)}
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
