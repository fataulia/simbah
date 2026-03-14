'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCcw, ZoomIn } from 'lucide-react';
import { getCroppedImg } from '@/lib/image-utils';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: any) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memotong gambar.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-900">
      <div className="flex items-center justify-between p-6">
        <button onClick={onCancel} className="text-white hover:text-zinc-300">
          <X size={24} />
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-white">Sesuaikan Foto</h2>
        <button 
          onClick={handleDone}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition-all"
        >
          <Check size={18} /> Simpan
        </button>
      </div>

      <div className="relative flex-1 bg-black">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1} // Square crop
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="bg-zinc-900 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <ZoomIn className="text-zinc-500" size={18} />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-emerald-500"
          />
        </div>
        <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Geser dan Zoom untuk menyesuaikan posisi wajah
        </p>
      </div>
    </div>
  );
}
