
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiFilter, FiPlus } from "react-icons/fi";
import Cropper from "react-easy-crop";

export default function ManageProducts() {
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");




  // crop states
  const [images, setImages] = useState({
  display: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
  hover: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
  additional: [] // each item also needs croppedArea
});

// "display", "hover", "add-0", "add-1" etc.

  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);


  const availability = ["In Stock", "Sold Out"];

  // helper to crop, resize and compress
const getCroppedImg = async (imageSrc, croppedAreaPixels, maxSize = 1200) => {
  const image = new Image();
  image.crossOrigin = "anonymous"; 
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { x, y, width, height } = croppedAreaPixels;
  let outputWidth = width;
  let outputHeight = height;

  // ✅ limit max resolution
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
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg", // ✅ force jpeg
      0.8           // ✅ compression (80%)
    );
  });
};


const handleImageUpload = (e, type, index = null) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (type === "display" || type === "hover") {
      setImages((prev) => ({
        ...prev,
        [type]: { ...prev[type], src: reader.result }

      }));
    } else if (type === "additional") {
      setImages((prev) => {
        const newArr = [...prev.additional];
        newArr[index] = { src: reader.result, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null };

        return { ...prev, additional: newArr };
      });
    }
  };
  reader.readAsDataURL(file);
};

const handleRemoveImage = (type, index = null) => {
  if (type === "display" || type === "hover") {
    setImages((prev) => ({
      ...prev,
      [type]: { ...prev[type], src: null, removed: true }, // ⬅ mark removed
    }));
  } else {
    setImages((prev) => {
      const newArr = [...prev.additional];
      newArr[index] = { ...newArr[index], src: null, removed: true };
      return { ...prev, additional: newArr };
    });
  }
};

const addNewImageSlot = () => {
  setImages((prev) => ({
    ...prev,
    additional: [...prev.additional, { src: null, crop: { x: 0, y: 0 }, zoom: 1 }]
  }));
};

useEffect(() => {
  const fetchCategoriesAndThemes = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const [catRes, themeRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/list`, { headers: { token } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/themes/list`, { headers: { token } }),
      ]);

      setCategories(catRes.data.categories || []);
      setThemes(themeRes.data.themes || []);
    } catch (err) {
      console.error("Failed to fetch categories/themes", err);
    }
  };

  const fetchProducts = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/list`, {
      headers: { token },
    });

    const productList = res.data.products || [];
    setProducts(productList);
    setTotalProducts(res.data.total_products || productList.length);

    // 🔹 Count availability
    const available = productList.filter((p) => p.availability === "In Stock").length;
    const outOfStock = productList.filter((p) => p.availability === "Sold Out").length;

    setAvailableCount(available);
    setOutOfStockCount(outOfStock);

  } catch (err) {
    console.error("Failed to fetch products", err);
  }
};


  fetchCategoriesAndThemes();
  fetchProducts();
}, []);

const handleChange = (e) => {
  setProductData({ ...productData, [e.target.name]: e.target.value });
};


const [productData, setProductData] = useState({
  name: "",
  category_id: "",
  theme_id: "",
  selling_price: "",
  mrp: "",
  availability: "",
  description: ""
});


const handleSaveProduct = async () => {
  try {
    if (!productData.name.trim()) {
      alert("❌ Product name is required.");
      return;
    }
    if (!productData.category_id) {
      alert("❌ Please select a category.");
      return;
    }
    if (!productData.theme_id) {
      alert("❌ Please select a theme.");
      return;
    }
    if (!productData.selling_price) {
      alert("❌ Selling price is required.");
      return;
    }
    if (!productData.mrp) {
      alert("❌ MRP is required.");
      return;
    }
    if (!productData.availability) {
      alert("❌ Availability is required.");
      return;
    }
    if (!productData.description.trim()) {
      alert("❌ Description is required.");
      return;
    }

    // Add mode → need at least display image
    if (!editId && (!images.display.src || !images.display.croppedArea)) {
      alert("❌ Display image is required.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    // 🔹 Basic fields
    formData.append("name", productData.name);
    formData.append("category_id", productData.category_id);
    formData.append("theme_id", productData.theme_id);
    formData.append("selling_price", productData.selling_price);
    formData.append("mrp", productData.mrp);
    formData.append("availability", productData.availability);
    formData.append("description", productData.description);

    // 🔹 Track removed images
    const removedImages = [];
    if (images.display.removed) removedImages.push("display");
    if (images.hover.removed) removedImages.push("hover");
    images.additional.forEach((img, i) => {
      if (img?.removed) removedImages.push(`additional_${i}`);
    });
    formData.append("removed_images", JSON.stringify(removedImages));

    // 🔹 Display image
    if (images.display.src && images.display.croppedArea) {
      const blob = await getCroppedImg(images.display.src, images.display.croppedArea, 1200);
      const file = new File([blob], "display.jpg", { type: "image/jpeg" });
      formData.append("display_image", file);
    }

    // 🔹 Hover image
    if (images.hover.src && images.hover.croppedArea) {
      const blob = await getCroppedImg(images.hover.src, images.hover.croppedArea, 1200);
      const file = new File([blob], "hover.jpg", { type: "image/jpeg" });
      formData.append("hover_image", file);
    }

    // 🔹 Additional images
    for (let i = 0; i < images.additional.length; i++) {
      const img = images.additional[i];
      if (img.src && img.croppedArea) {
        const blob = await getCroppedImg(img.src, img.croppedArea, 1200);
        const file = new File([blob], `additional_${i}.jpg`, { type: "image/jpeg" });
        formData.append("additional_images", file);
      }
    }

    // 🔹 Save or Update
    if (editId) {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/products/edit/${editId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", token } }
      );
      alert("✅ Product updated successfully!");
    } else {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/products/add`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", token } }
      );
      alert("✅ Product saved successfully!");
    }

    // ✅ Refresh list after save/update
    const refreshed = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/list`, { headers: { token } });
    setProducts(refreshed.data.products || []);
    setTotalProducts(refreshed.data.total_products || 0);

    // 🔹 Reset form + modal
    setShowModal(false);
    setEditId(null);
    setProductData({
      name: "",
      category_id: "",
      theme_id: "",
      selling_price: "",
      mrp: "",
      availability: "",
      description: ""
    });
    setImages({
      display: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
      hover: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
      additional: []
    });

  } catch (err) {
    console.error("Error saving product:", err);
    alert("❌ Failed to save product");
  }
};



// ✅ Edit product (open modal pre-filled)
const handleEdit = (product) => {
  setEditId(product._id);
  setProductData({
    name: product.name,
    category_id: product.category_id || "",
    theme_id: product.theme_id || "",
    selling_price: product.selling_price,
    mrp: product.mrp,
    availability: product.availability,
    description: product.description,
  });

  // preload images into state
  setImages({
    display: { src: product.display_image ? `${process.env.NEXT_PUBLIC_API_URL}${product.display_image}` : null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
    hover: { src: product.hover_image ? `${process.env.NEXT_PUBLIC_API_URL}${product.hover_image}` : null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
    additional: (product.additional_images || []).map((img) => ({
      src: `${process.env.NEXT_PUBLIC_API_URL}${img}`,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedArea: null,
    })),
  });

  setShowModal(true);
};


// ✅ Delete product
const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/products/delete/${id}`,
      { headers: { token } }
    );
    alert(res.data.message);
    // refresh
    const refreshed = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/list`, { headers: { token } });
    setProducts(refreshed.data.products || []);
    setTotalProducts(refreshed.data.total_products || 0);
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to delete product");
  }
};


  return (
    <div className="p-6">
      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
    <p className="text-3xl font-bold text-black mt-2">{totalProducts}</p>
  </div>
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Available</h3>
    <p className="text-3xl font-bold text-black mt-2">{availableCount}</p>
  </div>
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-700">Out of Stock</h3>
    <p className="text-3xl font-bold text-black mt-2">{outOfStockCount}</p>
  </div>
</div>


      {/* 🔹 Search & Filter Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="flex items-center w-full max-w-md bg-white rounded-xl shadow-md px-4 py-2">
          <FiSearch className="text-gray-500 mr-2 text-lg" />
          <input
  type="text"
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full focus:outline-none text-black placeholder-gray-400"
/>

        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Add Product */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
          >
            <FiPlus className="mr-2" /> Add
          </button>

          {/* Filter */}
          {/* <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-[#158278] text-white px-4 py-2 rounded-xl shadow hover:bg-[#11645c] transition"
          >
            <FiFilter className="mr-2" /> Filters
          </button> */}
        </div>
      </div>

      {/* 🔹 Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {/* Categories */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat, idx) => (
                <label key={idx} className="flex items-center space-x-2 text-black">
                  <input type="checkbox" className="accent-[#158278]" />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Theme</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {themes.map((theme, idx) => (
                <label key={idx} className="flex items-center space-x-2 text-black">
                  <input type="checkbox" className="accent-[#158278]" />
                  <span>{theme}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Availability</h3>
            <div className="flex space-x-6">
              {availability.map((status, idx) => (
                <label key={idx} className="flex items-center space-x-2 text-black">
                  <input type="checkbox" className="accent-[#158278]" />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Product</h2>

           {/* Display Image */}
<div className="mb-4">
  <label className="block text-gray-700 font-semibold">Display Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleImageUpload(e, "display")}
    className="text-black file:text-black"
  />

  {images.display.src && (
    <div className="relative w-full h-64 mt-2 bg-gray-200 rounded-xl overflow-hidden">
      <Cropper
        image={images.display.src}
        crop={images.display.crop}
        zoom={images.display.zoom}
        aspect={1}
        onCropChange={(c) =>
          setImages((prev) => ({
            ...prev,
            display: { ...prev.display, crop: c },
          }))
        }
        onZoomChange={(z) =>
          setImages((prev) => ({
            ...prev,
            display: { ...prev.display, zoom: z },
          }))
        }
        onCropComplete={(croppedArea, croppedAreaPixels) =>
   setImages((prev) => ({
     ...prev,
     display: { ...prev.display, croppedArea: croppedAreaPixels },
   }))
 }
      />
      <button
        onClick={() => handleRemoveImage("display")}
        className="absolute top-2 right-2 bg-red-500 text-white px-2 rounded-full"
      >
        X
      </button>
    </div>
  )}
</div>

{/* Hovering Image */}
<div className="mb-4">
  <label className="block text-gray-700 font-semibold">Hovering Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleImageUpload(e, "hover")}
    className="text-black file:text-black"
  />
  {images.hover.src && (
    <div className="relative w-full h-64 mt-2 bg-gray-200 rounded-xl overflow-hidden">
      <Cropper
        image={images.hover.src}
        crop={images.hover.crop}
        zoom={images.hover.zoom}
        aspect={1}
        onCropChange={(c) =>
          setImages((prev) => ({
            ...prev,
            hover: { ...prev.hover, crop: c },
          }))
        }
        onZoomChange={(z) =>
          setImages((prev) => ({
            ...prev,
            hover: { ...prev.hover, zoom: z },
          }))
        }
        onCropComplete={(croppedArea, croppedAreaPixels) =>   setImages((prev) => ({
     ...prev,
     hover: { ...prev.hover, croppedArea: croppedAreaPixels },
   }))
 }
      />
      <button
        onClick={() => handleRemoveImage("hover")}
        className="absolute top-2 right-2 bg-red-500 text-white px-2 rounded-full"
      >
        X
      </button>
    </div>
  )}
</div>

{/* Additional Images */}
<div className="mb-4">
  <label className="block text-gray-700 font-semibold">Additional Images</label>
  {images.additional.map((img, i) => (
    <div key={i} className="mb-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, "additional", i)}
        className="text-black file:text-black"
      />
      {img.src && (
        <div className="relative w-full h-64 mt-2 bg-gray-200 rounded-xl overflow-hidden">
          <Cropper
            image={img.src}
            crop={img.crop}
            zoom={img.zoom}
            aspect={1}
            onCropChange={(c) =>
              setImages((prev) => {
                const arr = [...prev.additional];
                arr[i].crop = c;
                return { ...prev, additional: arr };
              })
            }
            onZoomChange={(z) =>
              setImages((prev) => {
                const arr = [...prev.additional];
                arr[i].zoom = z;
                return { ...prev, additional: arr };
              })
            }
            onCropComplete={(croppedArea, croppedAreaPixels) =>
   setImages((prev) => {
     const arr = [...prev.additional];
     arr[i].croppedArea = croppedAreaPixels;
     return { ...prev, additional: arr };
   })
 }
          />
          <button
            onClick={() => handleRemoveImage("additional", i)}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 rounded-full"
          >
            X
          </button>
        </div>
      )}
    </div>
  ))}
  <button
    onClick={addNewImageSlot}
    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg"
  >
    ➕ Add Image
  </button>
</div>

           {/* Form Fields */}
<form className="space-y-4">
  {/* Product Name */}
  <input
    type="text"
    name="name"
    value={productData.name}
    onChange={handleChange}
    placeholder="Product Name"
    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#158278] outline-none text-black"
  />

  {/* Category Dropdown */}
  <select
    name="category_id"
    value={productData.category_id}
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded-lg text-black"
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>

  {/* Theme Dropdown */}
  <select
    name="theme_id"
    value={productData.theme_id}
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded-lg text-black"
  >
    <option value="">Select Theme</option>
    {themes.map((theme) => (
      <option key={theme._id} value={theme._id}>
        {theme.name}
      </option>
    ))}
  </select>

  {/* Prices */}
  <div className="flex space-x-4">
    <input
      type="number"
      name="selling_price"
      value={productData.selling_price}
      onChange={handleChange}
      placeholder="Selling Price"
      className="w-1/2 px-4 py-2 border rounded-lg text-black"
    />
    <input
      type="number"
      name="mrp"
      value={productData.mrp}
      onChange={handleChange}
      placeholder="MRP"
      className="w-1/2 px-4 py-2 border rounded-lg text-black"
    />
  </div>

  {/* Availability */}
  <select
    name="availability"
    value={productData.availability}
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded-lg text-black"
  >
    <option value="">Availability</option>
    {availability.map((a, i) => (
      <option key={i} value={a}>
        {a}
      </option>
    ))}
  </select>

  {/* Description */}
  <textarea
    name="description"
    value={productData.description}
    onChange={handleChange}
    placeholder="Product Description"
    className="w-full px-4 py-2 border rounded-lg text-black"
    rows={3}
  ></textarea>
</form>

{/* Buttons */}
<div className="flex justify-end space-x-3 mt-6 pb-2">
  <button
    type="button"
    onClick={() => {
      setShowModal(false);
      // reset when closing
      setProductData({
        name: "",
        category_id: "",
        theme_id: "",
        selling_price: "",
        mrp: "",
        availability: "",
        description: ""
      });
     setImages({
  display: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
  hover: { src: null, crop: { x: 0, y: 0 }, zoom: 1, croppedArea: null },
  additional: []
});


    }}
    className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={handleSaveProduct}
    className="px-4 py-2 rounded-lg bg-[#158278] text-white hover:bg-[#11645c]"
  >
    Save
  </button>
</div>

          </div>
        </div>
      )}

      {/* 🔹 Placeholder for product list */}
<div className="bg-white rounded-2xl shadow-md p-6 mt-6 overflow-x-auto">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product List</h3>
  <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
   <thead>
  <tr className="bg-[#158278] text-white text-left">
    <th className="py-3 px-4">S.No</th>
    <th className="py-3 px-4">Product ID</th> {/* ✅ NEW */}
    <th className="py-3 px-4">Name</th>
    <th className="py-3 px-4">Category ID</th>
    <th className="py-3 px-4">Theme ID</th>
    <th className="py-3 px-4">Price</th>
    <th className="py-3 px-4">MRP</th>
    <th className="py-3 px-4">Availability</th>
    <th className="py-3 px-4">Description</th>
    <th className="py-3 px-4">Images</th>
    <th className="py-3 px-4 text-center">Action</th>
  </tr>
</thead>

    <tbody>
  {products
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p._id?.toLowerCase().includes(q) ||           // ✅ Product ID
        p.name?.toLowerCase().includes(q) ||          // ✅ Name
        p.category_name?.toLowerCase().includes(q) || // ✅ Category
        p.theme_name?.toLowerCase().includes(q) ||    // ✅ Theme
        p.selling_price?.toString().includes(q) ||    // ✅ Price
        p.mrp?.toString().includes(q) ||              // ✅ MRP
        p.availability?.toLowerCase().includes(q) ||  // ✅ Availability
        p.description?.toLowerCase().includes(q)      // ✅ Description
      );
    })
    .map((p, index) => (
      <tr
        key={p._id}
        className="odd:bg-white even:bg-gray-50 text-black hover:bg-gray-100 transition"
      >
        <td className="py-3 px-4">{index + 1}</td>
        <td className="py-3 px-4">{p._id}</td> {/* ✅ Show Product ID */}
        <td className="py-3 px-4">{p.name}</td>
          <td className="py-3 px-4">{p.category_name}</td>
          <td className="py-3 px-4">{p.theme_name}</td>
          <td className="py-3 px-4">{p.selling_price}</td>
          <td className="py-3 px-4">{p.mrp}</td>
          <td className="py-3 px-4">{p.availability}</td>
          <td className="py-3 px-4">{p.description}</td>
          <td className="py-3 px-4">
  <div className="flex flex-wrap gap-4">
    {/* Display Image */}
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500">Display</span>
      <img
        src={`${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`}
        alt="Display"
        className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-110 transition"
        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${p.display_image}`, "_blank")}
      />
    </div>

    {/* Hover Image */}
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500">Hover</span>
      <img
        src={`${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}`}
        alt="Hover"
        className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-110 transition"
        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${p.hover_image}`, "_blank")}
      />
    </div>

    {/* Additional Images */}
    {p.additional_images?.map((img, i) => (
      <div key={i} className="flex flex-col items-center">
        <span className="text-xs text-gray-500">Add {i + 1}</span>
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
          alt={`Additional-${i}`}
          className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-110 transition"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${img}`, "_blank")}
        />
      </div>
    ))}
  </div>
</td>
<td className="py-3 px-4 text-center">
  <div className="flex justify-center gap-2">
    <button
      onClick={() => handleEdit(p)}
      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm shadow hover:bg-blue-600 transition"
    >
      ✏️ Edit
    </button>
    <button
      onClick={() => handleDelete(p._id)}
      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm shadow hover:bg-red-600 transition"
    >
      🗑 Delete
    </button>
  </div>
</td>


        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}
