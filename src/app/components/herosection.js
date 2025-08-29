'use client';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/hero.webp';
    img.onload = () => {
      setAspectRatio(img.height / img.width);
      // Delay state change to ensure animation starts after first paint
      setTimeout(() => setLoaded(true), 50);
    };
  }, []);

  if (!aspectRatio) {
    return <div className="w-full bg-gray-200 h-64" />; // placeholder
  }

  return (
    <section
      className=" w-full overflow-hidden flex justify-center"
      style={{
        height: `calc(${aspectRatio} * 100vw)`
      }}
    >
      <img
        src="/hero.webp"
        alt="Hero"
        className={`transition-all duration-[4000ms] ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        } w-full h-auto`}
      />
    </section>
  );
}
