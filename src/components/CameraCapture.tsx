'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Camera, Check, ImagePlus, RefreshCcw, RotateCcw, Upload, X } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';

export type PreparedMedia = {
  file: File;
  previewUrl: string;
  previewDataUrl: string;
};

export type CameraCaptureHandle = {
  openCamera: () => void;
  openDeviceCamera: () => void;
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
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Unable to create image frame'))),
      'image/jpeg',
      quality,
    );
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
  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(src);
    throw new Error('Unable to prepare image.');
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(src);
  const blob = await canvasToBlob(canvas);
  const previewDataUrl = canvasToDataUrl(canvas);
  return {
    file: new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' }),
    previewUrl: previewDataUrl,
    previewDataUrl,
  };
}

async function waitForLiveFrame(video: HTMLVideoElement, timeoutMs = 3500): Promise<void> {
  const startedAt = Date.now();

  while (
    (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth < 2 || video.videoHeight < 2)
    && Date.now() - startedAt < timeoutMs
  ) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 60));
  }

  if (video.videoWidth < 2 || video.videoHeight < 2) {
    throw new Error('Camera frame is not ready yet. Please hold steady and try again.');
  }

  const frameVideo = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number;
  };

  if (frameVideo.requestVideoFrameCallback) {
    await new Promise<void>((resolve) => {
      const fallback = window.setTimeout(resolve, 250);
      frameVideo.requestVideoFrameCallback?.(() => {
        window.clearTimeout(fallback);
        resolve();
      });
    });
  } else {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
  }
}

const CameraCapture = forwardRef<CameraCaptureHandle, Props>(function CameraCapture(
  { t, value, onChange, disabled, captureToken = 0 },
  ref,
) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCaptureTokenRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [showDeviceFallback, setShowDeviceFallback] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActiveStream(null);
    setCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  }, []);

  const openDeviceCamera = useCallback(() => {
    setError(null);
    setShowDeviceFallback(false);
    cameraInputRef.current?.click();
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setShowDeviceFallback(false);
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
  }, [onChange]);

  const startCamera = useCallback(async () => {
    if (disabled || preparing || captureInProgress) return;
    setError(null);
    setShowDeviceFallback(false);
    setCaptureComplete(false);

    if (!window.isSecureContext) {
      setError('Live camera requires a secure HTTPS connection. Use the device camera button below.');
      setShowDeviceFallback(true);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      openDeviceCamera();
      return;
    }

    stopCamera();
    setCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      setActiveStream(stream);
    } catch (caught) {
      const cameraError = caught as DOMException;
      stopCamera();
      setShowDeviceFallback(true);
      if (cameraError?.name === 'NotAllowedError' || cameraError?.name === 'SecurityError') {
        setError('Camera permission was blocked. Allow camera access in browser settings, or use Open device camera.');
      } else if (cameraError?.name === 'NotFoundError') {
        setError('No camera was detected. Use gallery upload or another device.');
      } else if (cameraError?.name === 'NotReadableError') {
        setError('The camera is being used by another app. Close it and try again.');
      } else {
        setError('Live camera could not start. Use the device camera option below.');
      }
    }
  }, [captureInProgress, disabled, openDeviceCamera, preparing, stopCamera]);

  useEffect(() => {
    if (!cameraOpen || !activeStream || !videoRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = activeStream;

    const markReady = () => {
      if (video.videoWidth > 1 && video.videoHeight > 1) setCameraReady(true);
    };

    const playVideo = async () => {
      try {
        await video.play();
        markReady();
      } catch {
        setCameraReady(false);
        setError('Camera opened but preview could not start. Tap restart or use the device camera.');
      }
    };

    video.addEventListener('loadedmetadata', playVideo);
    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('playing', markReady);
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) void playVideo();

    return () => {
      video.removeEventListener('loadedmetadata', playVideo);
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('playing', markReady);
    };
  }, [activeStream, cameraOpen]);

  const captureFrame = useCallback(async () => {
    if (captureInProgress) return;
    const video = videoRef.current;
    if (!video) {
      setError('Camera preview is unavailable. Please restart the camera.');
      return;
    }

    setCaptureInProgress(true);
    setCaptureComplete(false);
    setError(null);

    try {
      await waitForLiveFrame(video);
      video.pause();

      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Photo capture is not supported by this browser.');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const previewDataUrl = canvasToDataUrl(canvas, 0.9);
      const blob = await canvasToBlob(canvas, 0.9);
      const file = new File([blob], `kisanmitra-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setCaptureComplete(true);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
      stopCamera();
      onChange({ file, previewUrl: previewDataUrl, previewDataUrl });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to capture this photo.');
      setShowDeviceFallback(true);
      setCameraReady(video.videoWidth > 1 && video.videoHeight > 1);
      void video.play().catch(() => undefined);
    } finally {
      setCaptureInProgress(false);
    }
  }, [captureInProgress, onChange, stopCamera]);

  useImperativeHandle(ref, () => ({
    openCamera: () => void startCamera(),
    openDeviceCamera,
  }), [openDeviceCamera, startCamera]);

  useEffect(() => {
    if (captureToken > 0 && captureToken !== lastCaptureTokenRef.current) {
      lastCaptureTokenRef.current = captureToken;
      void startCamera();
    }
  }, [captureToken, startCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const hiddenInputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onClick={(event) => { event.currentTarget.value = ''; }}
        onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onClick={(event) => { event.currentTarget.value = ''; }}
        onChange={(event) => event.target.files?.[0] && void handleFile(event.target.files[0])}
      />
    </>
  );

  if (cameraOpen) {
    return (
      <div className="camera-viewfinder">
        {hiddenInputs}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="viewfinder-video"
          aria-label="Live crop camera"
          onLoadedData={() => setCameraReady(true)}
          onCanPlay={() => setCameraReady(true)}
          onPlaying={() => setCameraReady(true)}
        />

        {!cameraReady && !captureInProgress && (
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center bg-[#101311]/75 px-8 text-center text-white backdrop-blur-sm">
            <RefreshCcw className="mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm font-bold">Starting camera…</p>
          </div>
        )}

        {captureInProgress && (
          <div className="absolute inset-0 z-[12] flex flex-col items-center justify-center bg-white/16 text-white backdrop-blur-[2px]">
            {captureComplete ? <Check className="mb-2 h-12 w-12" /> : <RefreshCcw className="mb-2 h-10 w-10 animate-spin" />}
            <p className="text-sm font-extrabold">{captureComplete ? 'Photo captured' : 'Capturing photo…'}</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-4 z-20 rounded-2xl border border-amber-200/40 bg-black/62 px-4 py-3 text-center text-xs font-bold text-white backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-5 px-5">
          <button type="button" onClick={stopCamera} disabled={captureInProgress} className="camera-control" aria-label="Close camera">
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void captureFrame()}
            disabled={captureInProgress}
            className="camera-shutter touch-manipulation disabled:opacity-60"
            aria-label="Take crop photo"
            aria-busy={captureInProgress}
          >
            {captureInProgress ? <RefreshCcw className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
          </button>
          <button
            type="button"
            onClick={() => { stopCamera(); window.setTimeout(() => void startCamera(), 120); }}
            disabled={captureInProgress}
            className="camera-control"
            aria-label="Restart camera"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {showDeviceFallback && (
          <button
            type="button"
            onClick={() => { stopCamera(); window.setTimeout(openDeviceCamera, 80); }}
            className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/30 bg-black/62 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg backdrop-blur-md"
          >
            Open device camera
          </button>
        )}
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative h-72 overflow-hidden rounded-[28px] border border-white/80 bg-black shadow-[0_22px_50px_rgba(34,38,36,0.18)]">
        {hiddenInputs}
        <img src={value.previewUrl} alt="Crop preview" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-white/10" />
        <button type="button" onClick={() => onChange(null)} className="absolute right-3 top-3 flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-lg backdrop-blur-md" aria-label="Remove image">
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="m3-card border-dashed p-7 text-center">
      {hiddenInputs}
      <button type="button" onClick={() => void startCamera()} disabled={disabled || preparing} className="camera-launch-orb animate-camera-pulse mx-auto mb-5" aria-label={t.takePhoto}>
        <Camera className="relative z-10 h-11 w-11" />
      </button>
      <span className="section-kicker mb-2">AI Crop Vision</span>
      <h2 className="mb-2 text-[22px] font-extrabold text-[#202421]">{t.takePhoto}</h2>
      <p className="mx-auto mb-6 max-w-[330px] text-sm font-semibold leading-relaxed text-[#6F746F]">स्पष्ट पत्ती, तना किंवा संपूर्ण पौधा दिखाएं / Capture a clear leaf, stem or whole plant.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" disabled={disabled || preparing} onClick={() => void startCamera()} className="btn-m3-primary w-full">
          <Camera className="h-5 w-5" /> {preparing ? 'Preparing…' : t.takePhoto}
        </button>
        <button type="button" disabled={disabled || preparing} onClick={() => galleryInputRef.current?.click()} className="btn-m3-secondary w-full">
          {preparing ? <Upload className="h-5 w-5 animate-pulse" /> : <ImagePlus className="h-5 w-5" />} {t.chooseGallery}
        </button>
      </div>

      {showDeviceFallback && (
        <button type="button" onClick={openDeviceCamera} className="mt-3 w-full rounded-2xl border border-[#C9AE7B]/40 bg-[#FBF6EC] px-4 py-3 text-sm font-extrabold text-[#5B4B32] shadow-sm">
          <Camera className="mr-2 inline h-4 w-4" /> Open device camera
        </button>
      )}

      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Live camera, device camera, gallery image or video up to 30 seconds</p>
      {error && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-sm font-semibold text-amber-900 shadow-sm">{error}</div>}
    </div>
  );
});

export default CameraCapture;
