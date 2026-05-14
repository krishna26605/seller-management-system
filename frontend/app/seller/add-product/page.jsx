/**
 * ADD PRODUCT PAGE
 * =================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sellerAPI } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import SellerSidebar from "@/components/SellerSidebar";
import ProductForm from "@/components/ProductForm";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("productName", data.productName);
      formData.append("productDescription", data.productDescription);
      
      const brandsData = data.brands.map(b => ({
        brandName: b.brandName,
        detail: b.detail,
        price: b.price,
        hasNewImage: b.image instanceof File
      }));
      formData.append("brands", JSON.stringify(brandsData));

      data.brands.forEach(b => {
        if (b.image instanceof File) {
          formData.append("brandImages", b.image);
        }
      });

      await sellerAPI.addProduct(formData);
      toast.success("Product created!");
      router.push("/seller/products");
    } catch (error) {
      if (error.response?.data?.errors) {
        // Show first validation error message
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(error.response?.data?.message || "Failed to create product");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="seller">
      <div className="flex min-h-screen bg-gray-950">
        <SellerSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <PlusCircle className="text-emerald-400 w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Add Product</h1>
            </div>
            <p className="text-gray-400 text-sm ml-9">Create a new product listing</p>
          </div>
          <ProductForm onSubmit={onSubmit} isLoading={isLoading} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
