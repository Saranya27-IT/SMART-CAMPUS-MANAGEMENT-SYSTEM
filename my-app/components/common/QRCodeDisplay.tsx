"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Loader2, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  value: string;
  label?: string;
  size?: number;
  downloadName?: string;
  className?: string;
}

export function QRCodeDisplay({
  value,
  label,
  size = 200,
  downloadName = "qrcode",
  className,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    setLoading(true);
    setError(false);
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#1e1b4b", // Deep indigo
        light: "#ffffff",
      },
    })
      .then(() => setLoading(false))
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [value, size]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${downloadName}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-3 bg-white relative"
        style={{ width: size + 24, height: size + 24 }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <QrCode className="h-5 w-5" />
            Error generating QR
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={cn("rounded-lg", loading || error ? "opacity-0" : "opacity-100")}
          style={{ transition: "opacity 0.2s" }}
        />
      </div>
      {label && (
        <p className="text-sm text-muted-foreground text-center font-mono break-all max-w-[200px]">
          {label}
        </p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading || error}
        id="qr-download-btn"
      >
        <Download className="mr-2 h-4 w-4" />
        Download QR
      </Button>
    </div>
  );
}
