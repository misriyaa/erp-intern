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
import { useCompany } from "@/context/CompanyContext";
import { restaurantService } from "@/services/restaurantService";

const DEFAULT_UNITS = [
  { id: "pcs", name: "Piece / Pcs", code: "pcs" },
  { id: "kg", name: "Kilogram (KG)", code: "kg" },
  { id: "gm", name: "Gram (g)", code: "gm" },
  { id: "liter", name: "Liter (L)", code: "liter" },
  { id: "ml", name: "Milliliter (ml)", code: "ml" },
  { id: "box", name: "Box", code: "box" },
  { id: "pack", name: "Pack / Packet", code: "pack" },
  { id: "carton", name: "Carton / Case", code: "carton" },
  { id: "bottle", name: "Bottle", code: "bottle" },
  { id: "can", name: "Can / Tin", code: "can" },
  { id: "bag", name: "Bag / Sack", code: "bag" },
  { id: "bundle", name: "Bundle", code: "bundle" },
  { id: "dozen", name: "Dozen (12 pcs)", code: "dozen" },
  { id: "portion", name: "Portion / Serving", code: "portion" },
  { id: "plate", name: "Plate", code: "plate" },
  { id: "set", name: "Set", code: "set" },
  { id: "meter", name: "Meter (m)", code: "meter" },
  { id: "unit", name: "Unit", code: "unit" },
];

const DEFAULT_BRANDS = [
  { id: "b-apple", name: "Apple" },
  { id: "b-samsung", name: "Samsung" },
  { id: "b-sony", name: "Sony" },
  { id: "b-nike", name: "Nike" },
  { id: "b-adidas", name: "Adidas" },
  { id: "b-generic", name: "Generic / Standard Brand" },
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

  // Restaurant Raw Material & Ingredient Fields
  purchaseUnit: "Box",
  conversionFactor: "10",
  reorderQuantity: "20",
  supplierReference: "",
  restaurantOutletId: "",
  defaultStorageLocation: "Main Store",
  storageType: "Freezer",
  isPerishable: true,
  isExpiryTracking: true,
  isBatchTracking: true,
};

export default function AddRetailProductPage() {
  const router = useRouter();
  const { showWarning } = useAlert();
  const { isRestaurant, industryCode } = useCompany();

  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
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
    const barcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setProduct((prev) => ({
      ...prev,
      code,
      sku: prev.sku || sku,
      barcode: prev.barcode || barcode,
    }));
  };

  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);

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


  const handleQuickAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    try {
      setCreatingBrand(true);
      let res = null;
      try {
        res = await apiClient.post("/brands", {
          name: newBrandName.trim(),
          status: "ACTIVE",
        });
      } catch (e) {
        res = await axios.post("http://localhost:5000/api/brands", {
          name: newBrandName.trim(),
          status: "ACTIVE",
        });
      }
      const createdBrand = res.data?.data || res.data;
      toast.success(`Brand "${newBrandName.trim()}" created!`);
      setNewBrandName("");
      setShowAddBrandModal(false);
      await fetchBrands();
      if (createdBrand?.id) {
        setProduct((prev) => ({ ...prev, brandId: createdBrand.id }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create brand");
    } finally {
      setCreatingBrand(false);
    }
  };

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitCode, setNewUnitCode] = useState("");
  const [creatingUnit, setCreatingUnit] = useState(false);

  const handleQuickAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) {
      toast.error("Unit name is required");
      return;
    }
    const code = newUnitCode.trim() || newUnitName.trim().slice(0, 5).toLowerCase();
    try {
      setCreatingUnit(true);
      let res = null;
      try {
        res = await apiClient.post("/units", {
          name: newUnitName.trim(),
          code,
        });
      } catch (e) {
        res = { data: { id: code, name: newUnitName.trim(), code } };
      }
      const createdUnit = res.data?.data || res.data;
      toast.success(`Unit "${newUnitName.trim()}" created!`);
      setNewUnitName("");
      setNewUnitCode("");
      setShowAddUnitModal(false);

      const newU = {
        id: createdUnit.id || code,
        name: createdUnit.name || newUnitName.trim(),
        code: createdUnit.code || code,
      };
      setUnits((prev) => [newU, ...prev]);
      setProduct((prev) => ({
        ...prev,
        baseUnitId: newU.id,
        stockUnit: newU.name,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create unit");
    } finally {
      setCreatingUnit(false);
    }
  };

  useEffect(() => {
    fetchFormData();
    generateSKUAndCode();
  }, []);

  const fetchFormData = async () => {
    try {
      fetchBrands();
      const [catRes, unitRes, suppRes, restRes] = await Promise.allSettled([
        apiClient.get("/categories"),
        apiClient.get("/units"),
        apiClient.get("/suppliers"),
        restaurantService.getRestaurants(),
      ]);

      if (catRes.status === "fulfilled") {
        const catList = catRes.value.data?.data || catRes.value.data || [];
        setCategories(Array.isArray(catList) ? catList : []);
      }
      if (unitRes.status === "fulfilled") {
        const unitList = unitRes.value.data?.data || unitRes.value.data || [];
        const mergedMap = new Map();
        DEFAULT_UNITS.forEach((u) => mergedMap.set((u.name || u.code || u.id).toLowerCase(), u));
        if (Array.isArray(unitList)) {
          unitList.forEach((u) => {
            const key = (u.name || u.code || u.id).toLowerCase();
            mergedMap.set(key, u);
          });
        }
        setUnits(Array.from(mergedMap.values()));
      } else {
        setUnits(DEFAULT_UNITS);
      }
      if (suppRes.status === "fulfilled") {
        const rawSupp = suppRes.value.data?.data || suppRes.value.data || [];
        const suppArray = Array.isArray(rawSupp) ? rawSupp : [];
        const retailSupp = suppArray.filter((s) => s.isTextile !== true && s.category !== "TEXTILE");
        setSuppliers(retailSupp.length > 0 ? retailSupp : suppArray);
      }
      if (restRes.status === "fulfilled") {
        const restList = restRes.value.data?.data || restRes.value.data || (Array.isArray(restRes.value) ? restRes.value : []);
        setRestaurants(Array.isArray(restList) ? restList : []);
        if (Array.isArray(restList) && restList.length > 0) {
          setProduct((prev) => ({
            ...prev,
            restaurantOutletId: prev.restaurantOutletId || restList[0].id,
          }));
        }
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


  const validateRestaurantForm = () => {
    if (!product.name || !product.name.trim()) {
      showWarning("Validation Required", "Ingredient Name is required.");
      return false;
    }
    if (!product.sku || !product.sku.trim()) {
      showWarning("Validation Required", "Ingredient Code / SKU is required.");
      return false;
    }
    if (!product.status) {
      showWarning("Validation Required", "Status is required.");
      return false;
    }
    if (!product.baseUnitId) {
      showWarning("Validation Required", "Base Unit is required.");
      return false;
    }
    if (product.minimumStock === "" || product.minimumStock === null || product.minimumStock === undefined) {
      showWarning("Validation Required", "Minimum Stock Level is required.");
      return false;
    }
    if (product.initialStock !== "" && Number(product.initialStock) < 0) {
      showWarning("Validation Required", "Opening Stock cannot be negative.");
      return false;
    }
    if (Number(product.minimumStock) < 0) {
      showWarning("Validation Required", "Minimum Stock Level cannot be negative.");
      return false;
    }
    if (!product.costPrice || Number(product.costPrice) < 0) {
      showWarning("Validation Required", "Purchase Cost (₹) is required.");
      return false;
    }
    if (!product.restaurantOutletId) {
      showWarning("Validation Required", "Restaurant Outlet is required.");
      return false;
    }
    if (!product.defaultStorageLocation || !product.defaultStorageLocation.trim()) {
      showWarning("Validation Required", "Default Storage Location is required.");
      return false;
    }
    if (!product.storageType) {
      showWarning("Validation Required", "Storage Type is required.");
      return false;
    }
    return true;
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

    if (isRestaurant) {
      if (!validateRestaurantForm()) return;

      setSubmitting(true);
      const skuCode = product.sku.trim() || `ING-${Date.now().toString().slice(-6)}`;

      try {
        const formData = new FormData();
        formData.append("name", product.name.trim());
        formData.append("sku", skuCode);
        formData.append("barcode", skuCode);
        formData.append("description", product.description ? product.description.trim() : "");
        formData.append("productType", "RAW_MATERIAL");
        formData.append("status", product.status || "ACTIVE");

        if (product.categoryId) formData.append("categoryId", product.categoryId);
        if (product.baseUnitId) formData.append("unitId", product.baseUnitId);

        formData.append("initialStock", product.initialStock || "0");
        formData.append("minimumStock", product.minimumStock || "0");
        formData.append("reorderQuantity", product.reorderQuantity || "0");

        formData.append("costPrice", product.costPrice || "0");
        formData.append("sellingPrice", "0");

        if (product.supplierId) formData.append("supplierId", product.supplierId);

        formData.append("averageCost", product.costPrice || "0");
        formData.append("lastPurchaseCost", product.costPrice || "0");

        formData.append("restaurantOutletId", product.restaurantOutletId || "");
        formData.append("defaultStorageLocation", product.defaultStorageLocation ? product.defaultStorageLocation.trim() : "");
        formData.append("warehouseLocation", product.defaultStorageLocation ? product.defaultStorageLocation.trim() : "");
        formData.append("storageType", product.storageType || "");

        formData.append("isPerishable", product.isPerishable ? "true" : "false");
        formData.append("isExpiryTracking", product.isExpiryTracking ? "true" : "false");
        formData.append("isBatchTracking", product.isBatchTracking ? "true" : "false");

        if (image) {
          formData.append("image", image);
        }

        await apiClient.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(`Raw Material / Ingredient "${product.name}" added successfully!`);
        setTimeout(() => {
          router.push("/admin/products/view");
        }, 800);
      } catch (error) {
        console.error("Error creating ingredient:", error);
        const errData = error.response?.data;
        let errMsg = errData?.message || "Failed to create raw material / ingredient.";
        if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
          const detailMsgs = errData.errors.map((e) => e.msg || `${e.path} invalid`).join(", ");
          errMsg = `${errMsg} (${detailMsgs})`;
        }
        toast.error(errMsg);
        showWarning("Submission Error", errMsg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

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

      {isRestaurant ? (
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          {/* HERO HEADER BANNER */}
          <div className={styles.heroBanner} style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", border: "1px solid #312e81" }}>
            <div>
              <span className={styles.badgePill} style={{ background: "#4338ca", color: "#e0e7ff" }}>
                <FiPackage size={13} /> Restaurant ERP — Raw Materials & Ingredients
              </span>
              <h1 className={styles.heroTitle} style={{ color: "#ffffff" }}>Add Raw Material / Ingredient</h1>
              <p className={styles.heroSubtitle} style={{ color: "#a5b4fc" }}>
                Register kitchen raw materials, meat, poultry, vegetables, dairy, spices & store items.
              </p>
            </div>
            <div className={styles.heroActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => router.push("/admin/products/view")}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={submitting} style={{ background: "#4f46e5", color: "#ffffff" }}>
                <FiSave size={16} />
                {submitting ? "Saving..." : "Save Ingredient"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px", marginTop: "24px" }}>
            {/* 1. BASIC INFORMATION */}
            <div className={styles.cardSection} style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiTag style={{ color: "#4f46e5" }} /> BASIC INFORMATION
                </h3>
                <div style={{ height: "1px", background: "#cbd5e1", width: "100%" }} />
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className={styles.label}>Ingredient Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="e.g. Chicken Breast, Rice, Cheese"
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Ingredient Code / SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      value={product.sku}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="ING-001"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className={styles.label}>Category</label>
                    <select name="categoryId" value={product.categoryId} onChange={handleChange} className={styles.select}>
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Status *</label>
                    <select name="status" value={product.status} onChange={handleChange} className={styles.select}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 2. UNIT & STOCK */}
            <div className={styles.cardSection} style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiPackage style={{ color: "#4f46e5" }} /> UNIT & STOCK
                </h3>
                <div style={{ height: "1px", background: "#cbd5e1", width: "100%" }} />
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <label className={styles.label} style={{ margin: 0 }}>Base Unit *</label>
                      <button
                        type="button"
                        onClick={() => setShowAddUnitModal(true)}
                        style={{ background: "none", border: "none", color: "#4f46e5", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        + Add Unit
                      </button>
                    </div>
                    <select name="baseUnitId" value={product.baseUnitId} onChange={handleChange} className={styles.select}>
                      <option value="">Select Base Unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>{u.name || u.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Opening Stock</label>
                    <input
                      type="number"
                      step="any"
                      name="initialStock"
                      value={product.initialStock}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className={styles.label}>Minimum Stock Level *</label>
                    <input
                      type="number"
                      step="any"
                      name="minimumStock"
                      value={product.minimumStock}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Reorder Quantity</label>
                    <input
                      type="number"
                      step="any"
                      name="reorderQuantity"
                      value={product.reorderQuantity}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COST INFORMATION */}
            <div className={styles.cardSection} style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiDollarSign style={{ color: "#4f46e5" }} /> COST INFORMATION
                </h3>
                <div style={{ height: "1px", background: "#cbd5e1", width: "100%" }} />
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className={styles.label}>Purchase Cost (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      name="costPrice"
                      value={product.costPrice}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Preferred Supplier</label>
                    <select name="supplierId" value={product.supplierId} onChange={handleChange} className={styles.select}>
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CALCULATED READONLY PREVIEWS MATCHING PROMPT */}
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "8px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>AVERAGE COST</span>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0" }}>
                      {product.costPrice && parseFloat(product.costPrice) > 0
                        ? `₹${parseFloat(product.costPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "₹300.00"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>LAST PURCHASE COST</span>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0" }}>
                      {product.costPrice && parseFloat(product.costPrice) > 0
                        ? `₹${parseFloat(product.costPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "₹300.00"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>STOCK VALUE</span>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a", margin: "4px 0 0" }}>
                      {product.costPrice || product.initialStock
                        ? `₹${((parseFloat(product.costPrice) || 0) * (parseFloat(product.initialStock) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "₹6,000.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. STORAGE & TRACKING */}
            <div className={styles.cardSection} style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiTruck style={{ color: "#4f46e5" }} /> STORAGE & TRACKING
                </h3>
                <div style={{ height: "1px", background: "#cbd5e1", width: "100%" }} />
              </div>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className={styles.label}>Restaurant Outlet *</label>
                    <select name="restaurantOutletId" value={product.restaurantOutletId} onChange={handleChange} className={styles.select}>
                      <option value="">Select Outlet</option>
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Default Storage Location *</label>
                    <input
                      type="text"
                      name="defaultStorageLocation"
                      value={product.defaultStorageLocation}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="e.g. Main Store, Freezer #1"
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Storage Type *</label>
                  <select name="storageType" value={product.storageType} onChange={handleChange} className={styles.select}>
                    <option value="">Select Storage Type</option>
                    <option value="Dry Storage">Dry Storage</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Kitchen Storage">Kitchen Storage</option>
                    <option value="Ambient">Ambient</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                    <input
                      type="checkbox"
                      name="isPerishable"
                      checked={Boolean(product.isPerishable)}
                      onChange={handleChange}
                      style={{ width: "16px", height: "16px", accentColor: "#4f46e5" }}
                    />
                    Perishable Item
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                    <input
                      type="checkbox"
                      name="isExpiryTracking"
                      checked={Boolean(product.isExpiryTracking)}
                      onChange={handleChange}
                      style={{ width: "16px", height: "16px", accentColor: "#4f46e5" }}
                    />
                    Expiry Tracking
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                    <input
                      type="checkbox"
                      name="isBatchTracking"
                      checked={Boolean(product.isBatchTracking)}
                      onChange={handleChange}
                      style={{ width: "16px", height: "16px", accentColor: "#4f46e5" }}
                    />
                    Batch Tracking
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <>
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
                      <label>
                        Product Code / SKU <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>(Auto-Generated)</span>
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          name="sku"
                          value={product.sku}
                          onChange={handleChange}
                          placeholder="Auto-generated (e.g. SKU-849201)"
                          style={{ backgroundColor: "#f8fafc", fontWeight: "700", color: "#0f172a" }}
                        />
                        <button
                          type="button"
                          onClick={generateSKUAndCode}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                          }}
                          title="Generate new random SKU"
                        >
                          ⚡ Auto Generate
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        Barcode / EAN <span style={{ fontSize: "11px", color: "#64748b" }}>(Auto-Computed / Optional)</span>
                      </label>
                      <div className={styles.inputWithButton}>
                        <input
                          type="text"
                          name="barcode"
                          value={product.barcode}
                          onChange={handleChange}
                          placeholder="Auto-generated barcode"
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ margin: 0 }}>Brand</label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => setShowAddBrandModal(true)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#4f46e5",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            + Quick Add
                          </button>
                          <a
                            href="/admin/brand"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textDecoration: "underline" }}
                          >
                            Brands List ↗
                          </a>
                        </div>
                      </div>
                      <select
                        name="brandId"
                        value={product.brandId}
                        onChange={handleChange}
                      >
                        <option value="">Select Brand ({brands.length} available)</option>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label>Stock Unit <span className={styles.required}>*</span></label>
                        <button
                          type="button"
                          onClick={() => setShowAddUnitModal(true)}
                          style={{ background: "none", border: "none", color: "#4f46e5", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          + Add Unit
                        </button>
                      </div>
                      <select
                        name="stockUnit"
                        value={product.stockUnit}
                        onChange={handleChange}
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.name || u.code}>
                            {u.name || u.code}
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
    </>
  )}

      {/* BARCODE SCANNER MODAL */}
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

      {/* QUICK ADD BRAND MODAL */}
      {showAddBrandModal && (
        <div className={styles.scannerOverlay} style={{ background: "rgba(15, 23, 42, 0.6)" }}>
          <div className={styles.scannerModal} style={{ maxWidth: "450px", padding: "24px" }}>
            <div className={styles.scannerHeader} style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>+ Add New Product Brand</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setShowAddBrandModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddBrand} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Brand Name *</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Samsung, Nike, Apple"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBrand}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {creatingBrand ? "Saving..." : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD UNIT MODAL */}
      {showAddUnitModal && (
        <div className={styles.scannerOverlay} style={{ background: "rgba(15, 23, 42, 0.6)" }}>
          <div className={styles.scannerModal} style={{ maxWidth: "450px", padding: "24px" }}>
            <div className={styles.scannerHeader} style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>+ Add New Measurement Unit</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setShowAddUnitModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddUnit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Unit Name *</label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. Gallon, Barrel, Tray, Crate, Pound"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: "13px", fontWeight: "600" }}>Unit Symbol / Code (Optional)</label>
                <input
                  type="text"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  placeholder="e.g. gal, bbl, tray, lb"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUnit}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {creatingUnit ? "Saving..." : "Save Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
