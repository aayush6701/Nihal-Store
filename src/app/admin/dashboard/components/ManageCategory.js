
"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import Cropper from "react-easy-crop";
import axios from "axios";

export default function ManageCategory() {
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/list`,
        { headers: { token } }
      );
      setCategories(res.data.categories || []);
      setTotalCategories(res.data.total_categories || 0);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Handle upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setImageSrc(null);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  // ✅ Save (Add or Edit)
  const handleSave = async () => {
    try {
      if (!categoryName) {
        alert("Please provide a category name.");
        return;
      }
      if (!editId && (!imageSrc || !croppedArea)) {
        alert("❌ Please select and crop an image for new category.");
        return;
      }


      const formData = new FormData();
      formData.append("name", categoryName);

      const token = localStorage.getItem("adminToken");
      let res;

      if (editId) {
        // ✅ If editing
        if (imageSrc && croppedArea) {
          // only include new image if user selected & cropped one
          const blob = await getCroppedImg(imageSrc, croppedArea);
          const file = new File(
            [blob],
            `${categoryName.replace(/\s+/g, "_")}.jpg`,
            { type: "image/jpeg" }
          );
          formData.append("file", file);
        }

        res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/edit/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data", token } }
        );
      } else {
        // ✅ Adding new category requires image
        if (!imageSrc || !croppedArea) {
          alert("Please select and crop an image for new category.");
          return;
        }

        const blob = await getCroppedImg(imageSrc, croppedArea);
        const file = new File(
          [blob],
          `${categoryName.replace(/\s+/g, "_")}.jpg`,
          { type: "image/jpeg" }
        );
        formData.append("file", file);

        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/add`,
          formData,
          { headers: { "Content-Type": "multipart/form-data", token } }
        );
      }

      alert(res.data.message);
      fetchCategories();

      // reset
      setShowModal(false);
      setCategoryName("");
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setEditId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    }
  };

  // ✅ Edit
  const handleEdit = (category) => {
    setEditId(category._id);
    setCategoryName(category.name);
    setShowModal(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/delete/${id}`,
        { headers: { token } }
      );
      alert(res.data.message);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete category");
    }
  };

  // ✅ Crop helper
  const getCroppedImg = async (imageSrc, croppedAreaPixels, maxSize = 1200) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { x, y, width, height } = croppedAreaPixels;
    let outputWidth = width;
    let outputHeight = height;

    if (outputWidth > maxSize || outputHeight > maxSize) {
      if (outputWidth > outputHeight) {
        outputHeight = (outputHeight * maxSize) / outputWidth;
        outputWidth = maxSize;
      } else {
        outputWidth = (outputWidth * maxSize) / outputHeight;
        outputHeight = maxSize;
      }
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(image, x, y, width, height, 0, 0, outputWidth, outputHeight);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
    });
  };

  return (
    <div className="p-6">
      {/* 🔹 Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Categories</h3>
          <p className="text-3xl font-bold text-black mt-2">{totalCategories}</p>
        </div>
      </div>

      {/* 🔹 Search & Add Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md bg-white rounded-xl shadow-md px-4 py-2">
          <FiSearch className="text-gray-500 mr-2 text-lg" />
          <input
  type="text"
  placeholder="Search categories..."
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
            <FiPlus className="mr-2" /> Add Category
          </button>
        </div>
      </div>

      {/* 🔹 Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editId ? "Edit Category" : "Add Category"}
            </h2>

            {/* Upload Image with Crop */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Upload Image
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-black file:text-black"
                />
                {imageSrc && (
                  <button
                    onClick={handleRemoveImage}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  >
                    ❌
                  </button>
                )}
              </div>

              {imageSrc && (
                <div className="relative w-full h-64 bg-gray-200 mt-4 rounded-xl overflow-hidden">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // square aspect for categories
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              )}
            </div>

            {/* Category Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCategoryName("");
                  setImageSrc(null);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setEditId(null);
                }}

                className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#158278] text-white hover:bg-[#11645c] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Category List Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category List</h3>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-[#158278] text-white text-left">
              <th className="py-3 px-4">S.No</th>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
  {categories
    .filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((category, index) => (
      <tr
        key={category._id || index}
        className="odd:bg-white even:bg-gray-50 text-black hover:bg-gray-100 transition"
      >
        <td className="py-3 px-4">{index + 1}</td>
        <td className="py-3 px-4">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${category.image_url}`}
            alt={category.name}
            className="w-20 h-20 object-cover rounded cursor-pointer"
            onClick={() =>
              setViewImage(`${process.env.NEXT_PUBLIC_API_URL}${category.image_url}`)
            }
          />
        </td>
        <td className="py-3 px-4 text-gray-800">{category.name}</td>
        <td className="py-3 px-4 text-center">
          <button
            onClick={() => handleEdit(category)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm mr-2 hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(category._id)}
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

      {/* Fullscreen Image Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setViewImage(null)}
        >
          <img
            src={viewImage}
            alt="Category"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
