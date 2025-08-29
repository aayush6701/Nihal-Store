"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  title,
  beforeLabel = "Before",
  afterLabel = "After",
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (event) => {
    if (!isDragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x =
      Math.max(0, Math.min(event.clientX - rect.left, rect.width)) ||
      Math.max(0, Math.min(event.touches?.[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  return (
    <section className="w-full bg-white px-4 md:px-8 py-10">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
          {title}
        </h2>
      )}

      <div
        className="relative w-[80vw] aspect-[16/9] mx-auto overflow-hidden select-none"
        onMouseMove={handleMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* After Image (base) */}
        <Image
          alt="After"
          src={afterImage}
          fill
          draggable={false}
          className="object-cover"
          priority
        />

        {/* Before Image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            alt="Before"
            src={beforeImage}
            fill
            draggable={false}
            className="object-cover"
            priority
          />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-white text-black text-sm md:text-base font-medium px-3 py-1 rounded shadow-sm">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 bg-white text-black text-sm md:text-base font-medium px-3 py-1 rounded shadow-sm">
          {afterLabel}
        </div>

        {/* Divider with handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `calc(${sliderPosition}% - 0.5px)` }}
        >
          {/* Circle Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center shadow-md">
            <div className="w-1 h-6 bg-gray-500 mx-0.5"></div>
            <div className="w-1 h-6 bg-gray-500 mx-0.5"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
