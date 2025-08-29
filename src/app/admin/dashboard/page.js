"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManageProducts from "./components/ManageProducts"; // import your component
import ManageCategory from "./components/ManageCategory";
import ManageTheme from "./components/ManageTheme";
import ManageUser from "./components/ManageUser";
import ManageHomepage from "./components/ManageHomepage";
import ManageChat from "./components/ManageChat";

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("dashboard");
const [stats, setStats] = useState({
  total_users: 0,
  total_products: 0,
  total_categories: 0,
  total_themes: 0,
  in_stock: 0,
  sold_out: 0
});

useEffect(() => {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
  if (!isLoggedIn) {
    router.push("/admin");
    return;
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        headers: { token }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  fetchStats();
}, [router]);

  useEffect(() => {
    // ✅ Protect dashboard: only accessible if logged in
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      router.push("/admin"); // redirect to login if not logged in
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#158278] text-white flex flex-col p-6 rounded-r-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>
        <nav className="space-y-3">
          <button
            onClick={() => setActivePage("dashboard")}
            className={`block w-full text-left px-4 py-3 rounded-xl transition ${
              activePage === "dashboard"
                ? "bg-[#11645c]"
                : "hover:bg-[#11645c]"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActivePage("products")}
            className={`block w-full text-left px-4 py-3 rounded-xl transition ${
              activePage === "products"
                ? "bg-[#11645c]"
                : "hover:bg-[#11645c]"
            }`}
          >
            Manage Products
          </button>
          <button
            onClick={() => setActivePage("category")}
            className={`block w-full text-left px-4 py-3 rounded-xl transition ${
              activePage === "category"
                ? "bg-[#11645c]"
                : "hover:bg-[#11645c]"
            }`}
          >
            Manage Category
          </button>
          <button
            onClick={() => setActivePage("theme")}
            className={`block w-full text-left px-4 py-3 rounded-xl transition ${
              activePage === "theme"
                ? "bg-[#11645c]"
                : "hover:bg-[#11645c]"
            }`}
          >
            Manage Theme
          </button>
          <button
            onClick={() => setActivePage("users")}
            className={`block w-full text-left px-4 py-3 rounded-xl transition ${
              activePage === "users"
                ? "bg-[#11645c]"
                : "hover:bg-[#11645c]"
            }`}
          >
            Manage Users
          </button>
          <button
  onClick={() => setActivePage("chat")}
  className={`block w-full text-left px-4 py-3 rounded-xl transition ${
    activePage === "chat" ? "bg-[#11645c]" : "hover:bg-[#11645c]"
  }`}
>
  Manage Chat
</button>


          <button
            onClick={() => {
              localStorage.removeItem("isAdminLoggedIn");
              localStorage.removeItem("adminToken");
              router.push("/admin");
            }}
            className="block w-full text-left px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition mt-8"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {activePage === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Welcome to Admin Dashboard 🎉
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
    <p className="text-3xl font-bold text-black mt-2">{stats.total_users}</p>
  </div>
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Products</h3>
    <p className="text-3xl font-bold text-black mt-2">{stats.total_products}</p>
    <p className="text-sm text-gray-500 mt-1">
      {stats.in_stock} In Stock / {stats.sold_out} Sold Out
    </p>
  </div>
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
    <p className="text-3xl font-bold text-black mt-2">{stats.total_categories}</p>
  </div>
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Themes</h3>
    <p className="text-3xl font-bold text-black mt-2">{stats.total_themes}</p>
  </div>
</div>

 <ManageHomepage />
          </>
        )}

        {activePage === "products" && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Manage Products
            </h1>
            <ManageProducts />
          </>
        )}

        {activePage === "category" && (
            <>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Category 📂
          </h1>
          <ManageCategory />
          </>
        )}

        {activePage === "theme" && (
            <>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Theme 🎨
          </h1>
          <ManageTheme />
          </>
        )}

        {activePage === "users" && (
            <>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Users 👥
          </h1>
          <ManageUser />
          </>
        )}
        {activePage === "chat" && (
  <>
    <h1 className="text-3xl font-bold text-gray-800 mb-8">
      Manage Chat 💬
    </h1>
    <ManageChat />
  </>
)}

      </div>
    </div>
  );
}
