"use client";

import { useRef, useState, useEffect, use } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiUpload,
  FiSave,
  FiPackage,
  FiX,
  FiArrowLeft,
  FiLayers,
  FiDollarSign,
  FiArchive,
  FiTruck,
  FiGrid,
  FiPlus,
  FiTrash2,
  FiZap,
  FiCamera,
} from "react-icons/fi";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Loader2 } from "lucide-react";

import styles from "../../add/addProducts.module.css";
import apiClient from "@/services/apiClient";

const DEFAULT_UNITS = [
  { id: "meter", name: "Meter", code: "m" },
  { id: "yard", name: "Yard", code: "yd" },
  { id: "pcs", name: "Pieces", code: "pcs" },
  { id: "roll", name: "Roll", code: "roll" },
  { id: "kg", name: "Kilogram", code: "kg" },
];

const WEAVE_TYPES = [
  "Plain weave",
  "Twill",
  "Satin",
  "Jacquard",
  "Dobby",
  "Knit",
  "Velvet",
];

const PATTERN_TYPES = [
  "Plain / Solid",
  "Printed",
  "Striped",
  "Checkered",
  "Floral",
  "Embroidered",
  "Damask",
  "Geometrical",
];

const TEXTURE_FINISHES = [
  "Soft",
  "Matte",
  "Glossy",
  "Brushed",
  "Silky",
  "Rough / Coarse",
  "Mercerized",
];

const SUBCATEGORIES = [
  "Shirting",
  "Suiting",
  "Curtain / Drapery",
  "Upholstery",
  "Dress Material",
  "Denim",
  "Lining",
  "Home Textile",
];

const initialProduct = {
  name: "",
  sku: "",
  barcode: "",
  categoryId: "",
  subcategory: "Shirting",
  brandId: "",
  baseUnitId: "",
  description: "",

  isTextile: true,
  fabricComposition: "",
  gsm: "",
  rollWidth: "",
  widthUnit: "Inches",
  color: "",
  colorCode: "",
  pattern: "Plain / Solid",
  weaveType: "Plain weave",
  textureFinish: "Soft",

  stockUnit: "Meter",
  initialStock: "",
  openingStockDate: "",
  reorderLevel: "20",
  minimumStock: "10",
  maximumStock: "1000",
  warehouseLocation: "",
  rackLocation: "",
  numberOfRolls: "",

  costPrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  retailPrice: "",
  discountValue: "",
  discountType: "PERCENT",
  taxRate: "",

  supplierId: "",
  supplierProductCode: "",
  leadTime: "",

  hasVariants: false,
  status: "ACTIVE",
};

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [quickColors, setQuickColors] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchFormData();
    fetchProduct();
  }, [id]);

  const fetchFormData = async () => {
  const fetchBrands = async () => {
    try {
      let rawBrand = null;
      try {
        const res = await apiClient.get("/brands");
        rawBrand = res.data;
      } catch (e) {
        const res = await axios.get("http://localhost:5000/api/brands");
        rawBrand = res.data;
      }
      const brandList = Array.isArray(rawBrand?.data)
        ? rawBrand.data
        : Array.isArray(rawBrand)
        ? rawBrand
        : Array.isArray(rawBrand?.brands)
        ? rawBrand.brands
        : [];
      setBrands(brandList);
    } catch (err) {
      console.error("Error fetching live brands:", err);
      setBrands([]);
    }
  };

  const fetchFormData = async () => {
    try {
      fetchBrands();
      const [catRes, unitRes, suppRes] = await Promise.allSettled([
        apiClient.get("/categories"),
        apiClient.get("/units"),
        apiClient.get("/suppliers"),
      ]);

      if (catRes.status === "fulfilled" && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
      }
      if (unitRes.status === "fulfilled" && unitRes.value.data?.data?.length > 0) {
        setUnits(unitRes.value.data.data);
      } else {
        setUnits(DEFAULT_UNITS);
      }
      if (suppRes.status === "fulfilled" && suppRes.value.data?.data) {
        setSuppliers(suppRes.value.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch form metadata", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      if (res.data?.data) {
        const p = res.data.data;
        setProduct({
          name: p.name || "",
          sku: p.sku || "",
          barcode: p.barcode || p.barcodes?.[0]?.barcode || "",
          categoryId: p.categoryId || "",
          subcategory: p.subcategory || "Shirting",
          brandId: p.brandId || "",
          baseUnitId: p.unitId || "",
          description: p.description || "",

          isTextile: p.isTextile !== false,
          fabricComposition: p.fabricComposition || "",
          gsm: p.gsm || "",
          rollWidth: p.rollWidth || "",
          widthUnit: p.widthUnit || "Inches",
          color: p.color || "",
          colorCode: p.colorCode || "#003366",
          pattern: p.pattern || "Plain / Solid",
          weaveType: p.weaveType || "Plain weave",
          textureFinish: p.textureFinish || "Soft",

          stockUnit: p.stockUnit || "Meter",
          initialStock: p.initialStock || "",
          openingStockDate: p.openingStockDate ? p.openingStockDate.split("T")[0] : "",
          reorderLevel: p.reorderLevel || "20",
          minimumStock: p.minimumStock || "10",
          maximumStock: p.maximumStock || "1000",
          warehouseLocation: p.warehouseLocation || "",
          rackLocation: p.rackLocation || "",
          numberOfRolls: p.numberOfRolls || "",

          costPrice: p.costPrice || "",
          sellingPrice: p.sellingPrice || "",
          wholesalePrice: p.wholesalePrice || "",
          retailPrice: p.retailPrice || "",
          discountValue: p.discountValue || "",
          discountType: p.discountType || "PERCENT",
          taxRate: p.taxRate || "",

          supplierId: p.supplierId || "",
          supplierProductCode: p.supplierProductCode || "",
          leadTime: p.leadTime || "",

          hasVariants: Boolean(p.hasVariants || (p.variants && p.variants.length > 0)),
          status: p.status || "ACTIVE",
        });

        if (p.variants && p.variants.length > 0) {
          setVariants(
            p.variants.map((v) => ({
              id: v.id || Date.now().toString(),
              sku: v.sku || "",
              color: v.color || "",
              colorCode: v.colorCode || "#000000",
              rollWidth: v.rollWidth || "",
              widthUnit: v.widthUnit || "Inches",
              gsm: v.gsm || "",
              pattern: v.pattern || "Plain / Solid",
              weaveType: v.weaveType || "Plain weave",
              textureFinish: v.textureFinish || "Soft",
              stock: v.stock || "0",
              numberOfRolls: v.numberOfRolls || "0",
              costPrice: v.costPrice || "",
              sellingPrice: v.sellingPrice || "",
              wholesalePrice: v.wholesalePrice || "",
            }))
          );
        }

        if (p.image) {
          setImagePreview(
            p.image.startsWith("http")
              ? p.image
              : `http://localhost:5000${p.image.startsWith("/") ? "" : "/"}${p.image}`
          );
        }
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      console.error("Failed to fetch product", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================
     DYNAMIC VARIANTS HANDLERS
  ========================= */

  const handleAddVariant = () => {
    const variantIndex = variants.length + 1;
    const baseSku = product.sku || "TEX";
    const newVariant = {
      id: Date.now().toString(),
      sku: `${baseSku}-VAR-${variantIndex}`,
      color: "",
      colorCode: "#000000",
      rollWidth: product.rollWidth || "",
      widthUnit: product.widthUnit || "Inches",
      gsm: product.gsm || "",
      pattern: product.pattern || "Plain / Solid",
      weaveType: product.weaveType || "Plain weave",
      textureFinish: product.textureFinish || "Soft",
      stock: "100",
      numberOfRolls: "2",
      costPrice: product.costPrice || "",
      sellingPrice: product.sellingPrice || "",
      wholesalePrice: product.wholesalePrice || "",
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleRemoveVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleGenerateQuickVariants = () => {
    if (!quickColors.trim()) {
      toast.error("Please enter colors separated by commas");
      return;
    }

    const colorList = quickColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const baseSku = product.sku || "FAB";

    const newGenerated = colorList.map((col, idx) => ({
      id: `gen-${Date.now()}-${idx}`,
      sku: `${baseSku}-${col.substring(0, 3).toUpperCase()}-${idx + 1}`,
      color: col,
      colorCode: "#000000",
      rollWidth: product.rollWidth || "58",
      widthUnit: product.widthUnit || "Inches",
      gsm: product.gsm || "180",
      pattern: product.pattern || "Plain / Solid",
      weaveType: product.weaveType || "Plain weave",
      textureFinish: product.textureFinish || "Soft",
      stock: product.initialStock || "250",
      numberOfRolls: product.numberOfRolls || "5",
      costPrice: product.costPrice || "",
      sellingPrice: product.sellingPrice || "",
      wholesalePrice: product.wholesalePrice || "",
    }));

    setVariants((prev) => [...prev, ...newGenerated]);
    setQuickColors("");
    toast.success(`Added ${newGenerated.length} new variants!`);
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only PNG, JPG or WEBP images.");
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
    if (product.barcode) formData.append("barcode", product.barcode);
    if (product.categoryId) formData.append("categoryId", product.categoryId);
    if (product.subcategory) formData.append("subcategory", product.subcategory);
    if (product.brandId) formData.append("brandId", product.brandId);
    if (product.baseUnitId) formData.append("unitId", product.baseUnitId);

    formData.append("costPrice", parseFloat(product.costPrice || 0));
    formData.append("sellingPrice", parseFloat(product.sellingPrice || 0));
    if (product.wholesalePrice) formData.append("wholesalePrice", parseFloat(product.wholesalePrice));
    if (product.retailPrice) formData.append("retailPrice", parseFloat(product.retailPrice));

    if (product.discountValue) {
      formData.append("discountValue", parseFloat(product.discountValue));
      formData.append("discountType", product.discountType);
    }
    if (product.taxRate) formData.append("taxRate", parseFloat(product.taxRate));
    if (product.description) formData.append("description", product.description);
    if (product.status) formData.append("status", product.status);

    // Fabric Specs
    formData.append("isTextile", product.isTextile);
    if (product.fabricComposition) formData.append("fabricComposition", product.fabricComposition);
    if (product.gsm) formData.append("gsm", parseFloat(product.gsm));
    if (product.rollWidth) formData.append("rollWidth", parseFloat(product.rollWidth));
    if (product.widthUnit) formData.append("widthUnit", product.widthUnit);
    if (product.color) formData.append("color", product.color);
    if (product.colorCode) formData.append("colorCode", product.colorCode);
    if (product.pattern) formData.append("pattern", product.pattern);
    if (product.weaveType) formData.append("weaveType", product.weaveType);
    if (product.textureFinish) formData.append("textureFinish", product.textureFinish);

    // Inventory Details
    if (product.stockUnit) formData.append("stockUnit", product.stockUnit);
    if (product.initialStock) formData.append("initialStock", parseFloat(product.initialStock));
    if (product.openingStockDate) formData.append("openingStockDate", product.openingStockDate);
    if (product.reorderLevel) formData.append("reorderLevel", parseInt(product.reorderLevel));
    if (product.minimumStock) formData.append("minimumStock", parseInt(product.minimumStock));
    if (product.maximumStock) formData.append("maximumStock", parseInt(product.maximumStock));
    if (product.warehouseLocation) formData.append("warehouseLocation", product.warehouseLocation);
    if (product.rackLocation) formData.append("rackLocation", product.rackLocation);
    if (product.numberOfRolls) formData.append("numberOfRolls", parseInt(product.numberOfRolls));

    // Supplier Info
    if (product.supplierId) formData.append("supplierId", product.supplierId);
    if (product.supplierProductCode) formData.append("supplierProductCode", product.supplierProductCode);
    if (product.leadTime) formData.append("leadTime", parseInt(product.leadTime));

    // Variants
    const hasVar = product.hasVariants || variants.length > 0;
    formData.append("hasVariants", hasVar);
    formData.append("variants", JSON.stringify(variants));

    if (image) {
      formData.append("image", image);
    }

    try {
      await apiClient.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Fabric product updated successfully!");
      setTimeout(() => {
        router.push(`/admin/products/details/${id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to update product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite" }} size={40} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Toaster position="top-right" />
      <div className={styles.main}>
        <div className={styles.container}>
          {/* PAGE HEADER */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div>
                <h1>Edit Textile Fabric Product</h1>
                <p>Update fabric specifications, pricing tiers, inventory levels, and dynamic product variants.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/admin/products/view")}
                style={{
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
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
                {submitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* FORM */}
          <form id="edit-product-form" className={styles.form} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
            {/* LEFT SECTION */}
            <div className={styles.left}>
              {/* 1. BASIC PRODUCT INFORMATION */}
              <div className={styles.card}>
                <h2>
                  <FiPackage />
                  1. Basic Product Information
                </h2>

                <div className={styles.grid}>
                  <div>
                    <label htmlFor="name">Product Name *</label>
                    <input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="e.g. Jacquard Damask Fabric"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sku">Product Code / SKU *</label>
                    <input
                      id="sku"
                      name="sku"
                      value={product.sku}
                      onChange={handleChange}
                      placeholder="e.g. FAB-JD-001"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="barcode">Barcode</label>
                    <div className={styles.inputWithButton}>
                      <input
                        id="barcode"
                        name="barcode"
                        value={product.barcode}
                        onChange={handleChange}
                        placeholder="e.g. 890123456789"
                        style={{ flex: 1, marginBottom: 0 }}
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

                  <div>
                    <label htmlFor="categoryId">Category *</label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={product.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">Choose Category (Cotton, Silk, Linen...)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subcategory">Subcategory</label>
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={product.subcategory}
                      onChange={handleChange}
                    >
                      {SUBCATEGORIES.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brandId">Brand</label>
                    <select
                      id="brandId"
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
                </div>

                <label htmlFor="description">Product Description</label>
                <textarea
                  id="description"
                  rows={4}
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Enter detailed description of thread count, weave density, usages..."
                />
              </div>

              {/* 2. FABRIC SPECIFICATIONS */}
              <div className={styles.card}>
                <h2>
                  <FiLayers />
                  2. Fabric Specifications (Textile Features)
                </h2>

                <div className={styles.grid}>
                  <div>
                    <label htmlFor="fabricComposition">Fabric Composition</label>
                    <input
                      id="fabricComposition"
                      name="fabricComposition"
                      value={product.fabricComposition}
                      onChange={handleChange}
                      placeholder="e.g. 80% Cotton, 20% Silk"
                    />
                  </div>

                  <div>
                    <label htmlFor="gsm">GSM (g/m²)</label>
                    <input
                      id="gsm"
                      name="gsm"
                      type="number"
                      min="0"
                      value={product.gsm}
                      onChange={handleChange}
                      placeholder="e.g. 180"
                    />
                  </div>

                  <div>
                    <label htmlFor="rollWidth">Roll Width</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        id="rollWidth"
                        name="rollWidth"
                        type="number"
                        step="0.1"
                        value={product.rollWidth}
                        onChange={handleChange}
                        placeholder="58"
                        style={{ flex: 1 }}
                      />
                      <select
                        name="widthUnit"
                        value={product.widthUnit}
                        onChange={handleChange}
                        style={{ width: "110px" }}
                      >
                        <option value="Inches">Inches</option>
                        <option value="CM">CM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="color">Color Name & Code</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        id="color"
                        name="color"
                        value={product.color}
                        onChange={handleChange}
                        placeholder="e.g. Royal Blue"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="color"
                        name="colorCode"
                        value={product.colorCode || "#003366"}
                        onChange={handleChange}
                        style={{ width: "50px", padding: "2px", height: "44px", cursor: "pointer" }}
                        title="Pick Color"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pattern">Pattern / Design</label>
                    <select
                      id="pattern"
                      name="pattern"
                      value={product.pattern}
                      onChange={handleChange}
                    >
                      {PATTERN_TYPES.map((pat) => (
                        <option key={pat} value={pat}>
                          {pat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="weaveType">Weave Type</label>
                    <select
                      id="weaveType"
                      name="weaveType"
                      value={product.weaveType}
                      onChange={handleChange}
                    >
                      {WEAVE_TYPES.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="textureFinish">Texture / Finish</label>
                    <select
                      id="textureFinish"
                      name="textureFinish"
                      value={product.textureFinish}
                      onChange={handleChange}
                    >
                      {TEXTURE_FINISHES.map((tf) => (
                        <option key={tf} value={tf}>
                          {tf}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={product.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. INVENTORY DETAILS */}
              <div className={styles.card}>
                <h2>
                  <FiArchive />
                  3. Inventory Details
                </h2>

                <div className={styles.grid}>
                  <div>
                    <label htmlFor="stockUnit">Stock Unit *</label>
                    <select
                      id="stockUnit"
                      name="stockUnit"
                      value={product.stockUnit}
                      onChange={handleChange}
                      required
                    >
                      <option value="Meter">Meter</option>
                      <option value="Yard">Yard</option>
                      <option value="Piece">Piece</option>
                      <option value="Roll">Roll</option>
                      <option value="KG">KG</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="initialStock">Initial Stock Quantity</label>
                    <input
                      id="initialStock"
                      name="initialStock"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.initialStock}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div>
                    <label htmlFor="numberOfRolls">Number of Rolls</label>
                    <input
                      id="numberOfRolls"
                      name="numberOfRolls"
                      type="number"
                      min="0"
                      value={product.numberOfRolls}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label htmlFor="openingStockDate">Opening Stock Date</label>
                    <input
                      id="openingStockDate"
                      name="openingStockDate"
                      type="date"
                      value={product.openingStockDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="reorderLevel">Reorder Level</label>
                    <input
                      id="reorderLevel"
                      name="reorderLevel"
                      type="number"
                      min="0"
                      value={product.reorderLevel}
                      onChange={handleChange}
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label htmlFor="minimumStock">Minimum Stock Level</label>
                    <input
                      id="minimumStock"
                      name="minimumStock"
                      type="number"
                      min="0"
                      value={product.minimumStock}
                      onChange={handleChange}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label htmlFor="maximumStock">Maximum Stock Level (Optional)</label>
                    <input
                      id="maximumStock"
                      name="maximumStock"
                      type="number"
                      min="0"
                      value={product.maximumStock}
                      onChange={handleChange}
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label htmlFor="warehouseLocation">Warehouse / Store Location</label>
                    <input
                      id="warehouseLocation"
                      name="warehouseLocation"
                      value={product.warehouseLocation}
                      onChange={handleChange}
                      placeholder="Main Central Warehouse"
                    />
                  </div>

                  <div>
                    <label htmlFor="rackLocation">Rack / Shelf / Bin Location</label>
                    <input
                      id="rackLocation"
                      name="rackLocation"
                      value={product.rackLocation}
                      onChange={handleChange}
                      placeholder="Rack A-12-B"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PRICING & TAXES */}
              <div className={styles.card}>
                <h2>
                  <FiDollarSign />
                  4. Multi-Tier Pricing & Taxes
                </h2>

                <div className={styles.grid}>
                  <div>
                    <label htmlFor="costPrice">Purchase Cost / Cost Price</label>
                    <input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.costPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="sellingPrice">Selling Price *</label>
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
                    <label htmlFor="wholesalePrice">Wholesale Price</label>
                    <input
                      id="wholesalePrice"
                      name="wholesalePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.wholesalePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="retailPrice">Retail Price</label>
                    <input
                      id="retailPrice"
                      name="retailPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.retailPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="discountValue">Discount</label>
                    <div style={{ display: "flex", gap: "10px" }}>
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
                        style={{ width: "90px" }}
                      >
                        <option value="PERCENT">%</option>
                        <option value="FIXED">Fixed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="taxRate">Tax / GST Rate (%)</label>
                    <input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={product.taxRate}
                      onChange={handleChange}
                      placeholder="18"
                    />
                  </div>
                </div>
              </div>

              {/* 5. SUPPLIER & PURCHASE INFORMATION */}
              <div className={styles.card}>
                <h2>
                  <FiTruck />
                  5. Supplier & Purchase Information
                </h2>

                <div className={styles.grid}>
                  <div>
                    <label htmlFor="supplierId">Default Supplier</label>
                    <select
                      id="supplierId"
                      name="supplierId"
                      value={product.supplierId}
                      onChange={handleChange}
                    >
                      <option value="">Select Default Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="supplierProductCode">Supplier Product Code</label>
                    <input
                      id="supplierProductCode"
                      name="supplierProductCode"
                      value={product.supplierProductCode}
                      onChange={handleChange}
                      placeholder="SUP-TEX-9988"
                    />
                  </div>

                  <div>
                    <label htmlFor="leadTime">Lead Time (Days)</label>
                    <input
                      id="leadTime"
                      name="leadTime"
                      type="number"
                      min="0"
                      value={product.leadTime}
                      onChange={handleChange}
                      placeholder="7"
                    />
                  </div>
                </div>
              </div>

              {/* 6. PRODUCT VARIANTS (DYNAMIC MATRIX) */}
              <div className={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2>
                    <FiGrid />
                    6. Product Variants Matrix (Dynamic)
                  </h2>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600" }}>
                    <input
                      type="checkbox"
                      name="hasVariants"
                      checked={product.hasVariants || variants.length > 0}
                      onChange={(e) => {
                        handleChange(e);
                        if (e.target.checked && variants.length === 0) {
                          handleAddVariant();
                        }
                      }}
                    />
                    Enable Dynamic Product Variants
                  </label>
                </div>

                {(product.hasVariants || variants.length > 0) && (
                  <div>
                    {/* Quick Generator Box */}
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "16px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#166534", marginBottom: "8px" }}>
                        <FiZap /> Quick Color Variants Generator
                      </div>
                      <p style={{ fontSize: "13px", color: "#15803d", margin: "0 0 10px 0" }}>
                        Type color names separated by commas (e.g., <em>Blue, Black, White, Navy</em>) to add variant rows.
                      </p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          placeholder="Blue, Black, White, Crimson Red"
                          value={quickColors}
                          onChange={(e) => setQuickColors(e.target.value)}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #86efac" }}
                        />
                        <button
                          type="button"
                          onClick={handleGenerateQuickVariants}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#16a34a",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Generate Rows
                        </button>
                      </div>
                    </div>

                    {/* Variant Rows Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                            <th style={{ padding: "8px" }}>Variant SKU</th>
                            <th style={{ padding: "8px" }}>Color</th>
                            <th style={{ padding: "8px" }}>Width</th>
                            <th style={{ padding: "8px" }}>GSM</th>
                            <th style={{ padding: "8px" }}>Pattern</th>
                            <th style={{ padding: "8px" }}>Stock (m)</th>
                            <th style={{ padding: "8px" }}>Rolls</th>
                            <th style={{ padding: "8px" }}>Selling Price</th>
                            <th style={{ padding: "8px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => handleVariantChange(v.id, "sku", e.target.value)}
                                  style={{ padding: "6px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="text"
                                  placeholder="Color"
                                  value={v.color}
                                  onChange={(e) => handleVariantChange(v.id, "color", e.target.value)}
                                  style={{ padding: "6px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="text"
                                  placeholder="58 in"
                                  value={v.rollWidth}
                                  onChange={(e) => handleVariantChange(v.id, "rollWidth", e.target.value)}
                                  style={{ padding: "6px", width: "60px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="number"
                                  placeholder="180"
                                  value={v.gsm}
                                  onChange={(e) => handleVariantChange(v.id, "gsm", e.target.value)}
                                  style={{ padding: "6px", width: "60px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="text"
                                  placeholder="Plain"
                                  value={v.pattern}
                                  onChange={(e) => handleVariantChange(v.id, "pattern", e.target.value)}
                                  style={{ padding: "6px", width: "80px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="number"
                                  placeholder="500"
                                  value={v.stock}
                                  onChange={(e) => handleVariantChange(v.id, "stock", e.target.value)}
                                  style={{ padding: "6px", width: "70px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="number"
                                  placeholder="10"
                                  value={v.numberOfRolls}
                                  onChange={(e) => handleVariantChange(v.id, "numberOfRolls", e.target.value)}
                                  style={{ padding: "6px", width: "60px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={v.sellingPrice}
                                  onChange={(e) => handleVariantChange(v.id, "sellingPrice", e.target.value)}
                                  style={{ padding: "6px", width: "80px", fontSize: "12px" }}
                                />
                              </td>
                              <td style={{ padding: "6px" }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(v.id)}
                                  style={{
                                    padding: "6px",
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#ef4444",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                  title="Delete Variant"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      style={{
                        marginTop: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      <FiPlus /> Add Single Variant Row
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className={styles.right}>
              {/* PRODUCT IMAGE */}
              <div className={styles.card}>
                <h2>Fabric Image / Sample Swatch</h2>

                <div className={styles.uploadBox}>
                  {imagePreview ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className={styles.imagePreview}
                      />
                      <p className={styles.fileName}>{image ? image.name : "Current Swatch"}</p>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={handleRemoveImage}
                      >
                        <FiX /> Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload size={40} />
                      <p>Click or Drag swatch image here</p>
                      <span>PNG, JPG, WEBP up to 5MB</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Swatch Image
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* QUICK TIPS */}
              <div className={styles.card}>
                <h2>Editing Tips</h2>

                <ul className={styles.tips}>
                  <li>
                    Updating product specs will reflect across Inventory, Sales, and POS catalog instantly.
                  </li>
                  <li>
                    Variants can be updated individually without altering the base fabric product SKU.
                  </li>
                </ul>
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
      </div>
    </div>
  );
}
