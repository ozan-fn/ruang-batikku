import GuestLayout from '@/layouts/guest-layout';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Image, Layer, Line, Rect, Stage } from 'react-konva';
import useImage from 'use-image';

// ====================================================================
// 1. KOMPONEN KANVAS BARU DENGAN REACT-KONVA
// Komponen ini mengurus semua logika menggambar.
// ====================================================================

const DrawingCanvas = forwardRef(({ motifSrc, brushColor, brushSize, width, height }, ref) => {
    const [image] = useImage(motifSrc, 'anonymous');
    const [lines, setLines] = useState([]);
    const [stage, setStage] = useState({ scale: 1, x: 0, y: 0 });
    const [isSpaceDown, setIsSpaceDown] = useState(false);

    const isDrawing = useRef(false);

    // --- Refs untuk node Konva ---
    const stageRef = useRef(null);
    const drawingLayerRef = useRef(null); // Ref untuk layer gambar

    // --- Efek untuk mendeteksi penekanan tombol Spasi ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsSpaceDown(true);
            }
        };
        const handleKeyUp = (e) => {
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

    useImperativeHandle(ref, () => ({
        undo: () => {
            setLines(lines.slice(0, -1));
        },
        clear: () => {
            setLines([]);
        },
        getDownloadDataURL: () => {
            if (!drawingLayerRef.current || !image) return null;

            // Simpan state panggung saat ini
            const originalState = { ...stage };

            // Reset panggung ke posisi dan skala awal untuk ekspor yang akurat
            stageRef.current.scale({ x: 1, y: 1 });
            stageRef.current.position({ x: 0, y: 0 });
            stageRef.current.batchDraw(); // Paksa re-render

            // Ekspor HANYA layer gambar dengan latar transparan
            const dataURL = drawingLayerRef.current.toDataURL({
                x: imgProps.x,
                y: imgProps.y,
                width: imgProps.width,
                height: imgProps.height,
                mimeType: 'image/png',
            });

            // Kembalikan panggung ke state semula
            stageRef.current.scale({ x: originalState.scale, y: originalState.scale });
            stageRef.current.position({ x: originalState.x, y: originalState.y });
            stageRef.current.batchDraw();

            return dataURL;
        },
    }));

    // --- Logika Event Handler Terpadu ---
    const handleMouseDown = (e) => {
        // Jangan menggambar jika mode geser (spasi) aktif atau bukan klik kiri
        if (isSpaceDown || e.evt.button !== 0) return;
        isDrawing.current = true;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        // KUNCI PERBAIKAN: Ubah koordinat pointer ke sistem koordinat panggung
        const transformedPos = {
            x: (pos.x - stage.x()) / stage.scaleX(),
            y: (pos.y - stage.y()) / stage.scaleY(),
        };

        setLines([...lines, { points: [transformedPos.x, transformedPos.y], color: brushColor, size: brushSize }]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || isSpaceDown) return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        // KUNCI PERBAIKAN: Ubah koordinat pointer ke sistem koordinat panggung
        const transformedPos = {
            x: (pos.x - stage.x()) / stage.scaleX(),
            y: (pos.y - stage.y()) / stage.scaleY(),
        };

        let lastLine = lines[lines.length - 1];

        lastLine.points = lastLine.points.concat([transformedPos.x, transformedPos.y]);
        setLines([...lines.slice(0, -1), lastLine]);
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    // --- Logika Navigasi (Zoom & Pan) dengan Mouse Wheel ---
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();

        // ZOOM: dengan Ctrl/Cmd + Scroll
        if (e.evt.ctrlKey || e.evt.metaKey) {
            const scaleBy = 1.05;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };
            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
            setStage({
                scale: newScale,
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            });
        } else {
            // PAN: dengan Scroll (Vertikal) atau Shift+Scroll (Horizontal)
            const panSpeedFactor = 4; // Angka lebih besar = lebih lambat

            // Jika Shift ditekan, gunakan deltaY untuk menggeser secara horizontal (sumbu X)
            if (e.evt.shiftKey) {
                const dx = e.evt.deltaY / panSpeedFactor;
                setStage((prevStage) => ({
                    ...prevStage,
                    x: prevStage.x - dx,
                }));
            } else {
                // Jika tidak, gunakan deltaY untuk menggeser secara vertikal (sumbu Y)
                const dy = e.evt.deltaY / panSpeedFactor;
                setStage((prevStage) => ({
                    ...prevStage,
                    y: prevStage.y - dy,
                }));
            }
        }
    };

    // --- Logika untuk memposisikan gambar (contain & center) ---
    let imgProps = { x: 0, y: 0, width: 0, height: 0 };
    if (image) {
        const stageWidth = width;
        const stageHeight = height;
        const imgAspectRatio = image.width / image.height;
        const stageAspectRatio = stageWidth / stageHeight;

        let drawWidth = image.width;
        let drawHeight = image.height;

        if (imgAspectRatio > stageAspectRatio) {
            drawWidth = stageWidth;
            drawHeight = stageWidth / imgAspectRatio;
        } else {
            drawHeight = stageHeight;
            drawWidth = stageHeight * imgAspectRatio;
        }

        imgProps = {
            width: drawWidth,
            height: drawHeight,
            x: (stageWidth - drawWidth) / 2,
            y: (stageHeight - drawHeight) / 2,
        };
    }

    const clipFunc = (ctx) => {
        ctx.rect(imgProps.x, imgProps.y, imgProps.width, imgProps.height);
    };

    return (
        <div style={{ cursor: isSpaceDown ? 'grab' : 'crosshair' }}>
            <Stage
                ref={stageRef}
                width={width}
                height={height}
                style={{ border: '2px solid #955932' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                draggable={isSpaceDown} // Hanya bisa digeser saat Spasi ditekan
                scaleX={stage.scale}
                scaleY={stage.scale}
                x={stage.x}
                y={stage.y}
            >
                <Layer>
                    <Rect x={0} y={0} width={width} height={height} fill="white" />
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
                            globalCompositeOperation="source-over"
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
});

// ====================================================================
// 2. KOMPONEN UTAMA HALAMAN (RUANG BATIK)
// ====================================================================
const motifs = [
    { id: 'parang-rusak', name: 'Parang Rusak', src: 'https://placehold.co/512x512/FCECD5/4A2E20?text=Parang+Rusak' },
    { id: 'mega-mendung', name: 'Mega Mendung', src: 'https://placehold.co/800x600/D1E5F0/1E3A8A?text=Mega+Mendung' },
    { id: 'kawung', name: 'Kawung', src: 'https://placehold.co/600x600/E0E0E0/333333?text=Kawung' },
];

export default function RuangBatik() {
    const [selectedMotif, setSelectedMotif] = useState(motifs[0].src);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const canvasRef = useRef(null);

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

    return (
        <GuestLayout>
            <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:px-8">
                <div className="flex w-full flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold sm:text-3xl">SELAMAT DATANG DI RUANG BATIK</h1>
                        <p className="mx-auto mt-2 max-w-3xl">
                            Ciptakan mahakarya batik digital Anda sendiri. Pilih motif, warnai, dan unduh karya Anda.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#fcedd5] p-4 shadow-md">
                        <div className="flex items-center gap-4">
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
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <DrawingCanvas
                            ref={canvasRef}
                            motifSrc={selectedMotif}
                            brushColor={brushColor}
                            brushSize={brushSize}
                            width={768}
                            height={400}
                        />
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
}
