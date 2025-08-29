"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";



export default function ThemePage() {
    const { slug } = useParams();
    const [theme, setTheme] = useState(null);
    const [products, setProducts] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState("Featured");

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);

    const handleMinChange = (e) => {
  let value = e.target.value.replace(/^0+(?=\d)/, ""); 
  value = value === "" ? 0 : Number(value);
  if (value <= maxPrice) setMinPrice(value);
};

const handleMaxChange = (e) => {
  let value = e.target.value.replace(/^0+(?=\d)/, ""); 
  value = value === "" ? 0 : Number(value);
  if (value >= minPrice) setMaxPrice(value);
};
  const handleApplyFilter = () => {
  let result = [...products];
  if (availabilityFilter) {
    result = result.filter((p) => p.availability === availabilityFilter);
  }
  result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  setFilteredProducts(result);
  setIsFilterApplied(true);
  setFilterOpen(false);
};

const handleClearFilter = () => {
  setAvailabilityFilter(null);
  setMinPrice(0);
  setMaxPrice(10000);
  setFilteredProducts([]);
  setIsFilterApplied(false);
};



const [availabilityFilter, setAvailabilityFilter] = useState(null); // "In Stock" | "Sold Out" | null
const [filteredProducts, setFilteredProducts] = useState([]);
const [isFilterApplied, setIsFilterApplied] = useState(false);

    useEffect(() => {
        if (!slug) return;
        const fetchThemeProducts = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/theme/${slug}`,
                    { cache: "no-store" }
                );
                const data = await res.json();
                setTheme(data.theme);


                const mappedProducts = (data.products || []).map(p => {
  const price = p.price || 0;
  const oldPrice = p.oldPrice || 0;

  // calculate discount % safely
  let discountPercent = 0;
  if (oldPrice > 0) {
    discountPercent = ((oldPrice - price) / oldPrice) * 100;
  }


  return {
    _id: p._id,
    name: p.name,
    image: p.display_image
      ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`
      : "/placeholder.png",
    hoverImage: p.hover_image
      ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}`
      : null,
    price,
    oldPrice,
    stock: p.availability === "In Stock" ? 1 : 0,
    availability: p.availability,     // ✅ keep raw availability
    discountPercent: discountPercent, // ✅ new field
  };
});


                setProducts(mappedProducts);

            } catch (err) {
                console.error("Failed to fetch theme products", err);   // ✅ correct

            }
        };
        fetchThemeProducts();
    }, [slug]);

const handleSort = (option) => {
  setSortOption(option);

  // Decide which list to sort
  let target = isFilterApplied ? [...filteredProducts] : [...products];

  switch (option) {
    case "Price, low to high":
      target.sort((a, b) => a.price - b.price);
      break;
    case "Price, high to low":
      target.sort((a, b) => b.price - a.price);
      break;
    case "Alphabetically, A-Z":
      target.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "Alphabetically, Z-A":
      target.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "Availability":
      target.sort((a, b) => b.stock - a.stock); // In Stock first
      break;
    case "Best selling":
      target.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    default:
      target = isFilterApplied ? [...filteredProducts] : [...products];
  }

  // Put sorted list back in correct state
  if (isFilterApplied) {
    setFilteredProducts(target);
  } else {
    setProducts(target);
  }
};

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />

            {/* match CategoryGrid spacing → full width with px-4 md:px-8 */}
            <main className="flex-grow w-full px-4 md:px-8 py-10">
                {/* Breadcrumb */}
                <div className="flex items-center justify-center space-x-2 text-base sm:text-lg text-gray-500 font-medium mb-6">
                    <span className="text-black hover:underline cursor-pointer">Home</span>
                    <span className="text-gray-400">&gt;</span>
                    <span className="text-black hover:underline cursor-pointer">Themes</span>
                    <span className="text-gray-400">&gt;</span>
                    <span className="capitalize text-gray-400 ">
                        {theme?.name || "Loading..."}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-6 text-[#043324] capitalize text-center">
                    {theme?.name || "Loading..."}
                </h1>

                {/* Filter + Sort + Product count */}
                <div className="w-full flex flex-col sm:flex-row items-center mb-10 gap-4">
                    {/* Left - Filter button */}
                    <div className="w-full sm:w-1/3 flex justify-start">
                        <button
                            onClick={() => setFilterOpen(true)}
                            className="filter-btn relative overflow-hidden border border-red-600 text-[#043324] px-6 py-3 rounded font-bold flex items-center gap-2" >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-colors duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 4h18M4 10h16M6 16h12M8 20h8"
                                />
                            </svg>
                            FILTER AND SORT
                            <style jsx>{`
    .filter-btn {
      position: relative;
      z-index: 0;
      transition: color 0.3s ease, border-color 0.3s ease;
    }

    .filter-btn::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #20b2aa; /* light green fill */
      transform: scaleX(0);      
      transform-origin: left;
      transition: transform 0.4s ease;
      z-index: -1;
    }

    .filter-btn:hover::before {
      transform: scaleX(1);      /* expand fill from left */
      transform-origin: left;
    }

    .filter-btn:hover {
      color: white;              
      border-color: #20b2aa;     /* border matches fill color */
    }

    .filter-btn:hover svg {
      stroke: white;             
    }
  `}</style>
                        </button>
                    </div>

                    {/* Middle - Product count */}
                    <div className="w-full sm:w-1/3 flex justify-center">
                        <p className="text-lg font-semibold text-gray-700">
                            {products.length} products
                        </p>
                    </div>

                    {/* Right - Sort button */}
                    <div className="w-full mt-[2px] sm:w-1/3 flex justify-end">
                        <select
  value={sortOption}
  onChange={(e) => handleSort(e.target.value)}
  className="sort-btn w-full sm:w-auto px-6 py-3 rounded font-medium text-gray-800"
>
  <option>Best selling</option>
  <option>Alphabetically, A-Z</option>
  <option>Alphabetically, Z-A</option>
  <option>Price, low to high</option>
  <option>Price, high to low</option>
  <option>Availability</option>
</select>



                        {/* inpage CSS */}
                        <style jsx>{`
    .sort-btn {
      border: 1px solid #d1d5db;   /* gray border */
      background-color: #fff;
      transition: all 0.3s ease-in-out; /* smooth transition for border + color */
      cursor: pointer;
    }

    .sort-btn:hover {
      border-width: 2px;          /* smoother (1px → 2px) */
      border-color: #9ca3af;      /* gray-400 */
    }

    .sort-btn:focus {
      outline: none;
      border-width: 2px;
      border-color: #2563eb;      /* blue-600 */
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
    }

    /* Dropdown menu */
    .sort-btn option {
      background-color: #fff;
      color: #111827;             /* black text */
      padding: 8px 12px;
      font-size: 15px;
    }

    .sort-btn option:checked,
    .sort-btn option:hover {
      background-color: #2563eb;  /* blue highlight */
      color: #fff;
    }
  `}</style>
                    </div>

                </div>

                {/* Products Grid (styled like CategoryGrid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {(isFilterApplied ? filteredProducts : products).length > 0 ? (
  (isFilterApplied ? filteredProducts : products).map((product) => (

                        <Link key={product._id} href={`/products/${product._id}`}

                            className="flex flex-col bg-white rounded-lg overflow-hidden transition-shadow duration-300"
                        >
                            {/* Image with hover effect */}
                            <div className="relative w-full aspect-[1/1] overflow-hidden group">
                                {product.stock === 0 && (
                                    <span className="absolute top-2 left-2 bg-black/60 text-white text-sm md:text-sm font-normal px-2 py-1.5 rounded-md z-20">
                                        SOLD OUT
                                    </span>
                                )}

                                {/* Default Image */}
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-fill transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-110"
                                />
                                {/* Hover Image */}
                                {product.hoverImage && (
                                    <img
                                        src={product.hoverImage}
                                        alt={`${product.name} hover`}
                                        className="absolute inset-0 w-full h-full object-fill opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                                    />
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 flex flex-col flex-grow items-center text-center">
                                <h3 className="text-sm md:text-base font-semibold text-black leading-snug">
                                    {product.name}
                                </h3>

                               

                                {/* Price */}
                                <div className="mt-2 flex items-center justify-center space-x-2">
                                    <span className="text-pink-600 font-normal text-base">
                                        ₹{product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="line-through text-gray-400 text-sm">
                                            ₹{product.oldPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )) ) : (
    <p className="text-center text-gray-500 col-span-full">
      No products found.
    </p>
  )}
                </div>

            </main>

            <Footer />


            {filterOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40" // dim overlay, like navbar
                    onClick={() => setFilterOpen(false)}
                ></div>
            )}



            {/* Filter Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-500 ease-in-out ${filterOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="font-bold text-lg text-[#043324]">
                        Filter: <span className="text-gray-600">{products.length} products</span>
                    </h2>
                    <button onClick={() => setFilterOpen(false)} className="text-gray-600 text-2xl">
                        ✕
                    </button>
                </div>

                {/* Filter Options */}
                <div className="p-6 space-y-8 text-black">
                    {/* Availability */}
                    <div>
                        <h3 className="font-bold text-sm mb-2">AVAILABILITY</h3>
                        <div className="flex flex-col space-y-2">
                            <label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={availabilityFilter === "In Stock"}
    onChange={(e) =>
      setAvailabilityFilter(e.target.checked ? "In Stock" : null)
    }
  />
  In stock
</label>
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={availabilityFilter === "Sold Out"}
    onChange={(e) =>
      setAvailabilityFilter(e.target.checked ? "Sold Out" : null)
    }
  />
  Out of stock
</label>

                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <h3 className="font-bold text-sm mb-4">PRICE</h3>

                        {/* Slider wrapper */}
                        <div className="relative w-full mb-6 h-4">
                            {/* Background line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 rounded -translate-y-1/2"></div>

                            {/* Active track */}
                            <div
                                className="absolute h-1 bg-black rounded -translate-y-1/2 top-1/2"
                                style={{
                                    left: `${(minPrice / 10000) * 100}%`,
                                    right: `${100 - (maxPrice / 10000) * 100}%`,
                                }}
                            />

                            {/* Min slider */}
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                value={minPrice}
                                onChange={handleMinChange}
                                className="range-slider absolute w-full top-0 h-4 bg-transparent pointer-events-auto"
                            />

                            {/* Max slider */}
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                value={maxPrice}
                                onChange={handleMaxChange}
                                className="range-slider absolute w-full top-0 h-4 bg-transparent pointer-events-auto"
                            />
                        </div>

                        {/* Inputs below */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border px-2 py-1 rounded">
                                <span className="mr-1">₹</span>
                                <input
                                    type="number"
                                    value={minPrice}
                                    min="0"
                                    max={maxPrice}
                                    onChange={handleMinChange}
                                    className="w-20 outline-none"
                                />
                            </div>
                            <span className="text-gray-700">To</span>
                            <div className="flex items-center border px-2 py-1 rounded">
                                <span className="mr-1">₹</span>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    min={minPrice}
                                    max="10000"
                                    onChange={handleMaxChange}
                                    className="w-20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clear & Apply */}
                    <div className="pt-4">
                        <button onClick={handleClearFilter} className="text-sm font-semibold underline">
  CLEAR ALL
</button>
<button onClick={handleApplyFilter} className="btn-fill w-full text-center mt-4">
  APPLY
</button>

                    </div>
                </div>

                {/* In-page CSS */}
                <style jsx>{`
    .range-slider {
      -webkit-appearance: none;
      appearance: none;
      background: none;
    }

    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: black;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid black;
      position: relative;
      z-index: 10;
    }

    .range-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: black;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid black;
      position: relative;
      z-index: 10;
    }
  `}</style>
            </div>

        </div>

    );
}


