"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface ProfileLinkProps {
  profileUrl: string;
}

export default function ProfileLink({
  profileUrl,
}: ProfileLinkProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDownloadUrl, setQrDownloadUrl] = useState("");

  useEffect(() => {
    const canvas = qrCanvasRef.current;

    if (!canvas || !profileUrl) {
      setQrDownloadUrl("");
      return;
    }

    let isCancelled = false;

    QRCode.toCanvas(canvas, profileUrl, {
      width: 176,
      margin: 1,
      color: {
        dark: "#780b0b",
        light: "#ffffff",
      },
    })
      .then(() => {
        if (!isCancelled) {
          setQrDownloadUrl(canvas.toDataURL("image/png"));
        }
      })
      .catch((error: unknown) => {
        console.error("Error generating QR code:", error);

        if (!isCancelled) {
          setQrDownloadUrl("");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [profileUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        profileUrl
      );

      toast.success("Profile URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const downloadQrCode = () => {
    if (!qrDownloadUrl) {
      toast.error("QR code is still loading");
      return;
    }

    const downloadLink = document.createElement("a");

    downloadLink.href = qrDownloadUrl;
    downloadLink.download = "echospace-share-qr.png";
    downloadLink.click();

    toast.success("QR code downloaded");
  };

 return(
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-3">
        <Input
          type="text"
          value={profileUrl}
          readOnly
          className="h-11 bg-muted/40 font-mono text-sm"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={copyToClipboard} className="h-11 sm:flex-1">
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={downloadQrCode}
            className="h-11 sm:flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          The QR code stays live here, so you can share the same public link quickly on mobile or print.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border bg-muted/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <QrCode className="h-4 w-4 text-primary" />
          Scan to open
        </div>

        <canvas
          ref={qrCanvasRef}
          className="rounded-xl border bg-white p-2 shadow-sm"
        />

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Instant access to this public page.
        </p>
      </div>
    </div>
  );
}
