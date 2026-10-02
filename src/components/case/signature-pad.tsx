"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Draw-to-sign box. Reports a PNG data URL of the signature, or null when empty. */
export function SignaturePad({
  onChange,
  disabled,
}: {
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  // Match the canvas backing store to its displayed size and pixel ratio so strokes stay sharp.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e1e20";
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(canvasRef.current!.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <div className={cn("relative rounded-lg border bg-background", disabled && "opacity-60")}>
        <canvas
          ref={canvasRef}
          aria-label="Signature pad. Draw your signature with a trackpad, mouse or finger."
          role="img"
          className={cn("block h-36 w-full touch-none", disabled ? "cursor-not-allowed" : "cursor-crosshair")}
          onPointerDown={(e) => {
            if (disabled) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = point(e);
            // A dot, so a single tap still leaves a mark.
            const ctx = e.currentTarget.getContext("2d")!;
            ctx.beginPath();
            ctx.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = "#1e1e20";
            ctx.fill();
            setEmpty(false);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const p = point(e);
            const ctx = e.currentTarget.getContext("2d")!;
            ctx.beginPath();
            ctx.moveTo(last.current.x, last.current.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            last.current = p;
          }}
          onPointerUp={finish}
          onPointerCancel={finish}
          onLostPointerCapture={finish}
        />
        {/* Signature line and prompt, under the ink */}
        <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-dashed border-input" />
        {empty && (
          <span className="pointer-events-none absolute bottom-10 left-6 text-sm text-muted-foreground">
            Sign here
          </span>
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>Draw with your trackpad, mouse or finger.</span>
        {!empty && !disabled && (
          <Button variant="link" size="xs" className="h-auto p-0 text-xs" onClick={clear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
