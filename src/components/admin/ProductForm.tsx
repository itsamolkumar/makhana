"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { UploadCloud, X, Package, DollarSign, Hash, Tag, Weight, FileText, ImageIcon } from "lucide-react";
import { createProduct } from "@/redux/slices/productSlice";
import { uploadProductImage } from "@/services/upload.service";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// Dynamically import the rich text editor to avoid SSR issues
const DefaultEditor = dynamic(() => import("react-simple-wysiwyg"), { ssr: false });

// Custom styles for the rich text editor
const customEditorStyles = `
  .rsw-editor {
    border: 2px solid #e5e7eb !important;
    border-radius: 0.75rem !important;
    min-height: 120px;
  }
  .rsw-editor:focus-within {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1) !important;
  }
  .rsw-toolbar {
    border-bottom: 1px solid #e5e7eb !important;
    border-top-left-radius: 0.75rem !important;
    border-top-right-radius: 0.75rem !important;
    background: #f9fafb !important;
    padding: 0.5rem !important;
  }
  .rsw-btn {
    border: none !important;
    background: transparent !important;
    border-radius: 0.375rem !important;
    padding: 0.25rem !important;
  }
  .rsw-btn:hover {
    background: rgba(47, 93, 80, 0.1) !important;
  }
  .rsw-btn.active {
    background: var(--color-primary) !important;
    color: white !important;
  }
  .rsw-ce {
    padding: 1rem !important;
    min-height: 100px !important;
    font-size: 16px !important;
    line-height: 1.6 !important;
    border-bottom-left-radius: 0.75rem !important;
    border-bottom-right-radius: 0.75rem !important;
  }
`;

// Quill modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'link', 'color', 'background', 'align'
];

type ProductFormValues = {
  name: string;
  price: string;
  discountPrice: string;
  category: string;
  weight: string;
  stock: string;
  description: string;
  images?: string[];
};

type ProductSubmitValues = {
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  weight: string;
  stock: number;
  description: string;
  images: string[];
};

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>;
  onSubmit?: (values: ProductSubmitValues) => Promise<void> | void;
  submitLabel?: string;
  onClose?: () => void;
};

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Create product",
  onClose,
}: ProductFormProps) {
  const dispatch = useDispatch<any>();

  const [images, setImages] = useState<string[]>(initialValues?.images || []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormValues>(() => ({
    name: initialValues?.name || "",
    price: initialValues?.price || "",
    discountPrice: initialValues?.discountPrice || "",
    category: initialValues?.category || "",
    weight: initialValues?.weight || "",
    stock: initialValues?.stock || "",
    description: initialValues?.description || "",
    images: initialValues?.images || [],
  }));

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        price: initialValues.price ? String(initialValues.price) : "",
        discountPrice: initialValues.discountPrice ? String(initialValues.discountPrice) : "",
        category: initialValues.category || "",
        weight: initialValues.weight || "",
        stock: initialValues.stock ? String(initialValues.stock) : "",
        description: initialValues.description || "",
        images: initialValues.images || [],
      });
      setImages(initialValues.images || []);
    }
  }, [initialValues]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (e: any) => {
    setForm({ ...form, description: e.target.value });
  };

  const uploadImageHandler = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("File size must be less than 5MB");
        return;
      }

      if (images.length >= 6) {
        toast.error("Max 6 images allowed");
        return;
      }

      setUploading(true);

      const url = await uploadProductImage(file);

      setImages((prev) => [...prev, url]);

    } catch (error: any) {
      toast.error("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadImageHandler);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(uploadImageHandler);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const submitHandler = async (e: any) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      images,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created successfully!");
        // Since no onClose, and for Redux, perhaps redirect, but since it's reusable, leave it
      }

      if (onClose) onClose();
    } catch (error: any) {
      toast.error("Failed to create product: " + (error.message || "Unknown error"));
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: "var(--color-primary)" },
    blur: { scale: 1, borderColor: "var(--color-muted)" }
  };

  return (
    <motion.form
      onSubmit={submitHandler}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Inject custom editor styles */}
      <style dangerouslySetInnerHTML={{ __html: customEditorStyles }} />

      <div className="text-center mb-8">
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Package className="text-[var(--color-primary)]" />
          {initialValues ? "Edit Product" : "Add New Product"}
        </motion.h2>
        <p className="text-gray-600">
          {initialValues ? "Update the product details" : "Create a healthy product for your store"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Package size={16} />
            Product Name
          </label>
          <motion.input
            name="name"
            value={form.name}
            placeholder="e.g., Organic Green Tea"
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
            required
          />
        </motion.div>
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Tag size={16} />
            Category
          </label>
          <motion.select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </motion.select>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <DollarSign size={16} />
            Price (₹)
          </label>
          <motion.input
            name="price"
            type="number"
            value={form.price}
            placeholder="199"
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
            required
          />
        </motion.div>
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <DollarSign size={16} />
            Discount Price (₹) (Optional)
          </label>
          <motion.input
            name="discountPrice"
            type="number"
            value={form.discountPrice}
            placeholder="149"
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
          />
        </motion.div>
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Weight size={16} />
            Weight
          </label>
          <motion.input
            name="weight"
            value={form.weight}
            placeholder="500g"
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
            required
          />
        </motion.div>
        <motion.div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Hash size={16} />
            Stock
          </label>
          <motion.input
            name="stock"
            type="number"
            value={form.stock}
            placeholder="100"
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-200"
            variants={inputVariants}
            required
          />
        </motion.div>
      </div>

      <motion.div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText size={16} />
          Description
        </label>
        <motion.div
          className="focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all duration-200"
          variants={inputVariants}
        >
          <DefaultEditor
            value={form.description}
            onChange={handleDescriptionChange}
            placeholder="Describe the product's benefits and ingredients..."
          />
        </motion.div>
      </motion.div>

      {/* Enhanced Upload */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ImageIcon size={16} />
          Product Images (Max 6)
        </label>
        <motion.div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-105' : 'border-gray-300 hover:border-[var(--color-primary)]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileRef}
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <UploadCloud className="mx-auto text-gray-400" size={48} />
            <div>
              <p className="text-lg font-medium text-gray-700">Drop images here or click to browse</p>
              <p className="text-sm text-gray-500">Supports PNG, JPG up to 5MB each</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex gap-3 mt-4 flex-wrap">
          {images.map((img, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <img
                src={img}
                className="w-24 h-24 rounded-lg object-cover shadow-md"
              />
              <motion.button
                type="button"
                onClick={() =>
                  setImages(images.filter((_, index) => index !== i))
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {uploading && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-gray-600">Uploading...</p>
          </motion.div>
        )}
      </div>

      <motion.button
        type="submit"
        className="w-full bg-[var(--color-primary)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={uploading}
      >
        {submitLabel}
      </motion.button>
    </motion.form>
  );
}