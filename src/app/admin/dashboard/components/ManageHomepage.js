"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus } from "react-icons/fi";

export default function ManageHomepage() {
  const [homeSections, setHomeSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editSno, setEditSno] = useState(null); // 🔹 Track editing section

  const [formData, setFormData] = useState({
  category_id: "",
  product_ids: [""],
  s_no: null, // ✅ new
});


  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const [homeRes, catRes, prodRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/homepage/list`, { headers: { token } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/list`, { headers: { token } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/list`, { headers: { token } }),
      ]);

      setHomeSections(homeRes.data.sections || []);
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add product dropdown
  const handleAddProductField = () => {
    if (formData.product_ids.length < 12) {
      setFormData({ ...formData, product_ids: [...formData.product_ids, ""] });
    } else {
      alert("⚠️ Max 12 products allowed per category");
    }
  };

  // Change product id
  const handleChangeProduct = (index, value) => {
    const updated = [...formData.product_ids];
    updated[index] = value;
    setFormData({ ...formData, product_ids: updated });
  };

  // Save or update
  const handleSave = async () => {
    try {
        if (!formData.category_id) {
  alert("❌ Please select a category.");
  return;
}
if (!formData.product_ids.length || formData.product_ids.some((id) => !id)) {
  alert("❌ Please select at least one product.");
  return;
}

      const token = localStorage.getItem("adminToken");

      if (editSno) {
        // 🔹 Update existing section
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/homepage/edit/${editSno}`,
          formData,
          { headers: { token } }
        );
        alert("✅ Section updated successfully");
      } else {
        // 🔹 Add new section
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/homepage/add`, formData, { headers: { token } });
        alert("✅ Section added successfully");
      }

      setShowModal(false);
      setEditSno(null);
      setFormData({ category_id: "", product_ids: [""], s_no: null });

      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save");
    }
  };

  // Edit
  const handleEdit = (section) => {
  setEditSno(section.s_no);
  setFormData({
    category_id: section.category_id,
    product_ids: section.products.map((p) => p._id),
    s_no: section.s_no, // ✅
  });
  setShowModal(true);
};


  // Delete
  const handleDelete = async (sno) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/homepage/delete/${sno}`, { headers: { token } });
      alert("🗑️ Section deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete");
    }
  };

  // Filter products by category
// Filter products by category and exclude already selected ones
const filteredProducts = products.filter(
  (p) =>
    p.category_id === formData.category_id &&
    !formData.product_ids.includes(p._id) // ✅ exclude already picked
);


  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Homepage</h2>
        <button
          onClick={() => { 
  setFormData({ category_id: "", product_ids: [""], s_no: null }); 
  setShowModal(true); 
}}

          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          <FiPlus className="mr-2" /> Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Homepage Sections</h3>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-[#158278] text-white text-left">
              <th className="py-3 px-4">S.No</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Products (max 12)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {homeSections.map((row) => (
              <tr key={row.s_no} className="odd:bg-white even:bg-gray-50 text-black hover:bg-gray-100 transition">
                <td className="py-3 px-4">{row.s_no}</td>
                <td className="py-3 px-4">{row.category_name}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {row.products?.slice(0, 12).map((p, i) => (
                      <img
                        key={i}
                        src={`${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.s_no)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editSno ? "Edit Homepage Section" : "Add Homepage Section"}
            </h3>

            {editSno && (
  <>
    <label className="block mb-2 font-semibold text-gray-700">S.No</label>
    <select
      value={formData.s_no || ""}
      onChange={(e) => setFormData({ ...formData, s_no: Number(e.target.value) })}
      className="w-full border px-3 py-2 rounded-lg mb-4 text-black"
    >
      {Array.from({ length: homeSections.length }, (_, i) => i + 1).map((num) => (
        <option key={num} value={num}>
          {num}
        </option>
      ))}
    </select>
  </>
)}


            {/* Category */}
            <label className="block mb-2 font-semibold text-gray-700">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value, product_ids: [""] })}
              className="w-full border px-3 py-2 rounded-lg mb-4 text-black"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Products */}
            <label className="block mb-2 font-semibold text-gray-700">Products</label>
           {formData.product_ids.map((pid, i) => (
  <div key={i} className="flex items-center gap-2 mb-2">
    <select
      value={pid}
      onChange={(e) => handleChangeProduct(i, e.target.value)}
      className="flex-1 border px-3 py-2 rounded-lg text-black"
    >
      <option value="">Select Product</option>
      {products
        .filter(
          (p) =>
            p.category_id === formData.category_id &&
            (!formData.product_ids.includes(p._id) || p._id === pid) // ✅ keep current selection
        )
        .map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
    </select>

    {/* ❌ Remove button */}
    {formData.product_ids.length > 1 && (
      <button
        onClick={() => {
          const updated = [...formData.product_ids];
          updated.splice(i, 1);
          setFormData({ ...formData, product_ids: updated });
        }}
        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        ✕
      </button>
    )}
  </div>
))}


            {formData.product_ids.length < 12 && (
              <button
                onClick={handleAddProductField}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              >
                + Add Another Product
              </button>
            )}

            {/* Actions */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => { setShowModal(false); setEditSno(null); }}
                className="px-4 py-2 bg-gray-300 rounded-lg text-black hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
