'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiTrash2,

} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import Spinner from "./Spinner";


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);
const pathname = typeof window !== "undefined" ? window.location.pathname : "";

const [unseenAdminCount, setUnseenAdminCount] = useState(0);
const [categories, setCategories] = useState([]);
const [themes, setThemes] = useState([]);
// add these below your other useState
const [mobileCatOpen, setMobileCatOpen] = useState(false);
const [mobileThemeOpen, setMobileThemeOpen] = useState(false);
const [desktopCatOpen, setDesktopCatOpen] = useState(false);
const [desktopThemeOpen, setDesktopThemeOpen] = useState(false);
const [loading, setLoading] = useState(false);


  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });

        const { name, email, picture } = res.data;  // ✅ also take profile pic




        // 🔹 Step 1: Check if user already exists in backend
        const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/register-google-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, picture })
        });

        const data = await checkRes.json();

        if (checkRes.ok) {
          if (data.status === "EXISTS") {
            // ✅ Existing user → save in localStorage and show avatar
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          } else if (data.status === "NEW_USER") {
            // ✅ New user → ask for mobile, keep pic too
            setTempUser({ name, email, picture });
            setShowMobileModal(true);
          }

        } else {
          console.error("Signup/Login failed", data);
          alert(data.detail || "Signup/Login failed");
        }

      } catch (err) {
        console.error("Google login failed", err);
      }
    },
    onError: () => console.error("Google login error"),
  });

  const [showMobileModal, setShowMobileModal] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [mobile, setMobile] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  // 🔹 Listen for Add to Cart login request
  useEffect(() => {
    const handleLogin = () => login();
    window.addEventListener("trigger-google-login", handleLogin);
    return () => window.removeEventListener("trigger-google-login", handleLogin);
  }, [login]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);


  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => setResults(data.products || []))
          .catch(() => setResults([]));
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

useEffect(() => {
  if (!user || !profileOpen) return;   // ✅ only when sidebar is open

  const interval = setInterval(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/get-messages?email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
        setUnseenAdminCount(data.unseen_admin_count || 0);
      })
      .catch(() => {
        setMessages([]);
        setUnseenAdminCount(0);
      });
  }, 3000);

  return () => clearInterval(interval);  // ✅ stop when sidebar closes
}, [user, profileOpen]);  // ✅ depend on profileOpen

useEffect(() => {
  const handleOpenChat = (e) => {
    const { productId, productName } = e.detail;
    setProfileOpen(true);

    // 👇 prefill input with product name
    setNewMessage(`Regarding product: ${productName}`);

    // 👇 store productId in a hidden field (we send it but user doesn’t see)
    setPendingProductId(productId);
  };

  window.addEventListener("open-chat-with-product", handleOpenChat);
  return () => window.removeEventListener("open-chat-with-product", handleOpenChat);
}, []);

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/categories`)
    .then(res => res.json())
    .then(data => setCategories(data.categories || []))
    .catch(() => setCategories([]));

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/themes`)
    .then(res => res.json())
    .then(data => setThemes(data.themes || []))
    .catch(() => setThemes([]));
}, []);

useEffect(() => {
  const handleComplete = () => setLoading(false);

  router.events?.on("routeChangeComplete", handleComplete);
  router.events?.on("routeChangeError", handleComplete);

  return () => {
    router.events?.off("routeChangeComplete", handleComplete);
    router.events?.off("routeChangeError", handleComplete);
  };
}, [router]);


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  email: user.email,
  text: newMessage,
  product_id: pendingProductId || null,  // ✅ include hidden product ID
}),

      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.data]);
        setNewMessage("");
      } else {
        alert(data.detail || "Failed to send message");
      }
    } catch (err) {
      console.error("Send failed", err);
    } finally {
    // ✅ always reset product ID (success or fail)
    setPendingProductId(null);
  }
  };


  return (
    <nav className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 md:px-8 flex items-center justify-between h-[12vh] min-h-[50px] relative">

        {/* Hamburger (mobile only) */}
        <button
          onClick={toggleMenu}
          className="text-[#158278] text-xl sm:text-2xl md:hidden"
        >
          <FiMenu />
        </button>

        {/* Logo - auto scale */}
        <div className="flex-shrink-0 ml-1 sm:ml-3 md:ml-0">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-20 w-28"
          />
        </div>

        {/* Menu (desktop, centered) */}
        {/* <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 lg:space-x-8 text-[#158278] text-base lg:text-lg">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Contact</a>
        </div> */}
<div className="hidden md:flex mt-2 absolute left-1/2 transform -translate-x-1/2 space-x-6 lg:space-x-8 text-[#158278] text-base lg:text-lg">
 <Link
  href="/"
  onClick={(e) => {
    if (pathname !== "/") {
      setLoading(true); // ✅ show loader
    } else {
      e.preventDefault(); // already on home → do nothing
    }
  }}
>
  Home
</Link>


{/* Category dropdown */}
<div className="relative">
  <button
    onClick={() => {
      setDesktopCatOpen(!desktopCatOpen);
      setDesktopThemeOpen(false); // close theme when opening category
    }}
    className="hover:text-[#10655d] px-2  rounded-md transition-colors duration-200"
  >
    Categories
  </button>
  {desktopCatOpen && (
    <div className="absolute left-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-50 border border-gray-100 animate-fadeIn">
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={cat.link}
          className="block px-4 py-2 text-gray-700 hover:bg-[#f0fdfa] hover:text-[#10655d] rounded-md transition"
          onClick={() => {
            setDesktopCatOpen(false);
            setLoading(true);
          }}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )}
</div>

  {/* Themes dropdown */}
<div className="relative">
  <button
    onClick={() => {
      setDesktopThemeOpen(!desktopThemeOpen);
      setDesktopCatOpen(false); // close category when opening theme
    }}
    className="hover:text-[#10655d] px-2  rounded-md transition-colors duration-200"
  >
    Themes
  </button>
  {desktopThemeOpen && (
    <div className="absolute left-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-50 border border-gray-100 animate-fadeIn">
      {themes.map(th => (
        <Link
          key={th.id}
          href={`/themes/${th.id}`}   // ✅ ensure same format as Home.js
          className="block px-4 py-2 text-gray-700 hover:bg-[#f0fdfa] hover:text-[#10655d] rounded-md transition"
          onClick={() => {
            setDesktopThemeOpen(false);
            setLoading(true);
          }}
        >
          {th.name}
        </Link>
      ))}
    </div>
  )}
</div>

<button
  onClick={() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="hover:text-[#10655d]"
>
  About
</button>

<button
  onClick={() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="hover:text-[#10655d]"
>
  Contact
</button>

</div>

        {/* Icons */}
        <div className="flex space-x-3 sm:space-x-4 md:space-x-5 text-[#158278]">
          <FiSearch
            className="cursor-pointer text-lg sm:text-xl md:text-2xl lg:text-3xl"
            onClick={() => setSearchOpen(true)}
          />

          {user ? (
  <div className="relative">
    <img
      src={user.picture || "/default-avatar.png"}
      alt={user.name || "User"}
      className="w-9 h-9 md:w-10 md:h-10 rounded-full cursor-pointer object-cover border-2 border-[#158278]"
      onClick={async () => {
  setProfileOpen(true);

  if (user) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/get-messages?email=${user.email}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setUnseenAdminCount(0);  // ✅ clear immediately on open
  }
}}

    />
    {unseenAdminCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
        {unseenAdminCount}
      </span>
    )}
  </div>
) : (
  <FiUser
    className="cursor-pointer text-lg sm:text-xl md:text-2xl lg:text-3xl"
    onClick={() => login()}
  />
)}




          <FiShoppingCart
            className="cursor-pointer text-lg sm:text-xl md:text-2xl lg:text-3xl"
            onClick={async () => {
              if (!user) {
                const event = new CustomEvent("trigger-google-login");
                window.dispatchEvent(event);
                alert("⚠️ Please login to view your cart.");
                return;
              }
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/public/get-cart?email=${user.email}`
                );
                const data = await res.json();
                setCartItems(data.cart);
                setSubtotal(data.subtotal);
                setCartOpen(true);
              } catch (err) {
                console.error("Failed to load cart", err);
                alert("❌ Failed to load cart.");
              }
            }}
          />
        </div>

      </div>

      {/* Mobile Menu (Slide from left) */}
      <div
        className={`fixed top-0 left-0 h-full w-56 sm:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-16 sm:h-16 w-20"
          />
          <button
            onClick={toggleMenu}
            className="text-[#158278] text-xl sm:text-2xl"
          >
            <FiX />
          </button>
        </div>
        <div className="flex flex-col px-6 py-4 space-y-4 text-[#158278] font-medium text-sm sm:text-base">
          <Link
  href="/"
  onClick={(e) => {
    if (pathname !== "/") {
      setLoading(true); // ✅ show loader
    } else {
      e.preventDefault(); // already on home → do nothing
    }
  }}
>
  Home
</Link>


{/* Categories */}
<div>
  <button
    onClick={() => {
      setMobileCatOpen(!mobileCatOpen);
      setMobileThemeOpen(false); // close theme when category opens
    }}
    className="flex items-center justify-between w-full cursor-pointer  rounded-md hover:bg-gray-50 transition"
  >
    Categories <span>{mobileCatOpen ? "▼" : "▶"}</span>
  </button>
  {mobileCatOpen && (
    <div className="ml-4 flex flex-col mt-1 space-y-1">
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={cat.link}
          onClick={() => {
            toggleMenu();
            setMobileCatOpen(false);
            setLoading(true);
          }}
          className="px-3 py-1 border-b rounded-md hover:bg-[#f0fdfa] hover:text-[#10655d] transition"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )}
</div>

{/* Themes */}
<div>
  <button
    onClick={() => {
      setMobileThemeOpen(!mobileThemeOpen);
      setMobileCatOpen(false); // close category when theme opens
    }}
    className="flex items-center justify-between w-full cursor-pointer rounded-md hover:bg-gray-50 transition"
  >
    Themes <span>{mobileThemeOpen ? "▼" : "▶"}</span>
  </button>
  {mobileThemeOpen && (
    <div className="ml-4 flex flex-col mt-1 space-y-1">
      {themes.map(th => (
        <Link
          key={th.id}
          href={`/themes/${th.id}`}   // ✅ ensure consistent path
          onClick={() => {
            toggleMenu();
            setMobileThemeOpen(false);
            setLoading(true);
          }}
          className="px-3 py-1 border-b rounded-md hover:bg-[#f0fdfa] hover:text-[#10655d] transition"
        >
          {th.name}
        </Link>
      ))}
    </div>
  )}
</div>

<button
  onClick={() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="flex items-center justify-between w-full cursor-pointer  rounded-md hover:bg-gray-50 transition"
>
  About
</button>

<button
  onClick={() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="flex items-center justify-between w-full cursor-pointer  rounded-md hover:bg-gray-50 transition"
>
  Contact
</button>


        </div>
      </div>

      {/* Overlay for mobile menu */}
      {(isOpen || searchOpen || cartOpen || profileOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchOpen(false);
            setCartOpen(false);
            setProfileOpen(false);
          }}
        ></div>
      )}



      {/* Search Sidebar (Slide from right) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${searchOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-bold text-lg text-[#043324]">Search</h2>
          <button
            onClick={() => setSearchOpen(false)}
            className="text-[#158278] text-xl sm:text-2xl"
          >
            <FiX />
          </button>
        </div>
        <div className="p-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded px-3 py-2 
               placeholder:text-gray-300
               focus:outline-none focus:ring-2 focus:ring-[#158278] 
               transition-all duration-300 ease-in-out text-black"
          />

          <div className="mt-4 max-h-[80vh] overflow-y-auto space-y-4">
            {results.length > 0 ? (
              results.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p._id}`}
                  onClick={() => setSearchOpen(false)}  // ✅ variable product page
                  className="flex items-center space-x-4 border-b pb-3 hover:bg-gray-50 transition rounded-lg p-2"
                >
                  {/* Product image */}
                  {p.image && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${p.image}`}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                  )}

                  {/* Product info */}
                  <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-black line-clamp-2">
                      {p.name}
                    </h3>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-pink-600 font-normal text-lg">
                        ₹{p.price}
                      </span>
                      {p.oldPrice && (
                        <span className="line-through text-gray-400 text-sm">
                          ₹{p.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : query.length > 0 ? (
              <p className="text-sm text-gray-500">No results found</p>
            ) : null}
          </div>

        </div>

      </div>

      {/* Mobile Number Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6 relative">
            <h2 className="text-xl font-bold text-[#158278] mb-3">Complete Signup</h2>
            <p className="text-gray-700 mb-4">Enter your mobile number to finish signup.</p>

            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#158278]"
            />

            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => {
                  setShowMobileModal(false);
                  setTempUser(null);
                  setMobile("");
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  // 🔹 Validate mobile
                  if (!/^\d{10}$/.test(mobile)) {
                    alert("Please enter a valid 10-digit mobile number");
                    return;
                  }

                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/register-google-user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...tempUser, mobile }),
                  });

                  const data = await response.json();
                  if (response.ok) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                    setShowMobileModal(false);
                    setTempUser(null);
                    setMobile("");

                  } else {
                    alert(data.detail || "Signup failed");
                  }
                }}
                className="px-4 py-2 rounded bg-[#158278] text-white hover:bg-[#10655d] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-bold text-lg text-[#043324]">Your Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-[#158278] text-xl sm:text-2xl"
          >
            <FiX />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-4 overflow-y-auto max-h-[65vh] space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center space-x-4 border-b pb-3"
              >
                {/* Product Image → click to open product page */}
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md cursor-pointer"
                  onClick={() => {
                    setCartOpen(false);
                    router.push(`/products/${item.product_id}`);
                  }}
                />

                <div
                  className="flex flex-col flex-1 cursor-pointer"
                  onClick={() => {
                    setCartOpen(false);
                    router.push(`/products/${item.product_id}`);
                  }}
                >
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <p className="font-bold text-pink-600">
                    ₹{item.price * item.quantity}
                  </p>
                  {/* Remove button */}
                  <button
                    onClick={async () => {
                      try {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/public/remove-from-cart/${user.email}/${item.product_id}`,
                          { method: "DELETE" }
                        );
                        // Refresh cart
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/public/get-cart?email=${user.email}`
                        );
                        const data = await res.json();
                        setCartItems(data.cart);
                        setSubtotal(data.subtotal);
                      } catch (err) {
                        alert("❌ Failed to remove item");
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
          )}
        </div>


        {/* Sticky Subtotal */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t p-4">
          <div className="flex justify-between font-bold text-lg text-gray-800 mb-3">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={async () => {
                try {
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/public/clear-cart/${user.email}`,
                    { method: "DELETE" }
                  );
                  setCartItems([]);
                  setSubtotal(0);
                } catch (err) {
                  alert("❌ Failed to clear cart");
                }
              }}
              className="w-full bg-red-100 text-red-600 py-2 rounded mb-2 hover:bg-red-200 transition"
            >
              Clear All
            </button>
          )}

          <button className="w-full bg-[#158278] text-white py-2 rounded hover:bg-[#10655d] transition">
            Checkout
          </button>
        </div>
      </div>

      {/* Profile Sidebar (Compact) */}
      
        {/* Profile Sidebar (Compact + Chat) */}
        <div
          className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-lg 
              transform transition-transform duration-300 ease-in-out z-50 
              flex flex-col  /* <-- make entire sidebar a column */ 
              ${profileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="font-bold text-lg text-[#043324]">Profile</h2>
            <button
              onClick={() => setProfileOpen(false)}
              className="text-[#158278] text-xl sm:text-2xl"
            >
              <FiX />
            </button>
          </div>

          {/* Profile Info */}
          <div className="p-4 flex items-center space-x-4 border-b">
            <img
              src={user?.picture || "/default-avatar.png"}
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full border-2 border-[#158278] object-cover"
            />
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-800">{user?.name}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-b">
            {user ? (
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  setUser(null);
                  setProfileOpen(false);
                  router.push("/");
                }}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setProfileOpen(false);
                  login();
                }}
                className="w-full bg-[#158278] text-white py-2 rounded-lg hover:bg-[#10655d] transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Chat Section */}
<div className="flex flex-col h-full">
  {/* Chat Header */}
  <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
    <h4 className="font-bold text-gray-700">Chat</h4>
    <span className="text-xs text-gray-400">Support</span>
  </div>

  {/* Messages */}
<div className="flex-1 p-4 pb-[32vh] overflow-y-auto space-y-3 bg-white">
  <AnimatePresence>
    {messages.map((msg, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}
      >
        <div
          className={`px-3 py-2 rounded-lg max-w-[75%] text-sm shadow
            ${msg.sender === "user"
              ? "bg-[#158278] text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"}`}
        >
          {msg.text}
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
  <div ref={messagesEndRef}></div>
</div>

  {/* Input (Sticky Bottom) */}
  <div className="p-3 bg-gray-50 border-t sticky bottom-0">
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 
                   focus:outline-none focus:ring-2 focus:ring-[#158278] 
                   text-sm text-gray-800 placeholder-gray-400"
      />
      <button
        onClick={handleSendMessage}
        className="bg-[#158278] text-white px-4 py-2 rounded-full 
                   hover:bg-[#10655d] transition text-sm font-medium"
      >
        Send
      </button>
    </div>
  </div>
</div>

        </div>
      



{loading && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <Spinner />
  </div>
)}

    </nav>
  );
}
