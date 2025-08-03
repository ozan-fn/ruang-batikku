import GuestLayout from '@/layouts/guest-layout';
import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';

interface LineData {
    tool: string;
    points: number[];
}

export default function RuangBatik() {
    const [tool, setTool] = useState('pen');
    const [lines, setLines] = useState<LineData[]>([]);
    const [redoStack, setRedoStack] = useState<LineData[][]>([]);
    const [stageSize, setStageSize] = useState({ width: 800, height: 450 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [showReference, setShowReference] = useState(false);
    const [referenceOpacity, setReferenceOpacity] = useState(0.5);
    const isDrawing = useRef(false);
    const stageRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const updateStageSize = () => {
            const maxWidth = Math.min(window.innerWidth * 0.9, 800);
            const aspectRatio = 16 / 9;
            setStageSize({
                width: maxWidth,
                height: maxWidth / aspectRatio,
            });
        };

        updateStageSize();
        window.addEventListener('resize', updateStageSize);
        return () => window.removeEventListener('resize', updateStageSize);
    }, []);

    const handleMouseDown = (e: any) => {
        if (tool === 'zoom') return;

        isDrawing.current = true;
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const pos = {
            x: (pointer.x - stagePosition.x) / stageScale,
            y: (pointer.y - stagePosition.y) / stageScale,
        };

        setRedoStack([]);
        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing.current || tool === 'zoom') {
            return;
        }
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const point = {
            x: (pointer.x - stagePosition.x) / stageScale,
            y: (pointer.y - stagePosition.y) / stageScale,
        };

        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        const newLines = [...lines];
        newLines[newLines.length - 1] = lastLine;
        setLines(newLines);
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const handleWheel = (e: any) => {
        e.evt.preventDefault();

        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        let direction = e.evt.deltaY > 0 ? 1 : -1;
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const finalScale = Math.max(0.1, Math.min(newScale, 5));

        setStageScale(finalScale);

        const newPos = {
            x: pointer.x - mousePointTo.x * finalScale,
            y: pointer.y - mousePointTo.y * finalScale,
        };
        setStagePosition(newPos);
    };

    const handleToolChange = (newTool: string) => {
        setTool(newTool);
    };

    const handleUndo = () => {
        if (lines.length === 0) return;

        const newLines = [...lines];
        const removedLine = newLines.pop();

        if (removedLine) {
            setRedoStack([...redoStack, [removedLine]]);
        }

        setLines(newLines);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;

        const newRedoStack = [...redoStack];
        const lineToRestore = newRedoStack.pop();

        if (lineToRestore && lineToRestore.length > 0) {
            setLines([...lines, ...lineToRestore]);
        }

        setRedoStack(newRedoStack);
    };

    const handleZoomIn = () => {
        const newScale = Math.min(stageScale * 1.2, 5);
        setStageScale(newScale);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(stageScale / 1.2, 0.1);
        setStageScale(newScale);
    };

    const handleResetZoom = () => {
        setStageScale(1);
        setStagePosition({ x: 0, y: 0 });
    };

    const handleClear = () => {
        if (lines.length > 0) {
            setRedoStack([]);
            setLines([]);
        }
    };

    const handleFinish = () => {
        console.log('Drawing finished');
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setReferenceImage(e.target?.result as string);
                setShowReference(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const toggleReference = () => {
        setShowReference(!showReference);
    };

    const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReferenceOpacity(parseFloat(event.target.value));
    };

    return (
        <GuestLayout>
            <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-4">
                <div className="justify-start self-stretch text-2xl font-bold text-black">SELAMAT DATANG DI RUANGAN BATIK</div>
                <div className="max-w-3xl justify-start self-stretch text-sm font-normal text-black">
                    Melangkahlah masuk ke dalam dunia di mana setiap goresan memiliki cerita dan setiap warna menyimpan makna. "Ruangan Batik" ini
                    kami persembahkan sebagai jendela untuk mengagumi kekayaan warisan budaya Indonesia.
                </div>
                <div className="inline-flex h-10 max-w-3xl flex-col items-start justify-between">
                    <div className="inline-flex items-center justify-between self-stretch overflow-hidden rounded-lg bg-gradient-to-b from-[#955932] from-100% p-2">
                        <div className="flex items-center justify-start gap-2">
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7] disabled:opacity-50"
                                onClick={handleUndo}
                                disabled={lines.length === 0}
                                title="Undo"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.99996 9.33341L2.66663 6.00008M2.66663 6.00008L5.99996 2.66675M2.66663 6.00008H9.66663C10.1481 6.00008 10.6249 6.09492 11.0698 6.27919C11.5147 6.46346 11.9189 6.73354 12.2594 7.07402C12.5998 7.4145 12.8699 7.81871 13.0542 8.26357C13.2385 8.70844 13.3333 9.18523 13.3333 9.66675C13.3333 10.1483 13.2385 10.6251 13.0542 11.0699C12.8699 11.5148 12.5998 11.919 12.2594 12.2595C11.9189 12.6 11.5147 12.87 11.0698 13.0543C10.6249 13.2386 10.1481 13.3334 9.66663 13.3334H7.33329"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7] disabled:opacity-50"
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                title="Redo"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M9.99996 9.33341L13.3333 6.00008M13.3333 6.00008L9.99996 2.66675M13.3333 6.00008H6.33329C5.36083 6.00008 4.4282 6.38639 3.74057 7.07402C3.05293 7.76166 2.66663 8.69429 2.66663 9.66675C2.66663 10.1483 2.76147 10.6251 2.94573 11.0699C3.13 11.5148 3.40009 11.919 3.74057 12.2595C4.4282 12.9471 5.36083 13.3334 6.33329 13.3334H8.66663"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div>
                                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="2" height="24" rx="1" fill="#FCEDD5" />
                                </svg>
                            </div>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7]"
                                onClick={handleUploadClick}
                                title="Upload Reference Image"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14 10v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3M12 5l-4-4-4 4M8 1v9"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            {referenceImage && (
                                <button
                                    className={`flex items-center justify-start gap-2.5 rounded-md p-1 transition-colors ${
                                        showReference ? 'bg-[#d4c4a8]' : 'bg-[#fcedd5] hover:bg-[#f5e4c7]'
                                    }`}
                                    onClick={toggleReference}
                                    title="Toggle Reference Visibility"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        {showReference ? (
                                            <path
                                                d="M1 1l14 14M10.5 10.5A3 3 0 0 1 5.5 5.5m4 4L1 1m9.5 9.5L15 15M8 3a5 5 0 0 1 5 5"
                                                stroke="black"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        ) : (
                                            <path
                                                d="M1 12s4-8 7-8 7 8 7 8-4 8-7 8-7-8-7-8z M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                                                stroke="black"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}
                                    </svg>
                                </button>
                            )}
                            <div>
                                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="2" height="24" rx="1" fill="#FCEDD5" />
                                </svg>
                            </div>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7]"
                                onClick={handleClear}
                                title="Clear All"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M2 8C2 9.18669 2.35189 10.3467 3.01118 11.3334C3.67047 12.3201 4.60754 13.0892 5.7039 13.5433C6.80026 13.9974 8.00666 14.1162 9.17054 13.8847C10.3344 13.6532 11.4035 13.0818 12.2426 12.2426C13.0818 11.4035 13.6532 10.3344 13.8847 9.17054C14.1162 8.00666 13.9974 6.80026 13.5433 5.7039C13.0892 4.60754 12.3201 3.67047 11.3334 3.01118C10.3467 2.35189 9.18669 2 8 2C6.32263 2.00631 4.71265 2.66082 3.50667 3.82667L2 5.33333M2 5.33333V2M2 5.33333H5.33333"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div>
                                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="2" height="24" rx="1" fill="#FCEDD5" />
                                </svg>
                            </div>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7]"
                                onClick={handleZoomIn}
                                title="Zoom In"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="7.5" cy="7.5" r="5.5" stroke="black" strokeWidth="2" />
                                    <path d="M5.5 7.5h4M7.5 5.5v4" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M13 13l-2.5-2.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7]"
                                onClick={handleZoomOut}
                                title="Zoom Out"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="7.5" cy="7.5" r="5.5" stroke="black" strokeWidth="2" />
                                    <path d="M5.5 7.5h4" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M13 13l-2.5-2.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button
                                className={`flex items-center justify-start gap-2.5 rounded-md p-1 transition-colors ${
                                    tool === 'zoom' ? 'bg-[#d4c4a8]' : 'bg-[#fcedd5] hover:bg-[#f5e4c7]'
                                }`}
                                onClick={() => handleToolChange('zoom')}
                                title="Zoom/Pan Tool"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="7.5" cy="7.5" r="5.5" stroke="black" strokeWidth="2" />
                                    <path d="M13 13l-2.5-2.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button
                                className="flex items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] p-1 transition-colors hover:bg-[#f5e4c7]"
                                onClick={handleResetZoom}
                                title="Reset Zoom"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 1v6l2-2m-2 2L6 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 9a5 5 0 1 0 10 0" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <div>
                                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="2" height="24" rx="1" fill="#FCEDD5" />
                                </svg>
                            </div>
                            <button
                                className={`flex items-center justify-start gap-2.5 rounded-md p-1 transition-colors ${
                                    tool === 'eraser' ? 'bg-[#d4c4a8]' : 'bg-[#fcedd5] hover:bg-[#f5e4c7]'
                                }`}
                                onClick={() => handleToolChange('eraser')}
                                title="Eraser"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.66659 13.9999L14.1999 8.46655C14.8666 7.86655 14.8666 6.86655 14.1999 6.19989L10.4666 2.46655C9.86659 1.79989 8.86659 1.79989 8.19993 2.46655L1.79993 8.86655C1.13326 9.46655 1.13326 10.4666 1.79993 11.1332L4.66659 13.9999L14.6666 13.9999M3.33329 7.33325L9.33329 13.3333"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button
                                className={`flex items-center justify-start gap-2.5 rounded-md p-1 transition-colors ${
                                    tool === 'pen' ? 'bg-[#d4c4a8]' : 'bg-[#fcedd5] hover:bg-[#f5e4c7]'
                                }`}
                                onClick={() => handleToolChange('pen')}
                                title="Pen"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4.94272 8.66675H3.33338C3.15657 8.66675 2.987 8.73699 2.86198 8.86201C2.73695 8.98703 2.66672 9.1566 2.66672 9.33341V14.6667L13.58 3.75341C13.8453 3.4882 13.9943 3.12849 13.9943 2.75341C13.9943 2.37834 13.8453 2.01863 13.58 1.75341C13.3148 1.4882 12.9551 1.3392 12.58 1.3392C12.205 1.3392 11.8453 1.4882 11.58 1.75341L5.13805 8.19541C5.01307 8.32043 4.94272 8.48997 4.94272 8.66675ZM4.94272 8.66675C4.94272 8.84352 5.01307 9.01306 5.13805 9.13808L6.66672 10.6667"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button
                                className={`flex items-center justify-start gap-2.5 rounded-md p-1 transition-colors ${
                                    tool === 'brush' ? 'bg-[#d4c4a8]' : 'bg-[#fcedd5] hover:bg-[#f5e4c7]'
                                }`}
                                onClick={() => handleToolChange('brush')}
                                title="Brush"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4.66666 2.3334C7.99999 1.00007 9.33332 4.00007 6.66665 5.00007C0.999989 6.66674 1.33332 10.0001 3.33332 10.6667C6.66665 12.0001 9.33332 4.00007 12.6667 6.00007C16 8.00007 13 15.0001 9.99999 14.0001C6.66665 12.3334 10.3333 6.66674 14 12.6667"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                        <button
                            className="flex h-6 items-center justify-start gap-2.5 rounded-md bg-[#fcedd5] px-3 py-1 transition-colors hover:bg-[#f5e4c7]"
                            onClick={handleFinish}
                        >
                            <div className="justify-start font-['Anek_Latin'] text-sm font-semibold text-black">SELESAI</div>
                        </button>
                    </div>
                </div>

                <div className="relative flex aspect-16/9 w-full max-w-3xl items-center justify-center overflow-hidden border border-black bg-white">
                    <Stage
                        ref={stageRef}
                        width={stageSize.width}
                        height={stageSize.height}
                        scaleX={stageScale}
                        scaleY={stageScale}
                        x={stagePosition.x}
                        y={stagePosition.y}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                        onWheel={handleWheel}
                        draggable={tool === 'zoom'}
                        onDragMove={(e) => {
                            if (tool === 'zoom') {
                                setStagePosition({ x: e.target.x(), y: e.target.y() });
                            }
                        }}
                        className={tool === 'zoom' ? 'cursor-grab' : 'cursor-crosshair'}
                    >
                        <Layer>
                            {/* Reference Image Layer */}
                            {referenceImage && showReference && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${referenceImage})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        opacity: referenceOpacity,
                                        pointerEvents: 'none',
                                        zIndex: 1,
                                    }}
                                />
                            )}

                            <Text
                                text="Mulai menggambar batik Anda di sini..."
                                x={10}
                                y={10}
                                fontSize={16}
                                fill="#666"
                                opacity={lines.length === 0 ? 1 : 0}
                            />
                            {lines.map((line: LineData, i: number) => (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke={line.tool === 'eraser' ? '#ffffff' : '#df4b26'}
                                    strokeWidth={line.tool === 'eraser' ? 10 : line.tool === 'brush' ? 8 : 3}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                                />
                            ))}
                        </Layer>
                    </Stage>

                    <div className="bg-opacity-50 absolute top-2 right-2 rounded bg-black px-2 py-1 text-sm text-white">
                        {Math.round(stageScale * 100)}%
                    </div>

                    {/* Reference Controls */}
                    {referenceImage && showReference && (
                        <div className="bg-opacity-50 absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black px-3 py-2 text-white">
                            <span className="text-xs">Opacity:</span>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={referenceOpacity}
                                onChange={handleOpacityChange}
                                className="slider h-1 w-16 appearance-none rounded bg-gray-300"
                                style={{
                                    background: `linear-gradient(to right, #df4b26 0%, #df4b26 ${referenceOpacity * 100}%, #ccc ${referenceOpacity * 100}%, #ccc 100%)`,
                                }}
                            />
                            <span className="text-xs">{Math.round(referenceOpacity * 100)}%</span>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
            </div>
        </GuestLayout>
    );
}
