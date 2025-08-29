"use client";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/app/components/ProductGrid";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [selectedImage, setSelectedImage] = useState(null);
  // Example product data for grid
const [relatedProducts, setRelatedProducts] = useState([]);
const [dealProducts, setDealProducts] = useState([]);

  
//  useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/public/product/${slug}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("Failed to fetch product");
//         const data = await res.json();
//         setProduct(data);
//         setSelectedImage(
//           data.display_image
//             ? `${process.env.NEXT_PUBLIC_API_URL}${data.display_image}`
//             : null
//         );
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [slug]);

useEffect(() => {
  const fetchProduct = async () => {
    try {
      // 1️⃣ Fetch current product
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/product/${slug}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      setProduct(data);

      // set main image
      setSelectedImage(
        data.display_image
          ? `${process.env.NEXT_PUBLIC_API_URL}${data.display_image}`
          : null
      );

      // 2️⃣ Fetch related products from same category
      if (data.category_name) {
        try {
          const catRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/categories`
          );
          const catData = await catRes.json();

          const category = catData.categories.find(
            (c) => c.name === data.category_name
          );

          if (category) {
            const relatedRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/public/category/${category.id}`
            );
            const relatedData = await relatedRes.json();

            setRelatedProducts(
              relatedData.products
                .filter((p) => p._id !== data._id) // exclude current product
                .map((p) => ({
                  _id: p._id,
                  name: p.name,
                  image: p.display_image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`
                    : "/placeholder.png",
                  hoverImage: p.hover_image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}`
                    : null,
                  price: p.price,
                  oldPrice: p.oldPrice,
                  availability: p.availability,
                  stock: p.availability === "In Stock" ? 10 : 0,
                }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch related products", err);
        }
      }

      // 3️⃣ Fetch deal products from same theme
      if (data.theme_name) {
        try {
          const themeRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/public/themes`
          );
          const themeData = await themeRes.json();

          const theme = themeData.themes.find(
            (t) => t.name === data.theme_name
          );

          if (theme) {
            const themeProductsRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/public/theme/${theme.id}`
            );
            const themeProductsData = await themeProductsRes.json();

            setDealProducts(
              themeProductsData.products
                .filter((p) => p._id !== data._id) // exclude current product
                .map((p) => ({
                  _id: p._id,
                  name: p.name,
                  image: p.display_image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`
                    : "/placeholder.png",
                  hoverImage: p.hover_image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}`
                    : null,
                  price: p.price,
                  oldPrice: p.oldPrice,
                  availability: p.availability,
                  stock: p.availability === "In Stock" ? 10 : 0,
                }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch theme products", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [slug]);


  // if (loading) {
  //   return (
  //     <>
  //       <Navbar />
  //       <main className="min-h-screen flex items-center justify-center">
  //         <p>Loading...</p>
  //       </main>
  //       <Footer />
  //     </>
  //   );
  // }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Product not found</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen px-4 md:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex justify-center mb-6">
          <nav className="text-sm text-gray-600 flex space-x-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">
              {product.category_name}
            </span>
            <span>›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Main Product Image */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-center items-center border rounded-lg">
              <img
                src={selectedImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-auto max-h-[600px] object-contain"
              />
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="flex flex-col space-y-4">
            {/* Title */}
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "#043324" }}
            >
              {product.name}
            </h1>

            {/* Reviews
            <p className="text-yellow-500">
              ★★★★★{" "}
              <span className="text-gray-600">{product.reviews} reviews</span>
            </p> */}

            {/* Price Section */}
            <div className="flex items-center space-x-3">
  {/* selling price */}
  <p className="text-pink-600 text-2xl font-bold">₹{product.price}</p>

  {/* old price */}
  {product.oldPrice && (
    <p className="line-through text-gray-500">₹{product.oldPrice}</p>
  )}

  {/* discount calculated here only */}
  {product.oldPrice > product.price && (
    <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
      {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
    </span>
  )}
</div>


            {/* Quantity Selector */}
            <div>
  <p className="font-semibold mb-1 text-black">Quantity</p>
  <div className="flex items-center border rounded w-28">
    <button
      className="px-3 py-1 text-lg text-black"
      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
    >
      -
    </button>
    <input
      type="text"
      value={quantity}
      readOnly
      className="w-10 text-center outline-none text-black"
    />
    <button
      className="px-3 py-1 text-lg text-black"
      onClick={() => setQuantity((q) => q + 1)}
    >
      +
    </button>
  </div>
</div>


         {/* Add to Cart Button */}
<button
  onClick={async () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      const event = new CustomEvent("trigger-google-login");
      window.dispatchEvent(event);
      return;
    }

    const user = JSON.parse(savedUser);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          product_id: product._id,
          quantity: quantity,   // ✅ send selected quantity
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.message === "Already in cart") {
          alert("⚠️ This product is already in your cart!");
        } else if (data.message === "Added to cart") {
          alert("✅ Product added to your cart successfully!");
        } else {
          alert(data.message || "✅ Success");
        }
      } else {
        alert(`❌ Failed: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert(`❌ Request error: ${err.message}`);
    }
  }}
  className="bg-white text-green-600 border-[2px] border-green-600 py-3 w-full mt-3 rounded mb-3 hover:bg-gray-100 "
>
  Add to Cart
</button>

          {/* Status Button */}
<div className="w-full mt-3">
  {product.status === "Sold out" ? (
    <button className="btn-fill2 bg-pink-300 text-white py-2 w-full rounded " disabled>
      Sold Out
    </button>
  ) : (
    <button
  className="btn-fill bg-pink-500 text-white py-2 w-full rounded"
  onClick={() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      const event = new CustomEvent("trigger-google-login");
      window.dispatchEvent(event);
      return;
    }

    // ✅ trigger custom event to open chat with product info
    const productData = { productId: product._id, productName: product.name };
    const event = new CustomEvent("open-chat-with-product", { detail: productData });
    window.dispatchEvent(event);
  }}
>
  Message Order
</button>

  )}
</div>


{/* Thumbnail Slider */}
<div className="relative flex items-center mt-4 w-full">
  {/* Previous Button */}
  <button
    onClick={() => {
      const container = document.getElementById("thumb-slider");
      if (container) container.scrollBy({ left: -140, behavior: "smooth" });
    }}
    className="absolute left-0 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
  >
    <span className="text-black text-xl">‹</span>
  </button>

  {/* Thumbnails */}
  <div
    id="thumb-slider"
    className="flex gap-3 overflow-hidden scroll-smooth w-full mx-12"
  >
    {[product.display_image, product.hover_image, ...(product.additional_images || [])]
     .filter(Boolean)
     .map((img, index) => (
      <button
        key={index}
        onClick={() => setSelectedImage(`${process.env.NEXT_PUBLIC_API_URL}${img}`)}
        className={`flex-shrink-0 border-2 rounded-md p-1 transition ${
          selectedImage === img
            ? "border-pink-500"
            : "border-gray-300 hover:border-gray-500"
        }`}
      >
        <img
           src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
          alt={`${product.name} ${index + 1}`}
          width={120}
          height={120}
          className="w-28 h-28 object-contain"
        />
      </button>
    ))}
  </div>

  {/* Next Button */}
  <button
    onClick={() => {
      const container = document.getElementById("thumb-slider");
      if (container) container.scrollBy({ left: 140, behavior: "smooth" });
    }}
    className="absolute right-0 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
  >
    <span className="text-black text-xl">›</span>
  </button>
</div>


          </div>
          
        </div>
        {/* Product Description Section */}
<section className="mt-12 px-4 md:px-8">
    {/* Tabs (only Product Description active) */}
<div className="border-b border-gray-200 mb-6">
  <nav className="flex justify-center">
    <button
      className="text-gray-900 font-bold border-b-2 border-black pb-2 focus:outline-none"
    >
      Product Description
    </button>
  </nav>
</div>


  {/* Description Content from backend */}
 <div className="prose max-w-none text-gray-800">
   {product.description ? (
     <div dangerouslySetInnerHTML={{ __html: product.description }} />
   ) : (
     <p>No description available.</p>
   )}
 </div>
</section>

      </main>
      {/* You May Also Like */}
<ProductGrid
  title="You May Also Like"
  items={relatedProducts}        // you can replace with related products later
  bgColor="bg-[#faebf6]"

/>

{/* Deal of The Day 🤩 */}
<ProductGrid
  title="Deal of The Day 🤩"
  items={dealProducts}        // replace with deal products later
  bgColor="bg-[#dceee9]"
  
/>

      <Footer />
    </>
  );
}

