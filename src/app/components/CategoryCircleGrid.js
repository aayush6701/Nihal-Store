'use client';
import React from 'react';
import Link from 'next/link';

export default function CategoryCircleGrid({ title, categories, shape = "circle" }) {
  const isCircle = shape === "circle";

  // Shape + size classes
  const shapeClass = isCircle ? "rounded-full" : "rounded-lg";

  // Size / aspect classes
  const sizeClass = isCircle
    ? "w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
    : "w-full aspect-[14/16]"; // square gets taller aspect

  // Object fit mode
  const objectClass = isCircle ? "object-cover" : "object-fill";

  // Grid layout
  const gridClass = isCircle
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10";

  return (
    <section className="w-full bg-white px-4 md:px-8 py-10">
      {/* Section Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-10">
        {title}
      </h2>

      {/* Category Grid */}
      <div className={gridClass}>
        {categories.map((cat, index) => (
          <Link
            key={index}
            href={cat.link || '#'}
            className="flex flex-col items-center text-center group"
          >
            {/* Image Wrapper */}
            <div
              className={`${sizeClass} ${shapeClass} overflow-hidden shadow-md transition-transform duration-500 ease-in-out hover:scale-110 focus:scale-110 active:scale-110`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className={`w-full h-full ${objectClass}`}
              />
            </div>

            {/* Text Info */}
            {isCircle ? (
              <span className="mt-4 text-sm md:text-base font-medium text-gray-800 group-hover:text-pink-600 transition-colors">
                {cat.name}
              </span>
            ) : (
              <div className="mt-6">
                <div className="text-base md:text-lg font-semibold text-gray-800">
                  {cat.name}
                </div>
                {cat.products && (
                  <div className="text-sm text-gray-500">
                    {cat.products} products
                  </div>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
