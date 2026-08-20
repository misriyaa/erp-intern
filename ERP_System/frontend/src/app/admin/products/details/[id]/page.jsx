"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
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
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

import styles from "../details.module.css";

export default function ProductDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const currentStock = product.initialStock || product.inventories?.reduce((acc, inv) => acc + (inv.quantity || 0), 0) || 0;
  const maxStock = product.maximumStock || 1000;
  const minStock = product.minimumStock || 10;
  const stockPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this fabric product?");
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
    return `http://localhost:5000${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const imageUrl = getImageUrl(product.image);

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
            <span>Selling Price</span>
            <h3>{formatPrice(sellingPrice)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiBox />
          </div>
          <div>
            <span>Total Available Stock</span>
            <h3>{currentStock} {product.stockUnit || "Meters"}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiBarChart2 />
          </div>
          <div>
            <span>Profit Margin</span>
            <h3>{profitMargin.toFixed(1)}%</h3>
          </div>
        </div>
      </div>

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
    </div>
  );
}
