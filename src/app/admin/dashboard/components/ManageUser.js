"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import axios from "axios";

export default function ManageAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [editId, setEditId] = useState(null);

  // counts
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // feedback
  const [message, setMessage] = useState("");

  // save admin
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Not authorized. Please login again.");
        return;
      }

      if (!name || !email || !password) {
        alert("All fields are required");
        return;
      }

      let res;
      if (editId) {
        res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/edit/${editId}`,
          { name, email, password },
          { headers: { token } }
        );
      } else {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/add`,
          { name, email, password },
          { headers: { token } }
        );
      }

      alert(res.data.message);
      setMessage(res.data.message);

      fetchAdmins();

      setShowModal(false);
      setEditId(null);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      let errorMsg = "Failed to save admin";
      if (Array.isArray(err.response?.data?.detail)) {
        errorMsg = err.response.data.detail.map((e) => e.msg).join(", ");
      } else if (typeof err.response?.data?.detail === "string") {
        errorMsg = err.response.data.detail;
      }
      setMessage(errorMsg);
      alert(errorMsg);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/delete/${id}`,
        { headers: { token } }
      );

      alert(res.data.message);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete admin");
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/all-users`, {
        headers: { token },
      });
      setAdmins(res.data.users || []);
      setTotalAdmins(res.data.total_admins || 0);
      setTotalUsers(res.data.total_users || 0);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const filteredAdmins = admins.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Admins</h3>
          <p className="text-3xl font-bold text-black mt-2">{totalAdmins}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-black mt-2">{totalUsers}</p>
        </div>
      </div>

      {/* 🔹 Search & Add Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md bg-white rounded-xl shadow-md px-4 py-2">
          <FiSearch className="text-gray-500 mr-2 text-lg" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-black placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
          >
            <FiPlus className="mr-2" /> Add Admin
          </button>
        </div>
      </div>

      {/* 🔹 Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editId ? "Edit Admin" : "Add Admin"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#158278] text-white hover:bg-[#11645c]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 User List Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User List</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-[#158278] text-white text-left">
                <th className="py-3 px-4">S.No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((user, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-800">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Admin"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm mr-2 hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
