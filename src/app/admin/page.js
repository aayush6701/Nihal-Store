"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminAuth() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isRegister ? "register" : "login";
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/${endpoint}`,
        { username, password }
      );

      if (isRegister) {
        setMessage(res.data.message || "Registered successfully");
      } else {
        // ✅ Save token + login state
        localStorage.setItem("adminToken", res.data.access_token);
        localStorage.setItem("isAdminLoggedIn", "true");

        // ✅ Redirect to dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-[#158278] mb-6">
          {isRegister ? "Admin Register" : "Admin Panel Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#158278] text-white py-3 rounded-lg font-semibold hover:bg-[#11645c] transition"
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#158278] font-semibold hover:underline"
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
}
