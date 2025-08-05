// Anda perlu install: npm install react-konva konva
import { useRef, useState } from 'react';
import { Image, Layer, Line, Rect, Stage } from 'react-konva';
import useImage from 'use-image'; // npm install use-image

// Contoh komponen baru menggunakan react-konva
const KonvaCanvas = ({ motifSrc }) => {
    const [image] = useImage(motifSrc, 'anonymous');
    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // Ganti seluruh array untuk memicu re-render
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    // Hitung posisi gambar agar di tengah
    const imageX = image ? (768 - image.width) / 2 : 0;
    const imageY = image ? (400 - image.height) / 2 : 0;

    return (
        <Stage
            width={768} // Kontrol Penuh
            height={400} // Kontrol Penuh
            style={{ border: '2px solid #955932' }} // Kontrol Penuh
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Layer>
                {/* Latar Belakang Putih */}
                <Rect x={0} y={0} width={768} height={400} fill="white" />

                {/* Gambar Motif di Tengah */}
                <Image image={image} x={imageX} y={imageY} />

                {/* Gambar semua garis yang dibuat pengguna */}
                {lines.map((line, i) => (
                    <Line key={i} points={line.points} stroke="black" strokeWidth={4} tension={0.5} lineCap="round" />
                ))}
            </Layer>
        </Stage>
    );
};

export default KonvaCanvas;
