"use client";

import { useRef, useState, useEffect, use } from "react";
import axios from 'axios';
import apiClient from '@/services/apiClient';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FiUpload,
  FiSave,
  FiPackage,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { Loader2 } from 'lucide-react';

import styles from "../../add/addProducts.module.css";

const initialProduct = {
  name: "",
  code: "",
  sku: "",
  categoryId: "",
  brandId: "",
  baseUnitId: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  tax: "",
  discountValue: "",
  discountType: "PERCENT",
  status: "ACTIVE",
};

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchFormData();
    fetchProduct();
  }, [id]);

  const fetchFormData = async () => {
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands'),
        apiClient.get('/units')
      ]);
      if (catRes.data?.data) setCategories(catRes.data.data);
      if (brandRes.data?.data) setBrands(brandRes.data.data);
      if (unitRes.data?.data) setUnits(unitRes.data.data);
    } catch (error) {
      console.error('Failed to fetch form data', error);
      toast.error('Failed to load form data');
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      if (res.data?.data) {
        const p = res.data.data;
        setProduct({
          name: p.name || "",
          code: p.code || "",
          sku: p.sku || "",
          categoryId: p.categoryId || "",
          brandId: p.brandId || "",
          baseUnitId: p.unitId || "", // Schema uses unitId
          description: p.description || "",
          costPrice: p.costPrice || "",
          sellingPrice: p.sellingPrice || "",
          tax: p.tax || "",
          discountValue: p.discountValue || "",
          discountType: p.discountType || "PERCENT",
          status: p.status || "ACTIVE",
        });

        if (p.image) {
           setImagePreview(p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image.startsWith('/') ? '' : '/'}${p.image}`);
        }
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      console.error('Failed to fetch product', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only PNG or JPG images.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImage(file);
    setImagePreview(previewUrl);
  };

  /* =========================
     REMOVE IMAGE
  ========================= */

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("sku", product.sku);
    formData.append("categoryId", product.categoryId);
    if (product.brandId) formData.append("brandId", product.brandId);
    formData.append("costPrice", parseFloat(product.costPrice || 0));
    formData.append("sellingPrice", parseFloat(product.sellingPrice || 0));
    if (product.baseUnitId) formData.append("unitId", product.baseUnitId);
    if (product.description) formData.append("description", product.description);
    if (product.status) formData.append("status", product.status);

    if (product.discountValue) {
      formData.append("discountValue", parseFloat(product.discountValue));
      formData.append("discountType", product.discountType);
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      await apiClient.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated successfully!');
      setTimeout(() => {
        router.push(`/admin/products/details/${id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update product';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
         <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} size={40} />
       </div>
     );
  }

  return (
    <div className={styles.layout}>
      <Toaster position="top-right" />
      <div className={styles.main}>
        <div className={styles.container}>

          {/* =========================
              PAGE HEADER
          ========================= */}

          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div>
                <h1>Edit Product</h1>
                <p>
                  Update existing product details
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push('/admin/products/view')}
                style={{ padding: '0 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FiArrowLeft />
                Cancel
              </button>
              <button
                type="submit"
                form="edit-product-form"
                className={styles.saveBtn}
                disabled={submitting}
              >
                <FiSave />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            id="edit-product-form"
            className={styles.form}
            onSubmit={handleSubmit}
          >

            {/* =========================
                LEFT SECTION
            ========================= */}

            <div className={styles.left}>

              {/* Product Information */}

              <div className={styles.card}>
                <h2>
                  <FiPackage />
                  Product Information
                </h2>

                <div className={styles.grid}>

                  {/* Product Name */}

                  <div>
                    <label htmlFor="name">
                      Product Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="Apple iPhone 15"
                      required
                    />
                  </div>

                  {/* Product Code */}

                  <div>
                    <label htmlFor="code">
                      Product Code (Read Only)
                    </label>

                    <input
                      id="code"
                      name="code"
                      value={product.code}
                      onChange={handleChange}
                      placeholder="PRD001"
                      disabled
                      style={{ background: '#f5f5f5' }}
                    />
                  </div>

                  {/* SKU */}

                  <div>
                    <label htmlFor="sku">
                      SKU
                    </label>

                    <input
                      id="sku"
                      name="sku"
                      value={product.sku}
                      onChange={handleChange}
                      placeholder="SKU-1001"
                      required
                    />
                  </div>

                  {/* Category */}

                  <div>
                    <label htmlFor="categoryId">
                      Category
                    </label>

                    <select
                      id="categoryId"
                      name="categoryId"
                      value={product.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Choose Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}

                  <div>
                    <label htmlFor="brandId">
                      Brand
                    </label>

                    <select
                      id="brandId"
                      name="brandId"
                      value={product.brandId}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Brand
                      </option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}

                  <div>
                    <label htmlFor="baseUnitId">
                      Unit
                    </label>

                    <select
                      id="baseUnitId"
                      name="baseUnitId"
                      value={product.baseUnitId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose Unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}

                  <div>
                    <label htmlFor="status">
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={product.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>

                </div>

                {/* Description */}

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  rows={5}
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Write product description..."
                />
              </div>

              {/* =========================
                  PRICING
              ========================= */}

              <div className={styles.card}>
                <h2>Pricing</h2>

                <div className={styles.grid}>

                  <div>
                    <label htmlFor="costPrice">
                      Purchase Price (Cost)
                    </label>

                    <input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.costPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sellingPrice">
                      Selling Price
                    </label>

                    <input
                      id="sellingPrice"
                      name="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.sellingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tax">
                      Tax (%)
                    </label>

                    <input
                      id="tax"
                      name="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={product.tax}
                      onChange={handleChange}
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <label htmlFor="discountValue">
                      Discount
                    </label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        min="0"
                        value={product.discountValue}
                        onChange={handleChange}
                        placeholder="5"
                        style={{ flex: 1 }}
                      />
                      <select
                        name="discountType"
                        value={product.discountType}
                        onChange={handleChange}
                        style={{ width: '80px' }}
                      >
                        <option value="PERCENT">%</option>
                        <option value="FIXED">Fixed</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* =========================
                RIGHT SECTION
            ========================= */}

            <div className={styles.right}>

              {/* =========================
                  PRODUCT IMAGE
              ========================= */}

              <div className={styles.card}>
                <h2>Product Image</h2>

                <div className={styles.uploadBox}>

                  {imagePreview ? (
                    <div className={styles.previewContainer}>

                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className={styles.imagePreview}
                      />

                      <p className={styles.fileName}>
                        {image ? image.name : "Current Image"}
                      </p>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={handleRemoveImage}
                      >
                        <FiX />
                        Remove Image
                      </button>

                    </div>
                  ) : (
                    <>
                      <FiUpload size={40} />

                      <p>
                        Click or Drag image here
                      </p>

                      <span>
                        PNG, JPG up to 5MB
                      </span>

                      {/* Hidden File Input */}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                      >
                        Upload Image
                      </button>
                    </>
                  )}

                </div>
              </div>

              {/* =========================
                  QUICK TIPS
              ========================= */}

              <div className={styles.card}>
                <h2>Quick Tips</h2>

                <ul className={styles.tips}>
                  <li>
                    Ensure the SKU remains unique.
                  </li>
                  <li>
                    Check pricing carefully before updating.
                  </li>
                  <li>
                    Updating product images replaces the old image entirely.
                  </li>
                </ul>
              </div>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
