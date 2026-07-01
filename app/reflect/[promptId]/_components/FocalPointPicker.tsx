'use client';

import { useRef } from 'react';
import type { ImageResult } from '@/lib/imageSearch';

type Props = {
  image: ImageResult;
  onChange: (img: ImageResult) => void;
};

export default function FocalPointPicker({ image, onChange }: Props) {
  const dragStart = useRef<{ x: number; y: number; focalX: number; focalY: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      focalX: image.focalX ?? 50,
      focalY: image.focalY ?? 50,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    const focalX = Math.round(Math.min(100, Math.max(0, dragStart.current.focalX - dx)));
    const focalY = Math.round(Math.min(100, Math.max(0, dragStart.current.focalY - dy)));
    onChange({ ...image, focalX, focalY });
  }

  function onPointerUp() {
    dragStart.current = null;
  }

  return (
    <div className="mt-3">
      <p className="text-[10px] text-stone-400 mb-2">Drag to reposition</p>
      <div
        className="relative w-full h-32 overflow-hidden rounded-lg cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={image.url}
          alt={image.label}
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `${image.focalX ?? 50}%`, top: `${image.focalY ?? 50}%` }}
        />
      </div>
    </div>
  );
}
