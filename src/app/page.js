"use client";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import HeroSection from "./components/herosection";
import CategoryGrid from './components/CategoryGrid';
import CategoryCircleGrid from './components/CategoryCircleGrid';
import ImageComparison from './components/ImageComparison';
import Footer from "./components/Footer";
import Spinner from "./components/Spinner";

export default function Home() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/homepage`,
          { cache: "no-store" }
        );
        const data = await res.json();
        // ✅ Limit to max 4 sections
        setSections((data.sections || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch homepage", err);
      }
    };

    const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/public/categories`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchThemes = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/themes`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setThemes(data.themes || []);
  } catch (err) {
    console.error("Failed to fetch themes", err);
  }
};

    fetchHomepage();
    fetchCategories(); 
    fetchThemes();
  }, []);

  return (
    <>
      <Navbar />
      <HeroSection />

      {/* ✅ First Grid below HeroSection */}
      {sections[0] && (
        <CategoryGrid
          key={sections[0].s_no}
          title={sections[0].category_name}
          viewAllLink={`/category/${sections[0].category_id}`}          
          items={sections[0].products.slice(0, 12).map((p) => ({
            id: p._id,
            image: p.display_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}` : "/placeholder.png",
            hoverImage: p.hover_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}` : null,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            stock: p.availability === "In Stock" ? 1 : 0,
          }))}
          setLoading={setLoading} 
        />
      )}

      {/* First CircleGrid */}
      <CategoryCircleGrid
  title="Shop By Category"
  categories={categories.map((cat) => ({
    image: cat.image ? `${process.env.NEXT_PUBLIC_API_URL}${cat.image}` : "/placeholder.png",
    name: cat.name,
    link: cat.link,
    products: cat.products,
  }))}
  setLoading={setLoading}
/>


      {/* ✅ Second & Third Grids below first CircleGrid */}
      {sections[1] && (
        <CategoryGrid
          key={sections[1].s_no}
          title={sections[1].category_name}
          viewAllLink={`/category/${sections[1].category_id}`}          
          buttonStyle="underline"
          items={sections[1].products.slice(0, 12).map((p) => ({
            id: p._id, 
            image: p.display_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}` : "/placeholder.png",
            hoverImage: p.hover_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}` : null,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            stock: p.availability === "In Stock" ? 1 : 0,
          }))}
          setLoading={setLoading} 
        />
      )}
      {sections[2] && (
        <CategoryGrid
          key={sections[2].s_no}
          title={sections[2].category_name}
          viewAllLink={`/category/${sections[2].category_id}`}         
           items={sections[2].products.slice(0, 12).map((p) => ({
            id: p._id, 
            image: p.display_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}` : "/placeholder.png",
            hoverImage: p.hover_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}` : null,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            stock: p.availability === "In Stock" ? 1 : 0,
          }))}
          setLoading={setLoading} 
        />
      )}

      {/* Second CircleGrid */}
      {/* Second CircleGrid → now uses themes */}
<CategoryCircleGrid
  title="Shop By Theme"
  categories={themes.map((theme) => ({
    image: theme.image ? `${process.env.NEXT_PUBLIC_API_URL}${theme.image}` : "/placeholder.png",
    name: theme.name,
    link: `/themes/${theme.id}`,   // 👈 force plural path
    products: theme.products,
  }))}
  shape="square"
  setLoading={setLoading}
/>



      {/* ✅ Fourth Grid below second CircleGrid */}
      {sections[3] && (
        <CategoryGrid
          key={sections[3].s_no}
          title={sections[3].category_name}
          viewAllLink={`/category/${sections[3].category_id}`}  
          buttonStyle="underline"
          items={sections[3].products.slice(0, 12).map((p) => ({
            id: p._id, 
            image: p.display_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.display_image}` : "/placeholder.png",
            hoverImage: p.hover_image ? `${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}` : null,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            stock: p.availability === "In Stock" ? 1 : 0,
          }))}
          setLoading={setLoading} 
        />
      )}

      <ImageComparison
        title="Personalised Gifting..."
        beforeImage="/after.png"
        afterImage="/before.png"
      />

      <Footer />
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <Spinner />
        </div>
      )}
      
    </>
  );
}
