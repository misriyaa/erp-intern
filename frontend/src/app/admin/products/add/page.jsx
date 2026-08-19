"use client";

import { useRef, useState, useEffect } from "react";
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FiUpload,
  FiSave,
  FiPackage,
  FiX,
} from "react-icons/fi";

import styles from "./addProducts.module.css";
import { useAlert } from "@/context/AlertContext";
import apiClient from "@/services/apiClient";

const DEFAULT_UNITS = [
  { id: "pcs", name: "Pieces", code: "pcs" },
  { id: "kg", name: "Kilogram", code: "kg" },
  { id: "g", name: "Gram", code: "g" },
  { id: "l", name: "Litre", code: "L" },
  { id: "box", name: "Box", code: "box" },
  { id: "dozen", name: "Dozen", code: "dz" },
  { id: "meter", name: "Meter", code: "m" },
  { id: "pack", name: "Pack", code: "pk" },
];

const initialProduct = {
  name: "",
  code: "",
  sku: "",
  // barcode: "",
  categoryId: "",
  brandId: "",
  baseUnitId: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  tax: "",
  discountValue: "",
  discountType: "PERCENT",
  stock: "",
  lowStock: "",
  warehouse: "",
  status: "ACTIVE",
};

export default function AddProductPage() {
  const router = useRouter();
  const { showWarning, showSuccess, showError } = useAlert();
  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchUnits();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await apiClient.get('/brands');
      if (res.data && res.data.data) {
        setBrands(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get('/units');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setUnits(res.data.data);
      } else {
        setUnits(DEFAULT_UNITS);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits(DEFAULT_UNITS);
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

    // Image type validation
    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      showWarning("Invalid form data", "Please upload only PNG or JPG images.");
      e.target.value = "";
      return;
    }

    // 5MB validation
    if (file.size > 5 * 1024 * 1024) {
      showWarning("Invalid form data", "Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    // Remove previous preview URL
    if (imagePreview) {
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
    if (imagePreview) {
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
    
    // We will ignore stock, lowStock, and warehouse for now 
    // since the API expects product model fields.
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
      const res = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product added successfully!');
      setTimeout(() => {
        router.push('/admin/products/view');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to create product';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
                <h1>Add Product</h1>
                <p>
                  Create a new product for inventory
                </p>
              </div>
            </div>

            <button
              type="submit"
              form="add-product-form"
              className={styles.saveBtn}
              disabled={submitting}
            >
              <FiSave />
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            id="add-product-form"
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
                      Product Code
                    </label>

                    <input
                      id="code"
                      name="code"
                      value={product.code}
                      onChange={handleChange}
                      placeholder="PRD001"
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

                  {/* Barcode */}

                  {/* <div>
                    <label htmlFor="barcode">
                      Barcode
                    </label>

                    <input
                      id="barcode"
                      name="barcode"
                      value={product.barcode}
                      onChange={handleChange}
                      placeholder="123456789"
                    />
                  </div> */}

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
                          {unit.name} ({unit.code || unit.shortName || unit.name})
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

              {/* =========================
                  INVENTORY
              ========================= */}

              <div className={styles.card}>
                <h2>Inventory</h2>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                  Note: Inventory counts are managed via Purchases and Stock Adjustments. 
                </p>

                <div className={styles.grid}>

                  <div>
                    <label htmlFor="stock">
                      Opening Stock (Read-only)
                    </label>

                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={handleChange}
                      placeholder="0"
                      disabled
                    />
                  </div>

                  <div>
                    <label htmlFor="lowStock">
                      Low Stock Alert
                    </label>

                    <input
                      id="lowStock"
                      name="lowStock"
                      type="number"
                      min="0"
                      value={product.lowStock}
                      onChange={handleChange}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label htmlFor="warehouse">
                      Warehouse
                    </label>

                    <input
                      id="warehouse"
                      name="warehouse"
                      value={product.warehouse}
                      onChange={handleChange}
                      placeholder="Main Warehouse"
                    />
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
                        {image?.name}
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
                    Use a unique SKU.
                  </li>

                  <li>
                    Upload a high-quality product image.
                  </li>

                  <li>
                    Set low stock alerts.
                  </li>

                  <li>
                    Verify pricing before saving.
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
