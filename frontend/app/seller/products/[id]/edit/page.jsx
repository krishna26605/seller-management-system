/**
 * EDIT PRODUCT PAGE
 * ==================
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { sellerAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import SellerSidebar from "@/components/SellerSidebar";
import ProductForm from "@/components/ProductForm";
import toast from "react-hot-toast";
import { Edit3, Loader2 } from "lucide-react";

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params in Next.js 15
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await sellerAPI.getProductById(id);
        setProduct(response.data);
      } catch (error) {
        toast.error("Failed to load product");
        router.push("/seller/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("productName", data.productName);
      formData.append("productDescription", data.productDescription);
      
      const brandsData = data.brands.map(b => ({
        brandName: b.brandName,
        detail: b.detail,
        price: b.price,
        image: typeof b.image === 'string' ? b.image : null,
        hasNewImage: b.image instanceof File
      }));
      formData.append("brands", JSON.stringify(brandsData));

      // Append only new File objects
      data.brands.forEach(b => {
        if (b.image instanceof File) {
          formData.append("brandImages", b.image);
        }
      });

      await sellerAPI.updateProduct(id, formData);
      toast.success("Product updated!");
      router.push("/seller/products");
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(error.response?.data?.message || "Failed to update product");
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="seller">
      <div className="flex min-h-screen bg-gray-950">
        <SellerSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Edit3 className="text-emerald-400 w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            </div>
            <p className="text-gray-400 text-sm ml-9">Update product details and brands</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-400 w-8 h-8" />
            </div>
          ) : (
            <ProductForm 
              initialData={product} 
              onSubmit={onSubmit} 
              isLoading={updating} 
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
