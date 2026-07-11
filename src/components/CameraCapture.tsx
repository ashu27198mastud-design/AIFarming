'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCcw, Upload, X } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';

export type PreparedMedia = {
  file: File;
  previewUrl: string;
  previewDataUrl: string;
};

type Props = {
  t: TranslationSet;
  value: PreparedMedia | null;
  onChange: (media: PreparedMedia | null) => void;
  disabled?: boolean;
  captureToken?: number;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.86): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Unable to create image frame'))), 'image/jpeg', quality);
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality = 0.82): string {
  return canvas.toDataURL('image/jpeg', quality);
}

function sharpnessScore(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    const offset = i * 4;
    gray[i] = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
  }
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const laplacian = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count += 1;
    }
  }
  if (!count) return 0;
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

async function seek(video: HTMLVideoElement, time: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Unable to read video frame'));
    };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = Math.min(Math.max(time, 0), Math.max(video.duration - 0.05, 0));
  });
}

async function extractVideoFrames(file: File): Promise<PreparedMedia> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Unsupported or damaged video'));
  });

  if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 30) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Video duration must be between 1 and 30 seconds.');
  }

  const times = [Math.max(0.1, video.duration * 0.08), video.duration * 0.5, video.duration * 0.92];
  const frames: { canvas: HTMLCanvasElement; score: number }[] = [];
  const maxDimension = 1200;

  for (const time of times) {
    await seek(video, time);
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth || 1, video.videoHeight || 1));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push({ canvas, score: sharpnessScore(canvas) });
  }

  URL.revokeObjectURL(objectUrl);
  if (frames.length !== 3) throw new Error('Could not extract video frames.');

  const middlePreview = canvasToDataUrl(frames[1].canvas);
  const sharpest = [...frames].sort((a, b) => b.score - a.score)[0];
  const blob = await canvasToBlob(sharpest.canvas);
  return {
    file: new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-sharpest.jpg`, { type: 'image/jpeg' }),
    previewUrl: middlePreview,
    previewDataUrl: middlePreview,
  };
}

async function prepareImage(file: File): Promise<PreparedMedia> {
  const src = URL.createObjectURL(file);
  const image = new Image();
  image.src = src;
  await image.decode();
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(src);
  const blob = await canvasToBlob(canvas);
  const previewDataUrl = canvasToDataUrl(canvas);
  return {
    file: new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' }),
    previewUrl: previewDataUrl,
    previewDataUrl,
  };
}

export default function CameraCapture({ t, value, onChange, disabled, captureToken = 0 }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCaptureTokenRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 25 * 1024 * 1024) {
      setError('File size is too large. Maximum 25 MB.');
      return;
    }
    setPreparing(true);
    try {
      const media = file.type.startsWith('video/') ? await extractVideoFrames(file) : await prepareImage(file);
      onChange(media);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to prepare this file.');
      onChange(null);
    } finally {
      setPreparing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    if (disabled || preparing) return;
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      window.requestAnimationFrame(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => undefined);
      });
    } catch (caught) {
      console.warn('Live camera unavailable, falling back to device capture:', caught);
      cameraInputRef.current?.click();
    }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Camera is still starting. Please try again.');
      return;
    }

    const maxDimension = 1200;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, 0.9);
    stopCamera();
    await handleFile(new File([blob], `kisanmitra-camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  };

  useEffect(() => {
    if (captureToken > 0 && captureToken !== lastCaptureTokenRef.current) {
      lastCaptureTokenRef.current = captureToken;
      const timer = window.setTimeout(() => void startCamera(), 80);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [captureToken]);

  useEffect(() => () => stopCamera(), []);

  if (cameraOpen) {
    return (
      <div className="camera-viewfinder">
        <video ref={videoRef} autoPlay playsInline muted className="viewfinder-video" aria-label="Live crop camera" />
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-5 px-5">
          <button type="button" onClick={stopCamera} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md" aria-label="Close camera">
            <X className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => void captureFrame()} className="camera-shutter" aria-label="Take crop photo">
            <Camera className="h-7 w-7 text-[#2E7D32]" />
          </button>
          <button type="button" onClick={() => { stopCamera(); window.setTimeout(() => void startCamera(), 120); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md" aria-label="Restart camera">
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative h-72 overflow-hidden rounded-[28px] border border-white/80 bg-black shadow-[0_20px_45px_rgba(20,60,27,0.18)]">
        <img src={value.previewUrl} alt="Crop preview" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-white/10" />
        <button type="button" onClick={() => onChange(null)} className="absolute right-3 top-3 flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md" aria-label="Remove image">
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="m3-card border-dashed p-7 text-center">
      <button type="button" onClick={() => void startCamera()} disabled={disabled || preparing} className="camera-launch-orb animate-camera-pulse mx-auto mb-5" aria-label={t.takePhoto}>
        <Camera className="relative z-10 h-11 w-11" />
      </button>
      <span className="section-kicker mb-2">AI Crop Vision</span>
      <h2 className="mb-2 text-[22px] font-extrabold text-zinc-900">{t.takePhoto}</h2>
      <p className="mx-auto mb-6 max-w-[330px] text-sm font-semibold leading-relaxed text-zinc-500">स्पष्ट पत्ती, तना किंवा संपूर्ण पौधा दिखाएं / Capture a clear leaf, stem or whole plant.</p>

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])} />
      <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" disabled={disabled || preparing} onClick={() => void startCamera()} className="btn-m3-primary w-full">
          <Camera className="h-5 w-5" /> {preparing ? 'Preparing...' : t.takePhoto}
        </button>
        <button type="button" disabled={disabled || preparing} onClick={() => galleryInputRef.current?.click()} className="btn-m3-secondary w-full">
          {preparing ? <Upload className="h-5 w-5 animate-pulse" /> : <ImagePlus className="h-5 w-5" />} {t.chooseGallery}
        </button>
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Photo, gallery image or video up to 30 seconds</p>
      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-sm font-semibold text-red-700 shadow-sm">{error}</div>}
    </div>
  );
}
