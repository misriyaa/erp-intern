"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import axios from 'axios';
import apiClient from "@/services/apiClient";
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiPrinter,
  FiDownload,
  FiPackage,
  FiBox,
  FiDollarSign,
  FiTag,
  FiTruck,
  FiLayers,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import { Loader2 } from 'lucide-react';

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
      console.error('Failed to fetch product', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
         <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite', color: '#0d6efd' }} size={40} />
       </div>
     );
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Product Not Found</h2>
        <button className={styles.backButton} onClick={() => router.push('/admin/products/view')} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiArrowLeft /> Back to Products
        </button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(price || 0);
  };

  const costPrice = parseFloat(product.costPrice || 0);
  const sellingPrice = parseFloat(product.sellingPrice || 0);
  const profit = sellingPrice - costPrice;
  const profitMargin = costPrice > 0 ? (profit / costPrice) * 100 : 100;

  // Inventory logic
  const currentStock = product.inventories?.reduce((acc, inv) => acc + (inv.quantity || 0), 0) || 0;
  const maxStock = product.inventories?.[0]?.maximumStock || 100;
  const minStock = product.inventories?.[0]?.minimumStock || 10;
  
  const stockPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (confirmed) {
      try {
        await apiClient.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
        router.push("/admin/products/view");
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
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
              Products <span>/</span> Product Details
            </div>

            <h1>Product Details</h1>
            <p>View complete information about this product.</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={handlePrint}
          >
            <FiPrinter />
            Print
          </button>

          <Link
            href={`/admin/products/edit/${product.id}`}
            className={styles.editButton}
          >
            <FiEdit />
            Edit Product
          </Link>

          <button
            className={styles.deleteButton}
            onClick={handleDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Product Overview */}
      <div className={styles.productCard}>
        <div className={styles.productImageWrapper}>
          <div className={styles.productImage}>
             {imageUrl ? (
               <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
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
                {product.barcodes && product.barcodes.length > 0 && (
                   <span>Barcode: {product.barcodes[0].barcode}</span>
                )}
              </div>
            </div>

            <span className={styles.activeBadge}>
              <span></span>
              {product.status || 'ACTIVE'}
            </span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span>Category</span>
              <strong>{product.category?.name || "N/A"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Brand</span>
              <strong>{product.brand?.name || "N/A"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Unit</span>
              <strong>{product.unit?.name || "N/A"}</strong>
            </div>
            
            <div className={styles.infoItem}>
              <span>Code</span>
              <strong>{product.code || "N/A"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiDollarSign />
          </div>

          <div>
            <span>Purchase Price</span>
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
            <span>Current Stock</span>
            <h3>{currentStock} Units</h3>
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

      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Pricing */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiDollarSign />
                </div>

                <div>
                  <h3>Pricing Information</h3>
                  <p>Product pricing and profit details</p>
                </div>
              </div>
            </div>

            <div className={styles.pricingGrid}>
              <div>
                <span>Purchase Price</span>
                <strong>{formatPrice(costPrice)}</strong>
              </div>

              <div>
                <span>Selling Price</span>
                <strong>{formatPrice(sellingPrice)}</strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  {product.discountValue 
                    ? `${product.discountType === 'FIXED' ? '$' : ''}${product.discountValue}${product.discountType === 'PERCENT' ? '%' : ''}` 
                    : 'N/A'
                  }
                </strong>
              </div>

              <div>
                <span>Tax</span>
                <strong>{product.tax || '0'}%</strong>
              </div>

              <div>
                <span>Profit per Unit</span>
                <strong className={styles.profit}>
                  {formatPrice(profit)}
                </strong>
              </div>

              <div>
                <span>Profit Margin</span>
                <strong className={styles.profit}>
                  {profitMargin.toFixed(1)}%
                </strong>
              </div>
            </div>
          </section>

          {/* Product Information */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiLayers />
                </div>

                <div>
                  <h3>Product Information</h3>
                  <p>General information about this product</p>
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <span>Description</span>
              <p>{product.description || "No description provided."}</p>
            </div>

            <div className={styles.detailsGrid}>
              <div>
                <span>Product Name</span>
                <strong>{product.name}</strong>
              </div>

              <div>
                <span>SKU</span>
                <strong>{product.sku}</strong>
              </div>

              <div>
                <span>Barcode</span>
                <strong>{product.barcodes?.[0]?.barcode || "N/A"}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{product.category?.name || "N/A"}</strong>
              </div>

              <div>
                <span>Brand</span>
                <strong>{product.brand?.name || "N/A"}</strong>
              </div>

              <div>
                <span>Unit</span>
                <strong>{product.unit?.name || "N/A"}</strong>
              </div>
            </div>
          </section>

          {/* Warehouse */}
          {product.inventories && product.inventories.length > 0 && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.titleIcon}>
                    <FiBox />
                  </div>

                  <div>
                    <h3>Warehouse Stock</h3>
                    <p>Stock available across warehouses</p>
                  </div>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Warehouse</th>
                      <th>Quantity</th>
                      <th>Min Stock</th>
                      <th>Max Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {product.inventories.map((inv, index) => (
                      <tr key={index}>
                        <td>
                          <div className={styles.warehouseName}>
                            <FiBox />
                            {inv.warehouse?.name || "Unknown"}
                          </div>
                        </td>

                        <td>
                          <strong>{inv.quantity}</strong>
                        </td>

                        <td>{inv.minimumStock}</td>

                        <td>
                          <strong>{inv.maximumStock}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Stock Card */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiPackage />
                </div>

                <div>
                  <h3>Inventory</h3>
                  <p>Current stock information</p>
                </div>
              </div>
            </div>

            <div className={styles.stockMain}>
              <div className={styles.stockNumber}>
                {currentStock}
                <span>Units</span>
              </div>

              <span className={styles.stockStatus}>
                {currentStock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span>Stock Level</span>
                <strong>{Math.round(stockPercentage)}%</strong>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{
                    width: `${Math.min(stockPercentage, 100)}%`,
                    backgroundColor: stockPercentage < 20 ? '#ef4444' : stockPercentage < 50 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.stockDetails}>
              <div>
                <span>Available</span>
                <strong>{currentStock}</strong>
              </div>

              <div>
                <span>Reserved</span>
                <strong>0</strong>
              </div>

              <div>
                <span>Minimum</span>
                <strong>{minStock}</strong>
              </div>

              <div>
                <span>Maximum</span>
                <strong>{maxStock}</strong>
              </div>
            </div>
          </section>

          {/* Dates */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.titleIcon}>
                  <FiCalendar />
                </div>

                <div>
                  <h3>Product Timeline</h3>
                  <p>Product creation information</p>
                </div>
              </div>
            </div>

            <div className={styles.timeline}>
              <div>
                <span>Created</span>
                <strong>{new Date(product.createdAt).toLocaleDateString()}</strong>
              </div>

              <div>
                <span>Last Updated</span>
                <strong>{new Date(product.updatedAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
