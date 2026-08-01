import { useRef, useState, useEffect } from "react";

// Renders a canvas the user can draw on with mouse or finger, and exposes
// the result as a PNG Blob via onSave(blob). Used inside SignatureUpload
// as the "Draw" alternative to uploading a signature image file.
export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#182642"; // ledger-800
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: (point.clientX - rect.left) * (canvas.width / rect.width),
      y: (point.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stop = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, "image/png");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={420}
        height={150}
        className="border border-ledger-200 rounded bg-white touch-none w-full max-w-[420px]"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={clear}
          className="text-xs border border-ledger-300 text-ledger-700 px-3 py-1.5 rounded hover:bg-ledger-50 transition">
          Clear
        </button>
        <button type="button" onClick={save} disabled={!hasDrawn}
          className="text-xs bg-ledger-900 text-white px-3 py-1.5 rounded hover:bg-ledger-800 transition disabled:opacity-40">
          Use this signature
        </button>
      </div>
    </div>
  );
}
