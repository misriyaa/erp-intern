"use client";

import { useRef, useState, useEffect, use } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiUpload,
  FiSave,
  FiPackage,
  FiX,
  FiLayers,
  FiDollarSign,
  FiArchive,
  FiTruck,
  FiGrid,
  FiPlus,
  FiTrash2,
  FiZap,
  FiShoppingBag,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

import styles from "@/app/admin/products/add/addProducts.module.css";
import { useAlert } from "@/context/AlertContext";
import apiClient from "@/services/apiClient";
import { useCompany } from "@/context/CompanyContext";

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
  "Mercerized",
  "Wrinkle-free",
  "Crinkle",
];

export default function EditTextileProductPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const router = useRouter();
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useAlert();
  const { isTextile, isRetail } = useCompany();

  useEffect(() => {
    console.log("WARNING: TextileFabricProductForm (Edit) rendered. isTextile:", isTextile, "isRetail:", isRetail);
    if (!isTextile) {
      console.log("Redirecting non-textile user away from Textile Product Edit...");
      router.replace(`/admin/products/edit/${id}`);
    }
  }, [isTextile, isRetail, id, router]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    baseUnitId: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    retailPrice: "",
    taxRate: "5",
    discountType: "PERCENTAGE",
    discountValue: "",
    description: "",
    status: "ACTIVE",

    // Textile Fabric Specs
    fabricComposition: "",
    gsm: "",
    rollWidth: "",
    widthUnit: "Inches",
    color: "",
    colorCode: "#1e40af",
    pattern: "Plain / Solid",
    weaveType: "Plain weave",
    textureFinish: "Soft",

    // Inventory
    stockUnit: "meter",
    initialStock: "0",
    openingStockDate: "",
    reorderLevel: "50",
    minimumStock: "20",
    maximumStock: "5000",
    warehouseLocation: "",
    rackLocation: "",
    numberOfRolls: "0",

    // Supplier
    supplierId: "",
    supplierProductCode: "",
    leadTime: "7",
  });

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    color: "",
    colorCode: "#1e40af",
    rollWidth: "",
    widthUnit: "Inches",
    gsm: "",
    pattern: "Plain / Solid",
    weaveType: "Plain weave",
    textureFinish: "Soft",
    stock: "",
    numberOfRolls: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    retailPrice: "",
    sku: "",
    barcode: "",
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [catRes, brandRes, unitRes, suppRes, whRes, prodRes] = await Promise.allSettled([
          apiClient.get("/categories"),
          apiClient.get("/brands"),
          apiClient.get("/units"),
          apiClient.get("/suppliers"),
          apiClient.get("/warehouse"),
          apiClient.get(`/products/${id}`),
        ]);

        if (catRes.status === "fulfilled" && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
        if (brandRes.status === "fulfilled" && brandRes.value.data?.data) {
          setBrands(brandRes.value.data.data);
        }
        if (unitRes.status === "fulfilled" && unitRes.value.data?.data?.length > 0) {
          setUnits(unitRes.value.data.data);
        }
        if (suppRes.status === "fulfilled" && suppRes.value.data?.data) {
          setSuppliers(suppRes.value.data.data);
        }
        if (whRes.status === "fulfilled" && whRes.value.data?.data) {
          setWarehouses(whRes.value.data.data);
        }

        if (prodRes.status === "fulfilled" && prodRes.value.data) {
          const p = prodRes.value.data.data || prodRes.value.data;
          setProduct({
            name: p.name || "",
            sku: p.sku || "",
            barcode: p.barcode || "",
            categoryId: p.categoryId || "",
            subcategoryId: p.subcategoryId || "",
            brandId: p.brandId || "",
            baseUnitId: p.unitId || p.baseUnitId || "",
            costPrice: p.costPrice ? String(p.costPrice) : "",
            sellingPrice: p.sellingPrice ? String(p.sellingPrice) : "",
            wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : "",
            retailPrice: p.retailPrice ? String(p.retailPrice) : "",
            taxRate: p.taxRate ? String(p.taxRate) : "5",
            discountType: p.discountType || "PERCENTAGE",
            discountValue: p.discountValue ? String(p.discountValue) : "",
            description: p.description || "",
            status: p.status || "ACTIVE",

            fabricComposition: p.fabricComposition || "",
            gsm: p.gsm ? String(p.gsm) : "",
            rollWidth: p.rollWidth ? String(p.rollWidth) : "",
            widthUnit: p.widthUnit || "Inches",
            color: p.color || "",
            colorCode: p.colorCode || "#1e40af",
            pattern: p.pattern || "Plain / Solid",
            weaveType: p.weaveType || "Plain weave",
            textureFinish: p.textureFinish || "Soft",

            stockUnit: p.stockUnit || "meter",
            initialStock: p.initialStock ? String(p.initialStock) : "0",
            openingStockDate: p.openingStockDate ? p.openingStockDate.split("T")[0] : "",
            reorderLevel: p.reorderLevel ? String(p.reorderLevel) : "50",
            minimumStock: p.minimumStock ? String(p.minimumStock) : "20",
            maximumStock: p.maximumStock ? String(p.maximumStock) : "5000",
            warehouseLocation: p.warehouseLocation || "",
            rackLocation: p.rackLocation || "",
            numberOfRolls: p.numberOfRolls ? String(p.numberOfRolls) : "0",

            supplierId: p.supplierId || "",
            supplierProductCode: p.supplierProductCode || "",
            leadTime: p.leadTime ? String(p.leadTime) : "7",
          });

          if (p.image) {
            setImagePreview(
              p.image.startsWith("http")
                ? p.image
                : `http://localhost:5000${p.image.startsWith("/") ? "" : "/"}${p.image}`
            );
          }

          if (p.variants && p.variants.length > 0) {
            setHasVariants(true);
            setVariants(p.variants);
          }
        }
      } catch (err) {
        console.error("Error loading textile product data:", err);
        showError("Failed to Load", "Could not load the specified textile product.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddVariant = () => {
    if (!newVariant.color && !newVariant.sku) {
      toast.error("Please provide at least a Color Name or SKU for the variant.");
      return;
    }

    const createdVariant = {
      ...newVariant,
      id: `temp-${Date.now()}`,
      sku: newVariant.sku || `${product.sku}-${(newVariant.color || "VAR").toUpperCase().slice(0, 4)}`,
      costPrice: newVariant.costPrice || product.costPrice,
      sellingPrice: newVariant.sellingPrice || product.sellingPrice,
      wholesalePrice: newVariant.wholesalePrice || product.wholesalePrice,
      retailPrice: newVariant.retailPrice || product.retailPrice,
      rollWidth: newVariant.rollWidth || product.rollWidth,
      widthUnit: newVariant.widthUnit || product.widthUnit,
      gsm: newVariant.gsm || product.gsm,
      pattern: newVariant.pattern || product.pattern,
      weaveType: newVariant.weaveType || product.weaveType,
      textureFinish: newVariant.textureFinish || product.textureFinish,
    };

    setVariants((prev) => [...prev, createdVariant]);
    setNewVariant({
      color: "",
      colorCode: "#1e40af",
      rollWidth: "",
      widthUnit: "Inches",
      gsm: "",
      pattern: "Plain / Solid",
      weaveType: "Plain weave",
      textureFinish: "Soft",
      stock: "",
      numberOfRolls: "",
      costPrice: "",
      sellingPrice: "",
      wholesalePrice: "",
      retailPrice: "",
      sku: "",
      barcode: "",
    });
    toast.success("Color variant added to list!");
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToSection = (stepNumber, sectionId) => {
    setActiveStep(stepNumber);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!product.name.trim()) {
      toast.error("Please enter the Product Name.");
      scrollToSection(1, "tex-basic-info");
      return;
    }

    if (!product.categoryId) {
      toast.error("Please select a Category.");
      scrollToSection(1, "tex-basic-info");
      return;
    }

    if (!product.sellingPrice) {
      toast.error("Please specify the Selling Price.");
      scrollToSection(4, "tex-pricing");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("sku", product.sku.trim());
      formData.append("barcode", product.barcode ? product.barcode.trim() : "");
      formData.append("categoryId", product.categoryId);
      if (product.subcategoryId) formData.append("subcategoryId", product.subcategoryId);
      if (product.brandId) formData.append("brandId", product.brandId);
      if (product.baseUnitId) formData.append("unitId", product.baseUnitId);
      formData.append("costPrice", product.costPrice || "0");
      formData.append("sellingPrice", product.sellingPrice || "0");
      formData.append("wholesalePrice", product.wholesalePrice || "0");
      formData.append("retailPrice", product.retailPrice || "0");
      formData.append("taxRate", product.taxRate || "0");
      formData.append("discountType", product.discountType);
      formData.append("discountValue", product.discountValue || "0");
      formData.append("description", product.description || "");
      formData.append("status", product.status);

      // Textile Specs
      formData.append("isTextile", "true");
      formData.append("fabricComposition", product.fabricComposition || "");
      formData.append("gsm", product.gsm || "0");
      formData.append("rollWidth", product.rollWidth || "0");
      formData.append("widthUnit", product.widthUnit);
      formData.append("color", product.color || "");
      formData.append("colorCode", product.colorCode || "");
      formData.append("pattern", product.pattern);
      formData.append("weaveType", product.weaveType);
      formData.append("textureFinish", product.textureFinish);

      // Inventory
      formData.append("stockUnit", product.stockUnit);
      formData.append("initialStock", product.initialStock || "0");
      formData.append("reorderLevel", product.reorderLevel || "0");
      formData.append("minimumStock", product.minimumStock || "0");
      formData.append("maximumStock", product.maximumStock || "0");
      formData.append("warehouseLocation", product.warehouseLocation || "");
      formData.append("rackLocation", product.rackLocation || "");
      formData.append("numberOfRolls", product.numberOfRolls || "0");

      // Supplier
      if (product.supplierId) formData.append("supplierId", product.supplierId);
      formData.append("supplierProductCode", product.supplierProductCode || "");
      formData.append("leadTime", product.leadTime || "0");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (hasVariants && variants.length > 0) {
        formData.append("hasVariants", "true");
        formData.append("variants", JSON.stringify(variants));
      } else {
        formData.append("hasVariants", "false");
        formData.append("variants", "[]");
      }

      const res = await apiClient.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success || res.status === 200) {
        toast.success(`Textile Fabric "${product.name}" updated successfully!`);
        showSuccess("Fabric Updated", `"${product.name}" has been updated.`);
        setTimeout(() => {
          router.push("/textile/products");
        }, 800);
      }
    } catch (err) {
      console.error("Error updating textile fabric product:", err);
      const errMsg = err.response?.data?.message || "Failed to update product.";
      toast.error(errMsg);
      showError("Update Error", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: "12px" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite", color: "#0d9488" }} size={36} />
        <p style={{ color: "#64748b", fontWeight: "600", fontSize: "15px" }}>Loading Textile Fabric Details...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      {/* TEXTILE HERO HEADER BANNER */}
      <div className={styles.textileHeroBanner}>
        <div>
          <span className={styles.badgePill}>
            <FiLayers size={13} /> Textile Mill ERP
          </span>
          <h1 className={styles.heroTitle}>Edit Textile Fabric Product</h1>
          <p className={styles.heroSubtitle}>
            Update finished fabric roll specifications, GSM metrics, weave types, roll inventory counts, pricing, and dynamic color matrix.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/textile/products")}
          >
            <FiArrowLeft size={15} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            className={styles.textileSaveBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            <FiSave size={16} />
            <span>{submitting ? "Updating Fabric..." : "Update Textile Product"}</span>
          </button>
        </div>
      </div>

      {/* VISUAL STEPPER NAVIGATION */}
      <div className={styles.stepperNav}>
        <div
          className={`${styles.stepItem} ${activeStep === 1 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(1, "tex-basic-info")}
        >
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepTitle}>Basic Info</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 2 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(2, "tex-specs")}
        >
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepTitle}>Fabric Specs</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 3 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(3, "tex-inventory")}
        >
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepTitle}>Roll Inventory</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 4 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(4, "tex-pricing")}
        >
          <div className={styles.stepNumber}>4</div>
          <span className={styles.stepTitle}>Pricing & GST</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 5 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(5, "tex-supplier")}
        >
          <div className={styles.stepNumber}>5</div>
          <span className={styles.stepTitle}>Yarn Supplier</span>
        </div>

        <div
          className={`${styles.stepItem} ${activeStep === 6 ? styles.activeTextileStep : ""}`}
          onClick={() => scrollToSection(6, "tex-variants")}
        >
          <div className={styles.stepNumber}>6</div>
          <span className={styles.stepTitle}>Color Variants</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formLayout}>
        {/* LEFT COLUMN */}
        <div className={styles.mainColumn}>
          {/* SECTION 1: Basic Information */}
          <div id="tex-basic-info" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiPackage />
                </div>
                <h2>1. Basic Product Information</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Fabric Title</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>
                  Fabric / Product Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  placeholder="e.g. Jacquard Damask Shirting Fabric"
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
                    placeholder="e.g. FAB-JD-001"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Barcode / EAN</label>
                  <input
                    type="text"
                    name="barcode"
                    value={product.barcode}
                    onChange={handleChange}
                    placeholder="e.g. 8901234567890"
                  />
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
                    <option value="">Select Category (Cotton, Silk, Linen...)</option>
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
                    placeholder="Shirting, Suiting, Curtain..."
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Brand / Mill Name</label>
                  <select
                    name="brandId"
                    value={product.brandId}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand / Textile Mill</option>
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
                    <option value="ACTIVE">Active (Available)</option>
                    <option value="INACTIVE">Inactive (Archived)</option>
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
                  placeholder="Enter detailed fabric specifications, yarn count, care instructions, or finish notes..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Fabric Specifications */}
          <div id="tex-specs" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiLayers />
                </div>
                <h2>2. Fabric Specifications</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Textile Metrics</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Fabric Composition</label>
                  <input
                    type="text"
                    name="fabricComposition"
                    value={product.fabricComposition}
                    onChange={handleChange}
                    placeholder="e.g. 80% Cotton, 20% Silk"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>GSM (g/m²)</label>
                  <input
                    type="number"
                    name="gsm"
                    value={product.gsm}
                    onChange={handleChange}
                    placeholder="e.g. 180"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Roll Width</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      name="rollWidth"
                      value={product.rollWidth}
                      onChange={handleChange}
                      placeholder="58"
                      style={{ width: "100%" }}
                    />
                    <select
                      name="widthUnit"
                      value={product.widthUnit}
                      onChange={handleChange}
                      style={{ width: "130px" }}
                    >
                      <option value="Inches">Inches</option>
                      <option value="CM">CM</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Color Name & Hex Swatch</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      name="color"
                      value={product.color}
                      onChange={handleChange}
                      placeholder="Royal Blue"
                      style={{ width: "100%" }}
                    />
                    <input
                      type="color"
                      name="colorCode"
                      value={product.colorCode || "#1e40af"}
                      onChange={handleChange}
                      style={{ width: "50px", padding: "2px", height: "46px", cursor: "pointer", borderRadius: "8px" }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Pattern / Design</label>
                  <select
                    name="pattern"
                    value={product.pattern}
                    onChange={handleChange}
                  >
                    {PATTERN_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Weave Type</label>
                  <select
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
              </div>

              <div className={styles.formGroup}>
                <label>Texture / Finish</label>
                <select
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
            </div>
          </div>

          {/* SECTION 3: Inventory Details */}
          <div id="tex-inventory" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiArchive />
                </div>
                <h2>3. Roll Inventory & Mill Warehouses</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Mill Stock</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Stock Keeping Unit (UoM)</label>
                  <select
                    name="stockUnit"
                    value={product.stockUnit}
                    onChange={handleChange}
                  >
                    {units.map((u) => (
                      <option key={u.id || u.code} value={u.code || u.id}>
                        {u.name} ({u.code || u.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Current Stock (in selected UoM)</label>
                  <input
                    type="number"
                    name="initialStock"
                    value={product.initialStock}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Number of Fabric Rolls</label>
                  <input
                    type="number"
                    name="numberOfRolls"
                    value={product.numberOfRolls}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mill Warehouse / Room</label>
                  <select
                    name="warehouseLocation"
                    value={product.warehouseLocation}
                    onChange={handleChange}
                  >
                    <option value="">Select Mill Warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.name}>
                        {wh.name} {wh.code ? `(${wh.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.row3}>
                <div className={styles.formGroup}>
                  <label>Min Stock Alert</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={product.minimumStock}
                    onChange={handleChange}
                    placeholder="20"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={product.reorderLevel}
                    onChange={handleChange}
                    placeholder="50"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Max Storage Cap</label>
                  <input
                    type="number"
                    name="maximumStock"
                    value={product.maximumStock}
                    onChange={handleChange}
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Pricing & Taxes */}
          <div id="tex-pricing" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiDollarSign />
                </div>
                <h2>4. Pricing & GST</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Tiered Rates</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Cost / Production Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costPrice"
                    value={product.costPrice}
                    onChange={handleChange}
                    placeholder="e.g. 180.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Selling Price / Meter (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="sellingPrice"
                    value={product.sellingPrice}
                    onChange={handleChange}
                    placeholder="e.g. 260.00"
                    required
                  />
                </div>
              </div>

              <div className={styles.row3}>
                <div className={styles.formGroup}>
                  <label>Wholesale / B2B Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="wholesalePrice"
                    value={product.wholesalePrice}
                    onChange={handleChange}
                    placeholder="e.g. 220.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Retail / Export Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="retailPrice"
                    value={product.retailPrice}
                    onChange={handleChange}
                    placeholder="e.g. 290.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>GST / Tax Rate (%)</label>
                  <select
                    name="taxRate"
                    value={product.taxRate}
                    onChange={handleChange}
                  >
                    <option value="0">0% (Exempted)</option>
                    <option value="5">5% (Fabric Standard)</option>
                    <option value="12">12% (Apparel/Madeups)</option>
                    <option value="18">18% (Synthetic/Blends)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Yarn & Dye Supplier */}
          <div id="tex-supplier" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiTruck />
                </div>
                <h2>5. Yarn & Dye Supplier Information</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Vendor Link</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Primary Yarn/Dye Supplier</label>
                  <select
                    name="supplierId"
                    value={product.supplierId}
                    onChange={handleChange}
                  >
                    <option value="">Choose Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.contactPerson ? `(${s.contactPerson})` : ""}
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
                    placeholder="e.g. YARN-COT-60S"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Color Variants Matrix */}
          <div id="tex-variants" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiGrid />
                </div>
                <h2>6. Dynamic Color & Roll Width Variants</h2>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: "#0f766e" }}>
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
                <span>Enable Multi-Color Matrix</span>
              </label>
            </div>

            {hasVariants && (
              <div className={styles.cardBody}>
                <div style={{ background: "#f0fdfa", padding: "16px", borderRadius: "12px", border: "1px solid #ccfbf1", marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "800", color: "#115e59" }}>
                    Add Color Shade Variant
                  </h4>

                  <div className={styles.row3}>
                    <div className={styles.formGroup}>
                      <label>Color Name</label>
                      <input
                        type="text"
                        placeholder="Emerald Green"
                        value={newVariant.color}
                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Color Swatch</label>
                      <input
                        type="color"
                        value={newVariant.colorCode}
                        onChange={(e) => setNewVariant({ ...newVariant, colorCode: e.target.value })}
                        style={{ width: "100%", height: "46px", padding: "2px", cursor: "pointer", borderRadius: "8px" }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Variant SKU</label>
                      <input
                        type="text"
                        placeholder="FAB-JD-001-GRN"
                        value={newVariant.sku}
                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.row3}>
                    <div className={styles.formGroup}>
                      <label>Rolls Count</label>
                      <input
                        type="number"
                        placeholder="5"
                        value={newVariant.numberOfRolls}
                        onChange={(e) => setNewVariant({ ...newVariant, numberOfRolls: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Stock (Meters)</label>
                      <input
                        type="number"
                        placeholder="250"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Selling Price (₹)</label>
                      <input
                        type="number"
                        placeholder="260.00"
                        value={newVariant.sellingPrice}
                        onChange={(e) => setNewVariant({ ...newVariant, sellingPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    style={{
                      marginTop: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#0d9488",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <FiPlus />
                    <span>Add Color Shade to Matrix</span>
                  </button>
                </div>

                {variants.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "8px 12px" }}>Swatch</th>
                          <th style={{ padding: "8px 12px" }}>Color</th>
                          <th style={{ padding: "8px 12px" }}>SKU</th>
                          <th style={{ padding: "8px 12px" }}>Rolls</th>
                          <th style={{ padding: "8px 12px" }}>Stock</th>
                          <th style={{ padding: "8px 12px" }}>Selling Price</th>
                          <th style={{ padding: "8px 12px", textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "8px 12px" }}>
                              <span style={{ display: "inline-block", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: v.colorCode || "#0d9488", border: "1px solid #cbd5e1" }} />
                            </td>
                            <td style={{ padding: "8px 12px", fontWeight: "600" }}>{v.color || "Shade"}</td>
                            <td style={{ padding: "8px 12px", color: "#64748b" }}>{v.sku}</td>
                            <td style={{ padding: "8px 12px" }}>{v.numberOfRolls || "0"} Rolls</td>
                            <td style={{ padding: "8px 12px", fontWeight: "700" }}>{v.stock || "0"} m</td>
                            <td style={{ padding: "8px 12px", fontWeight: "700", color: "#0f766e" }}>₹{v.sellingPrice || product.sellingPrice}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (FABRIC SWATCH / MEDIA) */}
        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiUpload />
                </div>
                <h2>Fabric Image / Swatch</h2>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div
                className={styles.uploadArea}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                {imagePreview ? (
                  <div className={styles.previewContainer}>
                    <img src={imagePreview} alt="Fabric Swatch Preview" className={styles.previewImage} />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <FiUpload size={32} style={{ color: "#0d9488", marginBottom: "8px" }} />
                    <p style={{ fontWeight: "700", color: "#334155", margin: "0 0 4px" }}>Click to upload fabric texture image</p>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>PNG, JPG or WEBP up to 5MB</span>
                  </div>
                )}
              </div>

              {/* QUICK SUMMARY CARD */}
              <div style={{ marginTop: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>
                  Product Summary
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Fabric:</span>
                    <strong style={{ color: "#0f172a" }}>{product.name || "Untitled"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>SKU:</span>
                    <strong>{product.sku || "N/A"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Composition:</span>
                    <strong>{product.fabricComposition || "N/A"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GSM:</span>
                    <strong>{product.gsm ? `${product.gsm} g/m²` : "N/A"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Price / Meter:</span>
                    <strong style={{ color: "#0d9488" }}>₹{product.sellingPrice || "0.00"}</strong>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="submit"
                  className={styles.textileSaveBtn}
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={submitting}
                >
                  <FiSave size={16} />
                  <span>{submitting ? "Updating..." : "Update Fabric Product"}</span>
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => router.push("/textile/products")}
                >
                  <span>Return to Product List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
