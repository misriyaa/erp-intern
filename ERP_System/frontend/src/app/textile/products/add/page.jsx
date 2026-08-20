"use client";

import { useRef, useState, useEffect } from "react";
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
} from "react-icons/fi";

import styles from "@/app/admin/products/add/addProducts.module.css";
import { useAlert } from "@/context/AlertContext";
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
  fabricComposition: "80% Cotton, 20% Polyester",
  gsm: "180",
  rollWidth: "58",
  widthUnit: "Inches",
  color: "Royal Blue",
  colorCode: "#1e40af",
  pattern: "Plain / Solid",
  weaveType: "Plain weave",
  textureFinish: "Soft",
  status: "ACTIVE",

  stockUnit: "Meter",
  initialStock: "500",
  openingStockDate: new Date().toISOString().split("T")[0],
  reorderLevel: "50",
  minimumStock: "20",
  maximumStock: "2000",
  warehouseLocation: "Textile Mill Warehouse #1",
  rackLocation: "Rack FAB-12",
  numberOfRolls: "10",

  costPrice: "240",
  sellingPrice: "350",
  wholesalePrice: "310",
  retailPrice: "390",
  discountValue: "0",
  discountType: "PERCENT",
  taxRate: "12",

  supplierId: "",
  supplierProductCode: "YARN-TEX-901",
  leadTime: "7",

  hasVariants: false,
};

export default function AddTextileProductPage() {
  const router = useRouter();
  const { showWarning } = useAlert();

  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Dynamic Variants state
  const [variants, setVariants] = useState([]);
  const [quickColors, setQuickColors] = useState("Royal Blue, Emerald Green, Crimson Red, Charcoal Black, Pearl White");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

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

      if (catRes.status === "fulfilled" && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
      }
      if (brandRes.status === "fulfilled" && brandRes.value.data?.data) {
        setBrands(brandRes.value.data.data);
      }
      if (unitRes.status === "fulfilled" && unitRes.value.data?.data?.length > 0) {
        setUnits(unitRes.value.data.data);
      } else {
        setUnits(DEFAULT_UNITS);
      }
      if (suppRes.status === "fulfilled" && suppRes.value.data?.data) {
        const rawSupp = suppRes.value.data.data;
        const textSupp = rawSupp.filter((s) => s.isTextile === true || s.category === "TEXTILE" || s.companyName?.toLowerCase().includes("cotton") || s.companyName?.toLowerCase().includes("dye") || s.companyName?.toLowerCase().includes("mill") || s.companyName?.toLowerCase().includes("yarn"));
        setSuppliers(textSupp.length > 0 ? textSupp : rawSupp);
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

  const handleAddVariant = () => {
    const variantIndex = variants.length + 1;
    const baseSku = product.sku || "FAB-TEX";
    const newVariant = {
      id: Date.now().toString(),
      sku: `${baseSku}-VAR-${variantIndex}`,
      color: "",
      rollWidth: product.rollWidth || "58",
      widthUnit: product.widthUnit || "Inches",
      gsm: product.gsm || "180",
      pattern: product.pattern || "Plain / Solid",
      stock: "150",
      numberOfRolls: "3",
      sellingPrice: product.sellingPrice || "350",
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

  const handleGenerateQuickColorVariants = () => {
    if (!quickColors.trim()) {
      toast.error("Please enter color names separated by commas (e.g. Blue, Red, White)");
      return;
    }
    const colorList = quickColors.split(",").map((c) => c.trim()).filter(Boolean);
    const baseSku = product.sku || "FAB-TEX";

    const generated = colorList.map((colName, idx) => ({
      id: `${Date.now()}-${idx}`,
      sku: `${baseSku}-${colName.toUpperCase().replace(/\s+/g, "_").slice(0, 8)}`,
      color: colName,
      rollWidth: product.rollWidth || "58",
      widthUnit: product.widthUnit || "Inches",
      gsm: product.gsm || "180",
      pattern: product.pattern || "Plain / Solid",
      stock: "200",
      numberOfRolls: "4",
      sellingPrice: product.sellingPrice || "350",
    }));

    setVariants(generated);
    setProduct((prev) => ({ ...prev, hasVariants: true }));
    toast.success(`Generated ${generated.length} dynamic color variants!`);
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
      showWarning("Validation Required", "Please enter a fabric product name.");
      return false;
    }
    if (!product.sellingPrice || Number(product.sellingPrice) <= 0) {
      showWarning("Validation Required", "Please specify a valid selling price per meter/yard.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const skuCode = product.sku.trim() || `FAB-TEX-${Date.now().toString().slice(-6)}`;

    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("sku", skuCode);
      formData.append("barcode", product.barcode.trim());
      formData.append("description", product.description.trim());
      formData.append("isTextile", "true");
      formData.append("status", product.status);

      if (product.categoryId) formData.append("categoryId", product.categoryId);
      if (product.subcategoryId) formData.append("subcategoryId", product.subcategoryId);
      if (product.brandId) formData.append("brandId", product.brandId);
      if (product.baseUnitId) formData.append("baseUnitId", product.baseUnitId);

      formData.append("fabricComposition", product.fabricComposition);
      formData.append("gsm", product.gsm);
      formData.append("rollWidth", product.rollWidth);
      formData.append("widthUnit", product.widthUnit);
      formData.append("color", product.color);
      formData.append("colorCode", product.colorCode);
      formData.append("pattern", product.pattern);
      formData.append("weaveType", product.weaveType);
      formData.append("textureFinish", product.textureFinish);

      formData.append("stockUnit", product.stockUnit);
      formData.append("initialStock", product.initialStock || "0");
      formData.append("openingStockDate", product.openingStockDate);
      formData.append("reorderLevel", product.reorderLevel || "0");
      formData.append("minimumStock", product.minimumStock || "0");
      formData.append("maximumStock", product.maximumStock || "0");
      formData.append("warehouseLocation", product.warehouseLocation);
      formData.append("rackLocation", product.rackLocation);
      formData.append("numberOfRolls", product.numberOfRolls || "0");

      formData.append("costPrice", product.costPrice || "0");
      formData.append("sellingPrice", product.sellingPrice || "0");
      formData.append("wholesalePrice", product.wholesalePrice || "0");
      formData.append("retailPrice", product.retailPrice || "0");
      formData.append("discountValue", product.discountValue || "0");
      formData.append("discountType", product.discountType);
      formData.append("taxRate", product.taxRate || "0");

      if (product.supplierId) formData.append("supplierId", product.supplierId);
      formData.append("supplierProductCode", product.supplierProductCode);
      formData.append("leadTime", product.leadTime || "0");

      if (product.hasVariants && variants.length > 0) {
        formData.append("hasVariants", "true");
        formData.append("variants", JSON.stringify(variants));
      } else {
        formData.append("hasVariants", "false");
      }

      if (image) {
        formData.append("image", image);
      }

      await apiClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Textile Fabric "${product.name}" created successfully!`);
      setTimeout(() => {
        router.push("/textile/products");
      }, 800);
    } catch (error) {
      console.error("Error creating textile product:", error);
      const errMsg = error.response?.data?.message || "Failed to create fabric product.";
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

      {/* TEXTILE HERO HEADER BANNER */}
      <div className={styles.textileHeroBanner}>
        <div>
          <span className={styles.badgePill}>
            <FiLayers size={13} /> Textile Mill ERP
          </span>
          <h1 className={styles.heroTitle}>Add Textile Fabric Product</h1>
          <p className={styles.heroSubtitle}>
            Register finished fabric rolls, GSM metrics, weave specifications, roll inventory counts, and dynamic color matrix.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push("/textile/products")}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.textileSaveBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            <FiSave size={16} />
            {submitting ? "Saving Fabric..." : "Save Textile Product"}
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
                <h2>3. Roll & Stock Inventory</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Mill Quantities</span>
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
                    <option value="Meter">Meter</option>
                    <option value="Yard">Yard</option>
                    <option value="Piece">Piece</option>
                    <option value="Roll">Roll</option>
                    <option value="KG">KG</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Initial Stock Quantity ({product.stockUnit}s)</label>
                  <input
                    type="number"
                    name="initialStock"
                    value={product.initialStock}
                    onChange={handleChange}
                    placeholder="500"
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
                    placeholder="10"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Opening Stock Date</label>
                  <input
                    type="date"
                    name="openingStockDate"
                    value={product.openingStockDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Reorder Level (Alert Threshold)</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={product.reorderLevel}
                    onChange={handleChange}
                    placeholder="50"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={product.minimumStock}
                    onChange={handleChange}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Maximum Stock Level (Optional)</label>
                  <input
                    type="number"
                    name="maximumStock"
                    value={product.maximumStock}
                    onChange={handleChange}
                    placeholder="2000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Warehouse Location</label>
                  <input
                    type="text"
                    name="warehouseLocation"
                    value={product.warehouseLocation}
                    onChange={handleChange}
                    placeholder="Textile Mill Warehouse #1"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Rack / Shelf / Bin Location</label>
                <input
                  type="text"
                  name="rackLocation"
                  value={product.rackLocation}
                  onChange={handleChange}
                  placeholder="e.g. Rack FAB-12"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Multi-tier Pricing & Taxes */}
          <div id="tex-pricing" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiDollarSign />
                </div>
                <h2>4. Multi-tier Pricing & Taxes</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Rates per Meter</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Purchase Cost (₹ / {product.stockUnit})</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={product.costPrice}
                    onChange={handleChange}
                    placeholder="240"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Selling Price (₹ / {product.stockUnit}) <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={product.sellingPrice}
                    onChange={handleChange}
                    placeholder="350"
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
                    placeholder="310"
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
                    placeholder="390"
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
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Supplier Information */}
          <div id="tex-supplier" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiTruck />
                </div>
                <h2>5. Supplier Information</h2>
              </div>
              <span style={{ fontSize: "12px", color: "#0d9488", fontWeight: "700" }}>Yarn & Dye Distributors</span>
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
                    <option value="">Select Yarn & Dye Supplier</option>
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
                    placeholder="YARN-TEX-901"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Lead Time (Days)</label>
                <input
                  type="number"
                  name="leadTime"
                  value={product.leadTime}
                  onChange={handleChange}
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Dynamic Product Variants */}
          <div id="tex-variants" className={styles.card}>
            <div className={styles.cardHeader} style={{ justifyContent: "space-between" }}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiGrid />
                </div>
                <h2>6. Dynamic Product Variants</h2>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "#0d9488" }}>
                <input
                  type="checkbox"
                  name="hasVariants"
                  checked={product.hasVariants}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "#0d9488" }}
                />
                Enable Dynamic Product Variants
              </label>
            </div>

            {product.hasVariants && (
              <div className={styles.cardBody}>
                {/* Quick Generator Box */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <label style={{ fontWeight: "800", color: "#166534", marginBottom: "6px", display: "block" }}>
                    ⚡ Quick Color Variants Generator
                  </label>
                  <p style={{ fontSize: "13px", color: "#15803d", margin: "0 0 12px 0" }}>
                    Enter color names separated by commas to instantly generate variant rows with default width & GSM:
                  </p>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={quickColors}
                      onChange={(e) => setQuickColors(e.target.value)}
                      placeholder="Royal Blue, Emerald Green, Crimson Red, Black"
                      style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #86efac", fontSize: "14px" }}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateQuickColorVariants}
                      style={{
                        padding: "10px 18px",
                        background: "#15803d",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiZap size={15} /> Generate Variant Rows
                    </button>
                  </div>
                </div>

                {/* Matrix Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>Variant SKU</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Color</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Width</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>GSM</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Stock (Meters)</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Rolls</th>
                        <th style={{ padding: "10px", textAlign: "left" }}>Price (₹)</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => handleVariantChange(v.id, "sku", e.target.value)}
                              style={{ width: "100%", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={v.color}
                              onChange={(e) => handleVariantChange(v.id, "color", e.target.value)}
                              placeholder="Royal Blue"
                              style={{ width: "100%", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={v.rollWidth}
                              onChange={(e) => handleVariantChange(v.id, "rollWidth", e.target.value)}
                              placeholder="58"
                              style={{ width: "60px", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="text"
                              value={v.gsm}
                              onChange={(e) => handleVariantChange(v.id, "gsm", e.target.value)}
                              placeholder="180"
                              style={{ width: "60px", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleVariantChange(v.id, "stock", e.target.value)}
                              style={{ width: "80px", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={v.numberOfRolls}
                              onChange={(e) => handleVariantChange(v.id, "numberOfRolls", e.target.value)}
                              style={{ width: "60px", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              value={v.sellingPrice}
                              onChange={(e) => handleVariantChange(v.id, "sellingPrice", e.target.value)}
                              style={{ width: "80px", padding: "6px", fontSize: "13px" }}
                            />
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.id)}
                              style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", padding: "6px", cursor: "pointer" }}
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
                    padding: "8px 14px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FiPlus size={15} /> Add Custom Variant Row
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.sideColumn}>
          {/* Swatch Upload Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.textileIconBox}>
                  <FiUpload />
                </div>
                <h2>Fabric Swatch Photo</h2>
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
                    <FiUpload className={styles.uploadIcon} style={{ color: "#0d9488" }} />
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Upload Fabric Swatch</span>
                    <small>Supports PNG, JPG up to 5MB</small>
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

          {/* Textile Guidance Card */}
          <div className={styles.card} style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" }}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <FiCheckCircle style={{ color: "#0d9488", fontSize: "20px" }} />
                <h2>Textile ERP Guidance</h2>
              </div>
            </div>
            <div className={styles.cardBody} style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 12px 0" }}>
                <strong>Base Product vs Variants:</strong> Create base fabric type (e.g. <em>Cotton Shirting</em>) and generate color/width variants matrix under it.
              </p>
              <p style={{ margin: "0 0 12px 0" }}>
                <strong>GSM Metric:</strong> GSM indicates fabric weight per square meter (e.g. Shirting 120-160 GSM, Denim 300+ GSM).
              </p>
              <p style={{ margin: 0 }}>
                <strong>Multi-roll Metrics:</strong> Store metrics in Meters, Yards, or Rolls for precise mill warehouse auditing.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
