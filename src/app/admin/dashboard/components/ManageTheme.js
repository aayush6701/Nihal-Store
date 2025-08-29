"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import Cropper from "react-easy-crop";
import axios from "axios";

export default function ManageTheme() {
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [themes, setThemes] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [themeName, setThemeName] = useState("");
const [editId, setEditId] = useState(null);
const [totalThemes, setTotalThemes] = useState(0);
const [searchQuery, setSearchQuery] = useState("");

const fetchThemes = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/themes/list`, {
      headers: { token },
    });
    setThemes(res.data.themes || []);
    setTotalThemes(res.data.total_themes || 0);
  } catch (err) {
    console.error("Failed to fetch themes", err);
  }
};


  // handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // remove selected image
  const handleRemoveImage = () => {
    setImageSrc(null);
  };

  // when cropping is done
  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

 
const handleSave = async () => {
  try {
    if (editId) {
  // Edit mode → only theme name required
  if (!themeName.trim()) {
    alert("Theme name is required.");
    return;
  }
} else {
  // Add mode → name + image required
  if (!themeName.trim()) {
    alert("Theme name is required.");
    return;
  }
  if (!imageSrc || !croppedArea) {
    alert("Please select and crop an image for new theme.");
    return;
  }
}


    const formData = new FormData();
    formData.append("name", themeName);

    const token = localStorage.getItem("adminToken");
    let res;

    if (editId) {
      // ✅ If editing
      if (imageSrc && croppedArea) {
        // only include file if user selected + cropped a new one
        const blob = await getCroppedImg(imageSrc, croppedArea);
        const file = new File(
          [blob],
          `${themeName.replace(/\s+/g, "_")}.jpg`,
          { type: "image/jpeg" }
        );
        formData.append("file", file);
      }

      res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/themes/edit/${editId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );
    } else {
      // ✅ Adding new theme requires both fields
      if (!imageSrc || !croppedArea) {
        alert("Please select and crop an image for new theme.");
        return;
      }

      const blob = await getCroppedImg(imageSrc, croppedArea);
      const file = new File(
        [blob],
        `${themeName.replace(/\s+/g, "_")}.jpg`,
        { type: "image/jpeg" }
      );
      formData.append("file", file);

      res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/themes/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );
    }

    alert(res.data.message);
    fetchThemes();

    // reset
    setShowModal(false);
    setThemeName("");
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setEditId(null);
  } catch (err) {
    console.error(err);
    alert("Failed to save theme");
  }
};

const handleEdit = (theme) => {
  setEditId(theme._id);
  setThemeName(theme.name);
  setShowModal(true);
};

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this theme?")) return;

  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/themes/delete/${id}`,
      { headers: { token } }
    );
    alert(res.data.message);
    fetchThemes();
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to delete theme");
  }
};

const getCroppedImg = async (imageSrc, croppedAreaPixels, maxSize = 1200) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { x, y, width, height } = croppedAreaPixels;
  let outputWidth = width;
  let outputHeight = height;

  // 🔹 Resize if larger than 1200
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

  ctx.drawImage(
    image,
    x, y, width, height,   // source
    0, 0, outputWidth, outputHeight // destination
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      0.8 // compression quality
    );
  });
};

  

  useEffect(() => {
    fetchThemes();
  }, []);

  return (
    <div className="p-6">
      {/* 🔹 Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Themes</h3>
          <p className="text-3xl font-bold text-black mt-2">{totalThemes}</p>

        </div>
      </div>

      {/* 🔹 Search & Add Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="flex items-center w-full max-w-md bg-white rounded-xl shadow-md px-4 py-2">
          <FiSearch className="text-gray-500 mr-2 text-lg" />
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-black placeholder-gray-400"
          />
        </div>

        {/* Add Button */}
        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
          >
            <FiPlus className="mr-2" /> Add Theme
          </button>
        </div>
      </div>

      {/* 🔹 Add Theme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Theme</h2>

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
                    aspect={14 / 16} // 🔹 rectangle aspect for theme
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              )}
            </div>

            {/* Theme Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Theme Name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
              />
            </div>

            {/* Buttons */}
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

     {/* 🔹 Theme List Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme List</h3>
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
  {themes
    .filter((t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) // ✅ only theme name
    )
    .map((theme, index) => (
      <tr
        key={theme._id || index}
        className="odd:bg-white even:bg-gray-50 text-black hover:bg-gray-100 transition"
      > 
              <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${theme.image_url}`}
                    alt={theme.name}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => setViewImage(`${process.env.NEXT_PUBLIC_API_URL}${theme.image_url}`)}
                  />
                </td>
                <td className="py-3 px-4 text-gray-800">{theme.name}</td>
                 <td className="py-3 px-4 text-center">
   <button
     onClick={() => handleEdit(theme)}
     className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm mr-2 hover:bg-blue-600 transition"
   >
     Edit
   </button>
   <button
     onClick={() => handleDelete(theme._id)}
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
          <img src={viewImage} alt="Theme" className="max-w-full max-h-full rounded-lg shadow-lg" />
        </div>
      )}

    </div>
  );
}
