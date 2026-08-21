"use client";

import { useRef, useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiUpload,
  FiSave,
  FiPackage,
  FiX,
  FiDollarSign,
  FiArchive,
  FiTruck,
  FiShoppingBag,
  FiCheckCircle,
  FiTag,
  FiCamera,
} from "react-icons/fi";
import { BrowserMultiFormatReader } from "@zxing/browser";

import styles from "./addProducts.module.css";
import { useAlert } from "@/context/AlertContext";
import apiClient from "@/services/apiClient";

const DEFAULT_UNITS = [
  { id: "pcs", name: "Piece / Pcs", code: "pcs" },
  { id: "box", name: "Box", code: "box" },
  { id: "pack", name: "Pack", code: "pack" },
  { id: "kg", name: "Kilogram (KG)", code: "kg" },
  { id: "liter", name: "Liter (L)", code: "liter" },
  { id: "set", name: "Set", code: "set" },
  { id: "unit", name: "Unit", code: "unit" },
];

const initialProduct = {
  name: "",
  sku: "",
  barcode: "",
  categoryId: "",
  subcategory: "",
  brandId: "",
  baseUnitId: "",
  description: "",
  status: "ACTIVE",
  isTextile: false,

  stockUnit: "Piece / Pcs",
  initialStock: "",
  openingStockDate: new Date().toISOString().split("T")[0],
  reorderLevel: "10",
  minimumStock: "5",
  maximumStock: "500",
  warehouseLocation: "Main Store Warehouse",
  rackLocation: "Shelf A-1",

  costPrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  retailPrice: "",
  discountValue: "",
  discountType: "PERCENT",
  taxRate: "18",

  supplierId: "",
  supplierProductCode: "",
};

export default function AddRetailProductPage() {
  const router = useRouter();
  const { showWarning } = useAlert();

  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  // Barcode Scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const scannedRef = useRef(false);

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeScanner = () => {
    stopScanner();
    scannedRef.current = false;
    setScannerError("");
    setIsStarting(false);
    setScannerOpen(false);
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let mounted = true;

    const startScanner = async () => {
      setIsStarting(true);
      setScannerError("");
      scannedRef.current = false;

      try {
        if (!videoRef.current) {
          throw new Error("Camera element not ready");
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera is not supported by this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const controls = await reader.decodeFromVideoElement(
          videoRef.current,
          (result, error) => {
            if (!mounted) return;

            if (result && !scannedRef.current) {
              scannedRef.current = true;
              const scannedBarcode = result.getText()?.trim();

              if (!scannedBarcode) {
                scannedRef.current = false;
                return;
              }

              setProduct((prev) => ({ ...prev, barcode: scannedBarcode }));
              toast.success(`Barcode Scanned: ${scannedBarcode}`);

              setTimeout(() => {
                if (mounted) {
                  closeScanner();
                }
              }, 200);
            }
          }
        );

        if (mounted) {
          controlsRef.current = controls;
          setIsStarting(false);
        }
      } catch (error) {
        console.error("Barcode scanner error:", error);
        if (!mounted) return;
        setIsStarting(false);
        let message = "Unable to start camera.";
        if (error?.name === "NotAllowedError") {
          message = "Camera permission denied. Please enable camera access.";
        } else if (error?.name === "NotReadableError" || error?.message?.includes("in use") || error?.message?.includes("Readable")) {
          message = "Camera is already in use by another tab, window, or application. Please close other apps and try again.";
        } else if (error?.message) {
          message = error.message;
        }
        setScannerError(message);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [scannerOpen]);

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
    }
  };

  const generateSKUAndCode = () => {
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const code = `PRD-${randomStr}${timestamp}`;
    const sku = `SKU-${randomStr}-${timestamp}`;
    setProduct((prev) => ({
      ...prev,
      code,
      sku,
    }));
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [catRes, brandRes, unitRes, suppRes] = await Promise.allSettled([
        apiClient.get("/categories"),
        apiClient.get("/brands"),
        apiClient.get("/units"),
        apiClient.get("/suppliers"),
      ]);

      if (catRes.status === "fulfilled") {
        const catList = catRes.value.data?.data || catRes.value.data || [];
        setCategories(Array.isArray(catList) ? catList : []);
      }
      if (brandRes.status === "fulfilled") {
        const brandList = brandRes.value.data?.data || brandRes.value.data || [];
        setBrands(Array.isArray(brandList) ? brandList : []);
      }
      if (unitRes.status === "fulfilled") {
        const unitList = unitRes.value.data?.data || unitRes.value.data || [];
        setUnits(Array.isArray(unitList) && unitList.length > 0 ? unitList : DEFAULT_UNITS);
      } else {
        setUnits(DEFAULT_UNITS);
      }
      if (suppRes.status === "fulfilled") {
        const rawSupp = suppRes.value.data?.data || suppRes.value.data || [];
        const suppArray = Array.isArray(rawSupp) ? rawSupp : [];
        const retailSupp = suppArray.filter((s) => s.isTextile !== true && s.category !== "TEXTILE");
        setSuppliers(retailSupp.length > 0 ? retailSupp : suppArray);
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
      setUnits(DEFAULT_UNITS);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!product.name.trim()) {
      showWarning("Validation Required", "Please enter a product name.");
      return false;
    }
    if (!product.sellingPrice || Number(product.sellingPrice) <= 0) {
      showWarning("Validation Required", "Please specify a valid selling price.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const skuCode = product.sku.trim() || `RET-${Date.now().toString().slice(-6)}`;

    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("sku", skuCode);
      formData.append("barcode", product.barcode.trim());
      formData.append("description", product.description.trim());
      formData.append("isTextile", "false");
      formData.append("hasVariants", "false");
      formData.append("status", product.status);

      if (product.categoryId) formData.append("categoryId", product.categoryId);
      if (product.subcategoryId) formData.append("subcategoryId", product.subcategoryId);
      if (product.brandId) formData.append("brandId", product.brandId);
      if (product.baseUnitId) formData.append("baseUnitId", product.baseUnitId);

      formData.append("stockUnit", product.stockUnit);
      formData.append("initialStock", product.initialStock || "0");
      formData.append("openingStockDate", product.openingStockDate);
      formData.append("reorderLevel", product.reorderLevel || "10");
      formData.append("minimumStock", product.minimumStock || "5");
      formData.append("maximumStock", product.maximumStock || "500");
      formData.append("warehouseLocation", product.warehouseLocation);
      formData.append("rackLocation", product.rackLocation);

      formData.append("costPrice", product.costPrice || "0");
      formData.append("sellingPrice", product.sellingPrice || "0");
      formData.append("wholesalePrice", product.wholesalePrice || "0");
      formData.append("retailPrice", product.retailPrice || "0");
      formData.append("discountValue", product.discountValue || "0");
      formData.append("discountType", product.discountType);
      formData.append("taxRate", product.taxRate || "0");

      if (product.supplierId) formData.append("supplierId", product.supplierId);
      formData.append("supplierProductCode", product.supplierProductCode);

      if (image) {
        formData.append("image", image);
      }

      await apiClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Retail Product "${product.name}" created successfully!`);
      setTimeout(() => {
        router.push("/admin/products/view");
      }, 800);
    } catch (error) {
      console.error("Error creating retail product:", error);
      const errMsg = error.response?.data?.message || "Failed to create retail product.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (stepNum, sectionId) => {
    setActiveStep(stepNum);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      {/* HERO HEADER BANNER */}
      <div className={styles.heroBanner}>
        <div>
          <span className={styles.badgePill}>
            <FiShoppingBag size={13} /> Commercial Retail ERP
          </span>
          <h1 className={styles.heroTitle}>Add Retail Product</h1>
          <p className={styles.heroSubtitle}>
            Register packaged goods, electronics, or retail stock. Clean, simple, and ready for instant POS barcode scanning.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/admin/products/view")}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            <FiSave size={16} />
            {submitting ? "Saving Product..." : "Save Product"}
          </button>
        </div>
      </div>

      {/* VISUAL STEPPER NAVIGATION */}
      <div className={styles.stepperNav}>
        <div
          className={`${styles.stepItem} ${activeStep === 1 ? styles.activeStep : ""}`}
          onClick={() => scrollToSection(1, "sec-basic-info")}
        >
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepTitle}>Basic Info</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 2 ? styles.activeStep : ""}`}
          onClick={() => scrollToSection(2, "sec-inventory")}
        >
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepTitle}>Inventory Details</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 3 ? styles.activeStep : ""}`}
          onClick={() => scrollToSection(3, "sec-pricing")}
        >
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepTitle}>Pricing & Taxes</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 4 ? styles.activeStep : ""}`}
          onClick={() => scrollToSection(4, "sec-supplier")}
        >
          <div className={styles.stepNumber}>4</div>
          <span className={styles.stepTitle}>Supplier & Photo</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className={styles.formLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.mainColumn}>
          {/* SECTION 1: Basic Information */}
          <div id="sec-basic-info" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.cardIconBox}>
                  <FiPackage />
                </div>
                <h2>1. Basic Information</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>General Fields</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>
                  Product Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Product Code / SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={product.sku}
                    onChange={handleChange}
                    placeholder="Auto-generated (e.g. RET-849201)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Barcode / EAN</label>
                  <div className={styles.inputWithButton}>
                    <input
                      type="text"
                      name="barcode"
                      value={product.barcode}
                      onChange={handleChange}
                      placeholder="e.g. 8901234567890"
                    />
                    <button
                      type="button"
                      className={styles.scanButton}
                      onClick={() => setScannerOpen(true)}
                      title="Scan barcode with camera"
                    >
                      <FiCamera size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Category <span className={styles.required}>*</span></label>
                  <select
                    name="categoryId"
                    value={product.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={product.subcategory}
                    onChange={handleChange}
                    placeholder="e.g. Audio & Accessories"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Brand</label>
                  <select
                    name="brandId"
                    value={product.brandId}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    name="status"
                    value={product.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">Active (In Catalog)</option>
                    <option value="INACTIVE">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Product Description</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter detailed retail product summary, specifications, or usage guidelines..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Inventory Details */}
          <div id="sec-inventory" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.cardIconBox}>
                  <FiArchive />
                </div>
                <h2>2. Inventory Details</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Stock Metrics</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Stock Unit <span className={styles.required}>*</span></label>
                  <select
                    name="stockUnit"
                    value={product.stockUnit}
                    onChange={handleChange}
                  >
                    {DEFAULT_UNITS.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    name="initialStock"
                    value={product.initialStock}
                    onChange={handleChange}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Opening Stock Date</label>
                  <input
                    type="date"
                    name="openingStockDate"
                    value={product.openingStockDate}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Reorder Level (Alert Threshold)</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={product.reorderLevel}
                    onChange={handleChange}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={product.minimumStock}
                    onChange={handleChange}
                    placeholder="5"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Maximum Stock Level (Optional)</label>
                  <input
                    type="number"
                    name="maximumStock"
                    value={product.maximumStock}
                    onChange={handleChange}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Warehouse / Store Location</label>
                  <input
                    type="text"
                    name="warehouseLocation"
                    value={product.warehouseLocation}
                    onChange={handleChange}
                    placeholder="Main Store Warehouse"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Rack / Shelf / Bin Location</label>
                  <input
                    type="text"
                    name="rackLocation"
                    value={product.rackLocation}
                    onChange={handleChange}
                    placeholder="e.g. Shelf A-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Pricing & Taxes */}
          <div id="sec-pricing" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.cardIconBox}>
                  <FiDollarSign />
                </div>
                <h2>3. Pricing & Taxes</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Rates & GST</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Purchase Cost (₹)</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={product.costPrice}
                    onChange={handleChange}
                    placeholder="1200"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Selling Price (₹) <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={product.sellingPrice}
                    onChange={handleChange}
                    placeholder="1800"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Wholesale Price (₹)</label>
                  <input
                    type="number"
                    name="wholesalePrice"
                    value={product.wholesalePrice}
                    onChange={handleChange}
                    placeholder="1500"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Retail Price / MRP (₹)</label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={product.retailPrice}
                    onChange={handleChange}
                    placeholder="1999"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Discount Value</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      name="discountValue"
                      value={product.discountValue}
                      onChange={handleChange}
                      placeholder="0"
                      step="0.01"
                      style={{ width: "100%" }}
                    />
                    <select
                      name="discountType"
                      value={product.discountType}
                      onChange={handleChange}
                      style={{ width: "130px" }}
                    >
                      <option value="PERCENT">%</option>
                      <option value="FIXED">Flat (₹)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Tax / GST Rate (%)</label>
                  <select
                    name="taxRate"
                    value={product.taxRate}
                    onChange={handleChange}
                  >
                    <option value="0">0% (Exempted)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Supplier Information */}
          <div id="sec-supplier" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.cardIconBox}>
                  <FiTruck />
                </div>
                <h2>4. Supplier Information</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Goods Vendors</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Default Supplier</label>
                  <select
                    name="supplierId"
                    value={product.supplierId}
                    onChange={handleChange}
                  >
                    <option value="">Select Goods Vendor / Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Supplier Product Code</label>
                  <input
                    type="text"
                    name="supplierProductCode"
                    value={product.supplierProductCode}
                    onChange={handleChange}
                    placeholder="VEND-SKU-992"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Guidance */}
        <div className={styles.sideColumn}>
          {/* Photo Upload Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.cardIconBox}>
                  <FiUpload />
                </div>
                <h2>Product Photo</h2>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div
                className={styles.imageUploadBox}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className={styles.previewContainer}>
                    <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removeImgBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <FiUpload className={styles.uploadIcon} />
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Upload Photo</span>
                    <small>Supports PNG, JPG, WEBP up to 5MB</small>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Quick Info Card */}
          <div className={styles.card} style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <FiCheckCircle style={{ color: "#4f46e5", fontSize: "20px" }} />
                <h2>Retail ERP Guidance</h2>
              </div>
            </div>
            <div className={styles.cardBody} style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 12px 0" }}>
                <strong>Barcode POS Scanning:</strong> Assign barcode values to enable instant checkout scanning at POS terminals.
              </p>
              <p style={{ margin: "0 0 12px 0" }}>
                <strong>Reorder Thresholds:</strong> Receive automated reorder alerts when available quantity falls below minimum stock.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Multi-tier Pricing:</strong> Set wholesale and retail MRP tiers for targeted store pricing policies.
              </p>
            </div>
          </div>
        </div>
      </form>

      {scannerOpen && (
        <div className={styles.scannerOverlay}>
          <div className={styles.scannerModal}>
            <div className={styles.scannerHeader}>
              <h3>Scan Barcode / EAN</h3>
              <button className={styles.scannerCloseBtn} onClick={closeScanner}>
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.scannerBody}>
              <div className={styles.videoWrapper}>
                <video ref={videoRef} playsInline />
                <div className={styles.scannerLaser} />
              </div>

              {scannerError && (
                <div className={styles.scannerError}>
                  {scannerError}
                </div>
              )}

              <div className={styles.scannerStatus}>
                {isStarting ? "Accessing camera..." : "Point your camera at a barcode to scan"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
