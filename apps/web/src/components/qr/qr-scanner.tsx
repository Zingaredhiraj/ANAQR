'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Camera, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export function QRScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {
            // AbortError from rapid re-renders — safe to ignore
          });
          setHasCameraPermission(true);
          requestAnimationFrame(scanQRCode);
        }
      } catch (err: any) {
        setHasCameraPermission(false);
        setErrorMessage(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings to scan anatomical specimens.'
            : 'Unable to access device camera. You can manually enter the organ identifier below.'
        );
      }
    };

    const scanQRCode = () => {
      if (!scanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleScannedData(code.data);
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanning]);

  const handleScannedData = (data: string) => {
    setScanning(false);
    // Parse URL or slug
    let targetSlug = data.trim();
    if (targetSlug.includes('/o/')) {
      const parts = targetSlug.split('/o/');
      targetSlug = parts[1].split('?')[0].split('#')[0];
    } else if (targetSlug.includes('/organs/')) {
      const parts = targetSlug.split('/organs/');
      targetSlug = parts[1].split('?')[0].split('#')[0];
    }
    router.push(`/o/${targetSlug.toLowerCase()}` as any);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedData(manualCode.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-teal-500/40">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Target Graphic */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
          <div className="w-full h-full border-2 border-dashed border-teal-400/70 rounded-2xl relative animate-pulse">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
          </div>
        </div>

        {/* Camera Permission / Error Overlay */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 bg-navy-950/90 flex flex-col items-center justify-center p-6 text-center text-white">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <p className="text-sm text-gray-200">{errorMessage}</p>
          </div>
        )}

        <div className="absolute bottom-4 inset-x-4 text-center">
          <span className="inline-block bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
            Center physical specimen label within target
          </span>
        </div>
      </div>

      {/* Manual Input Fallback */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Or Enter Specimen Code / Slug
        </h4>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. heart, lungs, kidney"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
