"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import { showConfirm } from "@/utils/swal";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiPrinter,
  FiPackage,
  FiBox,
  FiDollarSign,
  FiTag,
  FiTruck,
  FiLayers,
  FiCalendar,
  FiBarChart2,
  FiGrid,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

import styles from "../details.module.css";
import { useCompany } from "@/context/CompanyContext";
import AddBatchModal from "../../components/AddBatchModal";
import EditBatchModal from "../../components/EditBatchModal";

export default function ProductDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { isRestaurant } = useCompany();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [selectedEditBatch, setSelectedEditBatch] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${id}`);
      if (res.data?.data) {
        setProduct(res.data.data);
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2>Product Not Found</h2>
        <button
          className={styles.backButton}
          onClick={() => router.push("/admin/products/view")}
          style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FiArrowLeft /> Back to Products
        </button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price || 0);
  };

  const costPrice = parseFloat(product.costPrice || 0);
  const sellingPrice = parseFloat(product.sellingPrice || 0);
  const profit = sellingPrice - costPrice;
  const profitMargin = costPrice > 0 ? (profit / costPrice) * 100 : 100;

  const batches = Array.isArray(product.batches) ? product.batches : [];
  const batchCount = batches.length;
  const currentStock = batchCount > 0
    ? batches.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0)
    : (product.initialStock || product.inventories?.reduce((acc, inv) => acc + (inv.quantity || 0), 0) || 0);

  const mrpList = batches.map((b) => Number(b.mrp)).filter((m) => !isNaN(m) && m > 0);
  const minMrp = mrpList.length > 0 ? Math.min(...mrpList) : Number(product.retailPrice || product.sellingPrice || 0);
  const maxMrp = mrpList.length > 0 ? Math.max(...mrpList) : Number(product.retailPrice || product.sellingPrice || 0);
  const mrpRangeDisplay = minMrp === maxMrp ? formatPrice(minMrp) : `${formatPrice(minMrp)} - ${formatPrice(maxMrp)}`;

  const maxStock = product.maximumStock || 1000;
  const minStock = product.minimumStock || 10;
  const stockPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: "Delete Fabric Product?",
      text: "Are you sure you want to delete this fabric product?",
      confirmButtonText: "Yes, Delete",
      icon: "warning",
    });
    if (confirmed) {
      try {
        await apiClient.delete(`/products/${id}`);
        toast.success("Fabric Product deleted successfully");
        router.push("/admin/products/view");
      } catch (err) {
        toast.error("Failed to delete fabric product");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const imageUrl = getImageUrl(product.image);

  if (isRestaurant) {
    const costPrice = parseFloat(product.costPrice || 0);
    const stockQty = parseFloat(product.initialStock || product.inventories?.[0]?.quantity || 0);
    const stockVal = stockQty * costPrice;
    const baseUnitName = product.unit?.name || product.stockUnit || "KG";

    return (
      <div className={styles.container}>
        <Toaster position="top-right" />
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/admin/products/view" className={styles.backButton}>
              <FiArrowLeft />
            </Link>
            <div>
              <div className={styles.breadcrumb}>
                Raw Materials <span>/</span> Ingredient Details
              </div>
              <h1>{product.name}</h1>
              <p>Kitchen raw material specs, unit conversion, cost analysis, supplier & storage locations.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} onClick={handlePrint}>
              <FiPrinter /> Print
            </button>
            <Link href={`/admin/products/edit/${product.id}`} className={styles.editButton}>
              <FiEdit /> Edit Ingredient
            </Link>
            <button className={styles.deleteButton} onClick={handleDelete}>
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* Product Overview Header Card */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            <div className={styles.productImage}>
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
              ) : (
                <FiPackage />
              )}
            </div>
          </div>

          <div className={styles.productMainInfo}>
            <div className={styles.titleRow}>
              <div>
                <h2>{product.name}</h2>
                <div className={styles.productMeta}>
                  <span>SKU: {product.sku}</span>
                  {product.barcode && <span>Barcode: {product.barcode}</span>}
                  <span>Type: RAW MATERIAL</span>
                </div>
              </div>
              <span className={styles.activeBadge}>
                <span></span>
                {product.status || "ACTIVE"}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>Category</span>
                <strong>{product.category?.name || "General"}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Base Unit</span>
                <strong>{baseUnitName}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Purchase Unit</span>
                <strong>{product.purchaseUnit ? `${product.purchaseUnit} (1 ${product.purchaseUnit} = ${product.conversionFactor || 1} ${baseUnitName})` : "N/A"}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Storage Location</span>
                <strong>{product.defaultStorageLocation || product.warehouseLocation || "Main Store"} ({product.storageType || "Dry Storage"})</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Stats KPI Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <FiDollarSign />
            </div>
            <div>
              <span>Purchase Cost</span>
              <h3>{formatPrice(costPrice)} / {baseUnitName}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <FiBox />
            </div>
            <div>
              <span>Current Stock</span>
              <h3>{stockQty} {baseUnitName}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <FiTag />
            </div>
            <div>
              <span>Total Stock Value</span>
              <h3>{formatPrice(stockVal)}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <FiBarChart2 />
            </div>
            <div>
              <span>Min Stock Level</span>
              <h3>{product.minimumStock || 0} {baseUnitName}</h3>
            </div>
          </div>
        </div>

        {/* 4 Section Cards Grid */}
        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            {/* 1. BASIC & INVENTORY SPECIFICATIONS */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiLayers />
                  </div>
                  <div>
                    <h3>1. Basic & Unit Specifications</h3>
                    <p>Ingredient identification, category, unit conversions and stock thresholds</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div>
                  <span>Ingredient Name</span>
                  <strong>{product.name}</strong>
                </div>
                <div>
                  <span>SKU / Item Code</span>
                  <strong>{product.sku}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{product.category?.name || "Uncategorized"}</strong>
                </div>
                <div>
                  <span>Brand</span>
                  <strong>{product.brand?.name || "N/A"}</strong>
                </div>
                <div>
                  <span>Base Unit</span>
                  <strong>{baseUnitName}</strong>
                </div>
                <div>
                  <span>Purchase Unit</span>
                  <strong>{product.purchaseUnit || "N/A"}</strong>
                </div>
                <div>
                  <span>Conversion Factor</span>
                  <strong>{product.conversionFactor ? `1 ${product.purchaseUnit} = ${product.conversionFactor} ${baseUnitName}` : "N/A"}</strong>
                </div>
                <div>
                  <span>Minimum Stock</span>
                  <strong>{product.minimumStock || 0} {baseUnitName}</strong>
                </div>
                <div>
                  <span>Maximum Stock</span>
                  <strong>{product.maximumStock || 0} {baseUnitName}</strong>
                </div>
                <div>
                  <span>Reorder Quantity</span>
                  <strong>{product.reorderQuantity || 0} {baseUnitName}</strong>
                </div>
              </div>
            </section>

            {/* 2. STORAGE & TRACKING INFORMATION */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiTruck />
                  </div>
                  <div>
                    <h3>2. Storage & Quality Tracking</h3>
                    <p>Outlet assignment, default store location, perishable and batch tracking settings</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div>
                  <span>Restaurant Outlet</span>
                  <strong>{product.restaurantOutlet?.name || "Main Outlet"}</strong>
                </div>
                <div>
                  <span>Default Storage Location</span>
                  <strong>{product.defaultStorageLocation || product.warehouseLocation || "Main Store"}</strong>
                </div>
                <div>
                  <span>Storage Type</span>
                  <strong>{product.storageType || "Dry Storage"}</strong>
                </div>
                <div>
                  <span>Perishable Item</span>
                  <strong style={{ color: product.isPerishable ? "#ef4444" : "#64748b" }}>
                    {product.isPerishable ? "Yes (Perishable)" : "No"}
                  </strong>
                </div>
                <div>
                  <span>Expiry Tracking</span>
                  <strong style={{ color: product.isExpiryTracking ? "#4f46e5" : "#64748b" }}>
                    {product.isExpiryTracking ? "Enabled (Batch Expiry Active)" : "Disabled"}
                  </strong>
                </div>
                <div>
                  <span>Batch Tracking</span>
                  <strong style={{ color: product.isBatchTracking ? "#4f46e5" : "#64748b" }}>
                    {product.isBatchTracking ? "Enabled" : "Disabled"}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* 3. COST & SUPPLIER INFORMATION */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiDollarSign />
                  </div>
                  <div>
                    <h3>3. Cost & Supplier Information</h3>
                    <p>Purchase pricing, tax, average cost & supplier reference</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid} style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span>Purchase Cost</span>
                  <strong>{formatPrice(costPrice)} / {baseUnitName}</strong>
                </div>
                <div>
                  <span>Average Cost</span>
                  <strong>{formatPrice(product.averageCost || costPrice)} / {baseUnitName}</strong>
                </div>
                <div>
                  <span>Last Purchase Cost</span>
                  <strong>{formatPrice(product.lastPurchaseCost || costPrice)} / {baseUnitName}</strong>
                </div>
                <div>
                  <span>Tax Rate</span>
                  <strong>{product.taxRate ? `${product.taxRate}%` : "0%"}</strong>
                </div>
                <div>
                  <span>Preferred Supplier</span>
                  <strong>{product.supplier?.companyName || product.supplier?.name || "N/A"}</strong>
                </div>
                <div>
                  <span>Supplier Reference</span>
                  <strong>{product.supplierReference || product.supplierProductCode || "N/A"}</strong>
                </div>
              </div>
            </section>

            {/* 4. AUDIT TIMELINE */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiCalendar />
                  </div>
                  <div>
                    <h3>Record Audit</h3>
                    <p>System creation and update logs</p>
                  </div>
                </div>
              </div>

              <div className={styles.timeline}>
                <div>
                  <span>Created Date</span>
                  <strong>{new Date(product.createdAt).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span>Last Modified</span>
                  <strong>{new Date(product.updatedAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products/view" className={styles.backButton}>
            <FiArrowLeft />
          </Link>

          <div>
            <div className={styles.breadcrumb}>
              Products <span>/</span> Fabric Details
            </div>

            <h1>{product.name}</h1>
            <p>Full textile specifications, inventory metrics, supplier details, and dynamic variants.</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={handlePrint}>
            <FiPrinter /> Print
          </button>

          <Link href={`/admin/products/edit/${product.id}`} className={styles.editButton}>
            <FiEdit /> Edit Fabric
          </Link>

          <button className={styles.deleteButton} onClick={handleDelete}>
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Product Overview Card */}
      <div className={styles.productCard}>
        <div className={styles.productImageWrapper}>
          <div className={styles.productImage}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <FiPackage />
            )}
          </div>
        </div>

        <div className={styles.productMainInfo}>
          <div className={styles.titleRow}>
            <div>
              <h2>{product.name}</h2>
              <div className={styles.productMeta}>
                <span>SKU: {product.sku}</span>
                {product.barcode && <span>Barcode: {product.barcode}</span>}
                {product.subcategory && <span>Subcategory: {product.subcategory}</span>}
              </div>
            </div>

            <span className={styles.activeBadge}>
              <span></span>
              {product.status || "ACTIVE"}
            </span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span>Category</span>
              <strong>{product.category?.name || "Textile"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Brand</span>
              <strong>{product.brand?.name || "N/A"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Stock Unit</span>
              <strong>{product.stockUnit || product.unit?.name || "Meter"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Fabric Composition</span>
              <strong>{product.fabricComposition || "Cotton Blend"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiDollarSign />
          </div>
          <div>
            <span>Cost Price</span>
            <h3>{formatPrice(costPrice)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <FiTag />
          </div>
          <div>
            <span>MRP / Price</span>
            <h3>{batchCount > 0 ? mrpRangeDisplay : formatPrice(sellingPrice)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiBox />
          </div>
          <div>
            <span>Total Available Stock</span>
            <h3>{currentStock} {product.stockUnit || "units"}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiLayers />
          </div>
          <div>
            <span>Active Batches</span>
            <h3>{batchCount} {batchCount === 1 ? "Batch" : "Batches"}</h3>
          </div>
        </div>
      </div>

      {/* BATCH-WISE INVENTORY & MULTIPLE MRPs CARD */}
      <section className={styles.card} style={{ marginBottom: "28px", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiLayers size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Batch-Wise Inventory & Multiple MRPs
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                Each batch maintains its own Batch Number, MRP, Purchase Price, Selling Price, and Stock
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddBatchOpen(true)}
            style={{
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
            }}
          >
            <FiPlus size={16} /> Add New Batch
          </button>
        </div>

        {/* Aggregated Summary Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            padding: "16px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Product Stock
            </span>
            <strong style={{ fontSize: "20px", color: "#0f172a", display: "block", marginTop: "4px" }}>
              {currentStock}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Number of Batches
            </span>
            <strong style={{ fontSize: "20px", color: "#2563eb", display: "block", marginTop: "4px" }}>
              {batchCount}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              MRP Range
            </span>
            <strong style={{ fontSize: "20px", color: "#16a34a", display: "block", marginTop: "4px" }}>
              {mrpRangeDisplay}
            </strong>
          </div>
        </div>

        {/* Batch Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Batch Number</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>MRP</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Purchase Price</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Selling Price</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Quantity</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Expiry</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#475569", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((b) => {
                  const isExpired = b.expiryDate && new Date(b.expiryDate) < new Date();
                  const isOutOfStock = b.quantity === 0;
                  const isLowStock = b.quantity > 0 && b.quantity <= 10;
                  const statusLabel = isExpired ? "Expired" : isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock";
                  const statusBg = isExpired || isOutOfStock ? "#fee2e2" : isLowStock ? "#ffedd5" : "#dcfce7";
                  const statusColor = isExpired || isOutOfStock ? "#991b1b" : isLowStock ? "#9a3412" : "#166534";

                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0f172a" }}>
                        {b.batchNumber}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "800", color: "#16a34a" }}>
                        {formatPrice(b.mrp)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {formatPrice(b.purchasePrice)}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "#2563eb" }}>
                        {formatPrice(b.sellingPrice)}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "800", color: "#0f172a" }}>
                        {b.quantity}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                        {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "No Expiry"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor: statusBg,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEditBatch(b)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FiEdit size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                      No batches added yet. Each product batch can have its own MRP, cost, and stock.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddBatchOpen(true)}
                      style={{
                        marginTop: "12px",
                        padding: "8px 18px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      + Add First Batch
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Content Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* FABRIC SPECIFICATIONS CARD */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiLayers />
                </div>
                <div>
                  <h3>Fabric Specifications</h3>
                  <p>Textile characteristics & technical specs</p>
                </div>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div>
                <span>Fabric Blend</span>
                <strong>{product.fabricComposition || "N/A"}</strong>
              </div>
              <div>
                <span>GSM (g/m²)</span>
                <strong>{product.gsm ? `${product.gsm} GSM` : "N/A"}</strong>
              </div>
              <div>
                <span>Roll Width</span>
                <strong>{product.rollWidth ? `${product.rollWidth} ${product.widthUnit || "Inches"}` : "N/A"}</strong>
              </div>
              <div>
                <span>Color</span>
                <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {product.colorCode && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: product.colorCode,
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                  {product.color || "N/A"}
                </strong>
              </div>
              <div>
                <span>Pattern / Design</span>
                <strong>{product.pattern || "Plain"}</strong>
              </div>
              <div>
                <span>Weave Type</span>
                <strong>{product.weaveType || "Plain weave"}</strong>
              </div>
              <div>
                <span>Texture / Finish</span>
                <strong>{product.textureFinish || "Soft"}</strong>
              </div>
              <div>
                <span>Number of Rolls</span>
                <strong>{product.numberOfRolls ? `${product.numberOfRolls} Rolls` : "N/A"}</strong>
              </div>
            </div>
          </section>

          {/* DYNAMIC VARIANTS MATRIX CARD */}
          {product.variants && product.variants.length > 0 && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiGrid />
                  </div>
                  <div>
                    <h3>Product Variants ({product.variants.length})</h3>
                    <p>Color, width, gsm & stock breakdown per variant</p>
                  </div>
                </div>
              </div>

              <div className={styles.tableWrapper} style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Variant SKU</th>
                      <th>Color</th>
                      <th>GSM / Width</th>
                      <th>Pattern</th>
                      <th>Stock</th>
                      <th>Rolls</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.sku || "N/A"}</strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {v.colorCode && (
                              <span
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  backgroundColor: v.colorCode,
                                  border: "1px solid #ddd",
                                }}
                              />
                            )}
                            {v.color || "Default"}
                          </div>
                        </td>
                        <td>
                          {v.gsm ? `${v.gsm} GSM` : ""} {v.rollWidth ? `(${v.rollWidth} ${v.widthUnit || "in"})` : ""}
                        </td>
                        <td>{v.pattern || "Solid"}</td>
                        <td>
                          <strong>{v.stock} {product.stockUnit || "m"}</strong>
                        </td>
                        <td>{v.numberOfRolls || "—"}</td>
                        <td style={{ fontWeight: "700", color: "#10b981" }}>
                          {v.sellingPrice ? formatPrice(v.sellingPrice) : formatPrice(sellingPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* PRICING DETAILS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiDollarSign />
                </div>
                <div>
                  <h3>Multi-Tier Pricing & Tax</h3>
                  <p>Pricing levels and tax configurations</p>
                </div>
              </div>
            </div>

            <div className={styles.pricingGrid}>
              <div>
                <span>Cost Price</span>
                <strong>{formatPrice(costPrice)}</strong>
              </div>
              <div>
                <span>Selling Price</span>
                <strong>{formatPrice(sellingPrice)}</strong>
              </div>
              <div>
                <span>Wholesale Price</span>
                <strong>{product.wholesalePrice ? formatPrice(product.wholesalePrice) : "N/A"}</strong>
              </div>
              <div>
                <span>Retail Price</span>
                <strong>{product.retailPrice ? formatPrice(product.retailPrice) : "N/A"}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>
                  {product.discountValue
                    ? `${product.discountType === "FIXED" ? "₹" : ""}${product.discountValue}${product.discountType === "PERCENT" ? "%" : ""}`
                    : "N/A"}
                </strong>
              </div>
              <div>
                <span>Tax Rate</span>
                <strong>{product.taxRate ? `${product.taxRate}%` : "18%"}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* INVENTORY LOCATION CARD */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiBox />
                </div>
                <div>
                  <h3>Warehouse & Storage Location</h3>
                  <p>Physical bin and shelf mapping</p>
                </div>
              </div>
            </div>

            <div className={styles.detailsGrid} style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <span>Store / Warehouse Location</span>
                <strong>{product.warehouseLocation || "Main Central Warehouse"}</strong>
              </div>
              <div>
                <span>Rack / Shelf / Bin Location</span>
                <strong>{product.rackLocation || "Rack A-12"}</strong>
              </div>
              <div>
                <span>Reorder Level</span>
                <strong>{product.reorderLevel || 20} {product.stockUnit || "Meters"}</strong>
              </div>
              <div>
                <span>Min / Max Stock Threshold</span>
                <strong>{minStock} min / {maxStock} max</strong>
              </div>
            </div>
          </section>

          {/* SUPPLIER CARD */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiTruck />
                </div>
                <div>
                  <h3>Supplier Details</h3>
                  <p>Vendor details and purchase lead time</p>
                </div>
              </div>
            </div>

            <div className={styles.detailsGrid} style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <span>Default Supplier</span>
                <strong>{product.supplier?.companyName || "N/A"}</strong>
              </div>
              <div>
                <span>Supplier Product Code</span>
                <strong>{product.supplierProductCode || "N/A"}</strong>
              </div>
              <div>
                <span>Lead Time</span>
                <strong>{product.leadTime ? `${product.leadTime} Days` : "N/A"}</strong>
              </div>
            </div>
          </section>

          {/* TIMELINE */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiCalendar />
                </div>
                <div>
                  <h3>Record Audit</h3>
                  <p>System timestamps</p>
                </div>
              </div>
            </div>

            <div className={styles.timeline}>
              <div>
                <span>Created Date</span>
                <strong>{new Date(product.createdAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span>Last Modified</span>
                <strong>{new Date(product.updatedAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Add Batch Modal */}
      <AddBatchModal
        isOpen={isAddBatchOpen}
        onClose={() => setIsAddBatchOpen(false)}
        product={product}
        onSuccess={fetchProduct}
      />

      {/* Edit Batch Modal */}
      <EditBatchModal
        isOpen={Boolean(selectedEditBatch)}
        onClose={() => setSelectedEditBatch(null)}
        batch={selectedEditBatch}
        onSuccess={fetchProduct}
      />
    </div>
  );
}
