

"use client";
import React from "react";
import Link from "next/link";

export default function ProductGrid({ 
  title, 
  items, 
  bgColor = "bg-white" // default background color
}) {
  return (
    <section className={`w-full ${bgColor} px-4 md:px-8 py-6`}>
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-8">
        {title}
      </h2>

      {/* Grid (max 10 items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.slice(0, 10).map((item, index) => (
          <Link 
            key={index} 
            href={`/products/${item._id}`} // ✅ open product page
            className="flex flex-col rounded-lg overflow-hidden transition-shadow duration-300 cursor-pointer"
          >
            {/* Image with hover */}
            <div className="relative w-full aspect-[1/1] overflow-hidden group">
              {/* Sold Out Label */}
              {item.stock === 0 && (
                <span className="absolute top-2 left-2 bg-black/60 text-white text-sm font-normal px-2 py-1.5 rounded-md z-20">
                  SOLD OUT
                </span>
              )}

              {/* Default Image */}
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-fill transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-110"
              />

              {/* Hover Image */}
              {item.hoverImage && (
                <img
                  src={item.hoverImage}
                  alt={`${item.name} hover`}
                  className="absolute inset-0 w-full h-full object-fill opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                />
              )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-grow items-center text-center">
              <h3 className="text-sm md:text-base font-semibold text-black leading-snug">
                {item.name}
              </h3>

              {/* Price */}
              <div className="mt-2 flex items-center justify-center space-x-2">
                <span className="text-pink-600 font-normal text-base">
                  ₹{item.price}
                </span>
                {item.oldPrice && (
                  <span className="line-through text-gray-400 text-sm">
                    ₹{item.oldPrice}
                  </span>
                )}
               
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
