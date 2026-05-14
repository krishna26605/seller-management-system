/**
 * REUSABLE PRODUCT FORM COMPONENT
 * ================================
 * Used for both Creating and Editing products.
 * 
 * Props:
 * - initialData: Existing product data (for editing)
 * - onSubmit: Callback function when form is submitted
 * - isLoading: Loading state for submit button
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Trash2, Upload, Loader2, Package, IndianRupee, Tag } from "lucide-react";
import toast from "react-hot-toast";

const defaultBrand = { brandName: "", detail: "", price: "", image: null, preview: null, touched: false };

export default function ProductForm({ initialData, onSubmit, isLoading }) {
  const [brands, setBrands] = useState([{ ...defaultBrand }]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Pre-fill form if initialData exists
  useEffect(() => {
    if (initialData) {
      setValue("productName", initialData.productName);
      setValue("productDescription", initialData.productDescription);
      
      // Handle brands pre-fill
      const formattedBrands = initialData.brands.map(b => ({
        ...b,
        preview: b.image ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}/${b.image}` : null
      }));
      setBrands(formattedBrands);
    }
  }, [initialData, setValue]);

  const addBrand = () => setBrands([...brands, { ...defaultBrand }]);

  const removeBrand = (index) => {
    if (brands.length === 1) return toast.error("At least one brand is required");
    setBrands(brands.filter((_, i) => i !== index));
  };

  const updateBrand = (index, field, value) => {
    setBrands(brands.map((b, i) => i === index ? { ...b, [field]: value, touched: true } : b));
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return toast.error("Invalid image type");
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (Max 5MB)");

    const preview = URL.createObjectURL(file);
    setBrands(brands.map((b, i) => i === index ? { ...b, image: file, preview, touched: true } : b));
  };

  const handleFormSubmit = (formData) => {
    // Validation
    let hasError = false;
    const validatedBrands = brands.map(b => {
      if (!b.brandName.trim() || !b.detail.trim() || !b.price) {
        hasError = true;
        return { ...b, touched: true };
      }
      return b;
    });

    if (hasError) {
      setBrands(validatedBrands);
      return toast.error("Please fill all brand details");
    }
    onSubmit({ ...formData, brands });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-3xl">
      {/* Product Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          Product Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Name</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 ${errors.productName ? 'border-red-500' : 'border-gray-700'}`}
            {...register("productName", {
                required: "Product name is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 500, message: "Max 500 characters" }
              })}
            />
            {errors.productName && (
              <p className="text-red-400 text-xs mt-1">{errors.productName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 ${errors.productDescription ? 'border-red-500' : 'border-gray-700'}`}
              {...register("productDescription", {
                required: "Description is required",
                minLength: { value: 2, message: "Min 2 characters" },
                maxLength: { value: 500, message: "Max 500 characters" }
              })}
            />
            {errors.productDescription && (
              <p className="text-red-400 text-xs mt-1">{errors.productDescription.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Brands</h2>
          <button type="button" onClick={addBrand} className="px-4 py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl hover:bg-emerald-600/20 transition-all">
            + Add Brand
          </button>
        </div>

        {brands.map((brand, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-400 text-sm">Brand {index + 1}</span>
              <button type="button" onClick={() => removeBrand(index)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-gray-500 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand.brandName}
                  onChange={(e) => updateBrand(index, "brandName", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-xl text-white text-sm outline-none transition-all
                    ${(!brand.brandName.trim() && brand.touched) || brand.brandName.length > 500 ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
                  maxLength="505"
                />
                {!brand.brandName.trim() && brand.touched && (
                  <p className="text-red-400 text-[10px] mt-1">Brand name is required</p>
                )}
                {brand.brandName.length > 500 && (
                  <p className="text-red-400 text-[10px] mt-1">Max 500 characters</p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-gray-500 mb-1">Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"/>
                  <input
                    type="number"
                    value={brand.price}
                    onChange={(e) => updateBrand(index, "price", e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 bg-gray-800 border rounded-xl text-white text-sm outline-none transition-all
                      ${!brand.price && brand.touched ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
                  />
                </div>
                {!brand.price && brand.touched && (
                  <p className="text-red-400 text-[10px] mt-1">Price is required</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Detail</label>
                <textarea
                  value={brand.detail}
                  onChange={(e) => updateBrand(index, "detail", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-xl text-white text-sm outline-none transition-all
                    ${(!brand.detail.trim() && brand.touched) || brand.detail.length > 500 ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
                  maxLength="505"
                />
                {!brand.detail.trim() && brand.touched && (
                  <p className="text-red-400 text-[10px] mt-1">Detail is required</p>
                )}
                {brand.detail.length > 500 && (
                  <p className="text-red-400 text-[10px] mt-1">Max 500 characters</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {brand.preview && (
                    <img src={brand.preview} className="w-16 h-16 object-cover rounded-lg border border-gray-700" alt="Preview" />
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 group">
                    <input type="file" className="hidden" onChange={(e) => handleImageChange(index, e.target.files[0])} />
                    <Upload className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
                    <span className="text-gray-500 text-xs group-hover:text-emerald-400">Change Image</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <PlusCircle className="w-5 h-5" />}
        {initialData ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
