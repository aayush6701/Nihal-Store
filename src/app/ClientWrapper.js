"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Spinner from "./components/Spinner"; // <-- use local spinner

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
