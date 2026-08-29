"use client";

import React, { useState, useEffect } from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

import styles from "./inventoryDashboard.module.css";

/* =========================================================
   FALLBACK DEFAULT DATA
========================================================= */

const defaultCategoryData = [
  { name: "Electronics", value: 110 },
  { name: "Clothing", value: 95 },
  { name: "Machines", value: 78 },
  { name: "Sports", value: 62 },
  { name: "Bikes", value: 55 },
  { name: "Books", value: 38 },
];

const defaultProductStockData = [
  { month: "Jan", products: 220, outOfStock: 60 },
  { month: "Feb", products: 240, outOfStock: 80 },
  { month: "Mar", products: 200, outOfStock: 55 },
  { month: "Apr", products: 260, outOfStock: 95 },
  { month: "May", products: 720, outOfStock: 25 },
  { month: "Jun", products: 320, outOfStock: 110 },
  { month: "Jul", products: 280, outOfStock: 70 },
  { month: "Aug", products: 360, outOfStock: 130 },
  { month: "Sep", products: 410, outOfStock: 150 },
  { month: "Oct", products: 340, outOfStock: 95 },
  { month: "Nov", products: 290, outOfStock: 85 },
  { month: "Dec", products: 370, outOfStock: 120 },
];

const stockMiniData = [
  { value: 175 }, { value: 195 }, { value: 185 }, { value: 220 },
  { value: 245 }, { value: 220 }, { value: 265 }, { value: 245 },
  { value: 280 }, { value: 255 }, { value: 295 }, { value: 270 },
];

const valueMiniData = [
  { value: 120 }, { value: 160 }, { value: 145 }, { value: 205 },
  { value: 185 }, { value: 260 }, { value: 205 }, { value: 130 },
  { value: 180 }, { value: 145 }, { value: 170 }, { value: 150 },
];

const defaultSuppliers = [
  { code: "#SUP0020", name: "Apex Computers", contact: "Alexander Kenn", items: 45 },
  { code: "#SUP0019", name: "Beats Electronics", contact: "Gabriella White", items: 30 },
  { code: "#SUP0018", name: "Dazzle Footwear", contact: "Christopher Rey", items: 85 },
  { code: "#SUP0017", name: "Logitech Systems", contact: "Penelope Ton", items: 60 },
];

const defaultWarehouses = [
  { code: "#WRH0020", name: "Central Metro Hub", contact: "Alexander Kenn", capacity: "450,000", percentage: 86 },
  { code: "#WRH0019", name: "East Coast Logistics", contact: "Sophia Martinez", capacity: "120,000", percentage: 72 },
  { code: "#WRH0018", name: "Prime Storage Solutions", contact: "James Harris", capacity: "300,000", percentage: 61 },
  { code: "#WRH0017", name: "Global Supply Depot", contact: "Avery Thompson", capacity: "25,000", percentage: 40 },
];

const defaultRecentStocks = [
  { code: "#PRD0020", product: "Apple iPhone 15", sku: "APP-PH-15", category: "Smartphones", brand: "Apple", unit: "Piece", quantity: "02", sellingPrice: "$250", purchasePrice: "$230" },
  { code: "#PRD0019", product: "Dell XPS 13 9310", sku: "DEL-LAP-9310", category: "Computers", brand: "Dell", unit: "Piece", quantity: "12", sellingPrice: "$300", purchasePrice: "$280" },
  { code: "#PRD0018", product: "Bose QuietComfort 45", sku: "BOS-HD-45", category: "Headphones", brand: "Bose", unit: "Piece", quantity: "15", sellingPrice: "$100", purchasePrice: "$80" },
  { code: "#PRD0017", product: "Adidas Running Shoe", sku: "ADI-SHO-RUN", category: "Footwear", brand: "Adidas", unit: "Pack", quantity: "20", sellingPrice: "$400", purchasePrice: "$380" },
  { code: "#PRD0016", product: "Samsung Galaxy S24", sku: "SAM-PH-S24", category: "Smartphones", brand: "Samsung", unit: "Piece", quantity: "08", sellingPrice: "$280", purchasePrice: "$255" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      {payload.map((item, index) => (
        <div key={index}>
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
}

function CapacityCircle({ percentage }) {
  const color =
    percentage >= 80
      ? "#087c75"
      : percentage >= 60
        ? "#df7600"
        : percentage >= 40
          ? "#13a9df"
          : "#c71f28";

  return (
    <div
      className={styles.capacityCircle}
      style={{
        "--progress": `${percentage * 3.6}deg`,
        "--circle-color": color,
      }}
    >
      <span>{percentage}%</span>
    </div>
  );
}

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    totalValue: 0,
  });

  const [categoriesList, setCategoriesList] = useState(defaultCategoryData);
  const [suppliersList, setSuppliersList] = useState(defaultSuppliers);
  const [warehousesList, setWarehousesList] = useState(defaultWarehouses);
  const [recentStocksList, setRecentStocksList] = useState(defaultRecentStocks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveInventoryData();
  }, []);

  const fetchLiveInventoryData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, invReportRes, suppRes, wrhRes, invListRes] = await Promise.all([
        apiClient.get("/products").catch(() => null),
        apiClient.get("/categories").catch(() => null),
        apiClient.get("/reports/inventory").catch(() => null),
        apiClient.get("/suppliers").catch(() => null),
        apiClient.get("/warehouses").catch(() => null),
        apiClient.get("/inventory").catch(() => null),
      ]);

      const prods = prodRes?.data?.data || prodRes?.data || [];
      const cats = catRes?.data?.data || catRes?.data || [];
      const invReport = invReportRes?.data?.data;
      const suppliers = suppRes?.data?.data || suppRes?.data || [];
      const warehouses = wrhRes?.data?.data || wrhRes?.data || [];
      const inventories = invListRes?.data?.data || invListRes?.data || [];

      // 1. Process Stats
      let totalQty = 0;
      let lowCount = 0;
      let totalVal = 0;

      if (invReport?.summary && invReport.summary.totalItems > 0) {
        totalQty = invReport.summary.totalItems;
        lowCount = invReport.summary.lowStockCount;
        totalVal = invReport.summary.totalValuationRetail;
      } else if (inventories.length > 0) {
        inventories.forEach((item) => {
          const qty = Number(item.quantity || 0);
          totalQty += qty;
          if (item.product?.sellingPrice) {
            totalVal += qty * Number(item.product.sellingPrice);
          }
          if (item.reorderLevel && qty <= item.reorderLevel) {
            lowCount++;
          }
        });
      } else {
        prods.forEach((p) => {
          const qty = p.inventories?.reduce((a, b) => a + Number(b.quantity || 0), 0) ?? Number(p.quantity || 0);
          totalQty += qty;
          totalVal += qty * (parseFloat(p.sellingPrice) || 0);
          if (qty < 10) lowCount++;
        });
      }

      setStats({
        totalProducts: prods.length || 0,
        totalQuantity: totalQty || 0,
        lowStockCount: lowCount || 0,
        totalValue: totalVal || 0,
      });

      // 2. Process Categories distribution dynamically
      if (Array.isArray(cats) && cats.length > 0) {
        const formattedCats = cats.map((c) => {
          const categoryProducts = prods.filter((p) => p.categoryId === c.id || p.category?.name === c.name);
          const totalCategoryQty = categoryProducts.reduce((sum, p) => {
            const pQty = p.inventories?.reduce((a, b) => a + Number(b.quantity || 0), 0) ?? Number(p.quantity || 0) ?? 1;
            return sum + pQty;
          }, 0);

          return {
            name: c.name || "Category",
            value: totalCategoryQty > 0 ? totalCategoryQty : categoryProducts.length,
          };
        }).filter((c) => c.value > 0);

        if (formattedCats.length > 0) {
          setCategoriesList(formattedCats.slice(0, 6));
        }
      }

      // 3. Process Dynamic Suppliers (calculate actual supplied item count and sort top suppliers)
      if (Array.isArray(suppliers) && suppliers.length > 0) {
        const formattedSupp = suppliers.map((s, idx) => {
          let itemCount = 0;
          if (Array.isArray(s.purchases) && s.purchases.length > 0) {
            itemCount = s.purchases.reduce((acc, p) => {
              const pItemsCount = Array.isArray(p.items)
                ? p.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
                : 1;
              return acc + pItemsCount;
            }, 0);
          }

          const code = s.taxNumber
            ? `TAX-${s.taxNumber}`
            : `#SUP${String(idx + 1).padStart(4, "0")}`;

          return {
            id: s.id,
            code,
            name: s.companyName || s.name || "Supplier",
            contact: s.contactPerson || s.phone || s.email || "No contact info",
            items: itemCount,
          };
        }).sort((a, b) => b.items - a.items);

        setSuppliersList(formattedSupp.slice(0, 6));
      }

      // 4. Process Dynamic Warehouses
      if (Array.isArray(warehouses) && warehouses.length > 0) {
        const formattedWrh = warehouses.map((w, idx) => {
          let currentStock = 0;
          if (Array.isArray(w.inventories)) {
            currentStock = w.inventories.reduce((acc, inv) => acc + Number(inv.quantity || 0), 0);
          }

          const percentage = totalQty > 0
            ? Math.min(100, Math.max(10, Math.round((currentStock / totalQty) * 100)))
            : 50;

          return {
            id: w.id,
            code: w.code ? `#${w.code}` : `#WRH${String(idx + 1).padStart(4, "0")}`,
            name: w.name || "Warehouse",
            contact: w.phone || w.city || "Manager",
            capacity: currentStock.toLocaleString(),
            percentage: percentage,
          };
        });

        setWarehousesList(formattedWrh.slice(0, 6));
      }

      // 5. Process Dynamic Recent Stock Items
      if (invReport?.items?.length > 0) {
        const formattedStocks = invReport.items.slice(0, 5).map((item, idx) => ({
          code: item.sku ? `#${item.sku}` : `#PRD${String(idx + 1).padStart(4, "0")}`,
          product: item.productName || "Product",
          sku: item.sku || "SKU-001",
          category: item.categoryName || "General",
          brand: "Brand",
          unit: "Piece",
          quantity: String(item.quantity).padStart(2, "0"),
          sellingPrice: `$${Number(item.sellingPrice || 0).toFixed(2)}`,
          purchasePrice: `$${Number(item.costPrice || 0).toFixed(2)}`,
        }));
        setRecentStocksList(formattedStocks);
      } else if (Array.isArray(prods) && prods.length > 0) {
        const formattedStocks = prods.slice(0, 5).map((p, idx) => {
          const qty = p.inventories?.reduce((a, b) => a + Number(b.quantity || 0), 0) ?? Number(p.quantity || 0);
          return {
            code: p.sku ? `#${p.sku}` : `#PRD${String(idx + 1).padStart(4, "0")}`,
            product: p.name || "Product",
            sku: p.sku || `SKU-${idx + 1}`,
            category: p.category?.name || "General",
            brand: p.brand?.name || "Generic",
            unit: p.unit?.name || "Piece",
            quantity: String(qty).padStart(2, "0"),
            sellingPrice: p.sellingPrice ? `$${Number(p.sellingPrice).toFixed(2)}` : "$0.00",
            purchasePrice: p.costPrice ? `$${Number(p.costPrice).toFixed(2)}` : "$0.00",
          };
        });
        setRecentStocksList(formattedStocks);
      }
    } catch (err) {
      console.error("Error fetching live inventory dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.dashboard}>
      <DashboardNav />

      {/* HEADER */}
      <header className={styles.topbar}>
        <div>
          <h1>Inventory Dashboard</h1>
        </div>

        <div className={styles.actions}>
          <button className={styles.dateButton}>
            <span className={styles.buttonIcon}>▣</span>
            01 Jan 26 to 20 Jan 26
          </button>

          <button className={styles.exportButton}>
            <span className={styles.buttonIcon}>⇩</span>
            Export
            <span className={styles.arrow}>⌄</span>
          </button>

          <button className={styles.addButton}>
            <span>＋</span>
            Add Inventory
          </button>
        </div>
      </header>

      {/* TOP CONTENT */}
      <section className={styles.topGrid}>
        {/* LEFT MINI CARDS */}
        <div className={styles.leftColumn}>
          {/* TOTAL STOCK */}
          <article className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <p className={styles.cardLabel}>Total Stock</p>
                <div className={styles.valueRow}>
                  <strong>{stats.totalQuantity}</strong>
                  <span className={styles.positive}>+6.43%</span>
                </div>
              </div>
              <div className={`${styles.iconBox} ${styles.greenIcon}`}>◇</div>
            </div>

            <div className={styles.miniChart}>
              <ResponsiveContainer width="100%" height={45}>
                <LineChart data={stockMiniData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#087c75"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* TOTAL VALUE */}
          <article className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <p className={styles.cardLabel}>Inventory Value</p>
                <div className={styles.valueRow}>
                  <strong>${stats.totalValue.toLocaleString()}</strong>
                  <span className={styles.negative}>-2.15%</span>
                </div>
              </div>
              <div className={`${styles.iconBox} ${styles.orangeIcon}`}>❖</div>
            </div>

            <div className={styles.miniChart}>
              <ResponsiveContainer width="100%" height={45}>
                <LineChart data={valueMiniData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#df7600"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        {/* MIDDLE CATEGORY BARS */}
        <article className={`${styles.card} ${styles.middleCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Stock by Category</h3>
              <p className={styles.cardSub}>Categories by quantity</p>
            </div>
            <button className={styles.iconButton}>⚙</button>
          </div>

          <div className={styles.categoryChartArea}>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={categoriesList}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoriesList.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#087c75"
                          : index === 1
                            ? "#df7600"
                            : index === 2
                              ? "#13a9df"
                              : index === 3
                                ? "#6741d9"
                                : index === 4
                                  ? "#e64980"
                                  : "#fab005"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* RIGHT AREA / LINE COMBO */}
        <article className={`${styles.card} ${styles.rightCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Stock Trends & Out of Stock</h3>
              <p className={styles.cardSub}>Monthly analysis</p>
            </div>
            <button className={styles.iconButton}>⚙</button>
          </div>

          <div className={styles.stockTrendsChart}>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={defaultProductStockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="products"
                  name="In Stock"
                  stroke="#087c75"
                  fill="#087c7522"
                />
                <Area
                  type="monotone"
                  dataKey="outOfStock"
                  name="Out of Stock"
                  stroke="#c71f28"
                  fill="#c71f2822"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* SECTION: TOP SUPPLIERS & WAREHOUSE CAPACITIES (SIDE BY SIDE ON DESKTOP / RESPONSIVE GRID) */}
      <section className={styles.middleGrid}>
        {/* TOP SUPPLIERS CARD */}
        <article className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.headerTitleGroup}>
              <h3 className={styles.widgetTitle}>Top Suppliers</h3>
              <span className={styles.widgetSubtitle}>Suppliers ranked by fulfilled stock volume</span>
            </div>
            <a href="/admin/suppliers" className={styles.viewLink}>
              View All →
            </a>
          </div>

          <div className={styles.widgetList}>
            {suppliersList.length > 0 ? (
              suppliersList.map((item, idx) => (
                <div key={item.id || idx} className={styles.supplierItem}>
                  <div className={styles.supplierAvatar}>
                    {(item.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.supplierDetails}>
                    <div className={styles.supplierNameRow}>
                      <strong className={styles.supplierName}>{item.name}</strong>
                      <span className={styles.supplierCode}>{item.code}</span>
                    </div>
                    <span className={styles.supplierContact}>{item.contact}</span>
                  </div>
                  <div className={styles.badgePill}>
                    {item.items > 0 ? (
                      <>
                        <span className={styles.badgeNumber}>{item.items}</span>
                        <span className={styles.badgeText}>Items</span>
                      </>
                    ) : (
                      <span className={styles.badgeNeutral}>Active Vendor</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No supplier items available</p>
              </div>
            )}
          </div>
        </article>

        {/* WAREHOUSE CAPACITIES CARD */}
        <article className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.headerTitleGroup}>
              <h3 className={styles.widgetTitle}>Warehouse Capacities</h3>
              <span className={styles.widgetSubtitle}>Real-time storage space utilization</span>
            </div>
            <a href="/warehouse" className={styles.viewLink}>
              View All →
            </a>
          </div>

          <div className={styles.widgetList}>
            {warehousesList.length > 0 ? (
              warehousesList.map((wh, idx) => {
                const p = Math.min(100, Math.max(0, wh.percentage || 0));
                const progressColor =
                  p >= 85 ? "#dc2626" : p >= 65 ? "#d97706" : p >= 40 ? "#0284c7" : "#059669";
                return (
                  <div key={wh.id || idx} className={styles.warehouseItem}>
                    <div className={styles.warehouseDetails}>
                      <div className={styles.warehouseNameRow}>
                        <strong className={styles.warehouseName}>{wh.name}</strong>
                        <span className={styles.warehouseCode}>{wh.code}</span>
                      </div>
                      <span className={styles.warehouseContact}>Manager / Location: {wh.contact}</span>

                      {/* Clean progress indicator */}
                      <div className={styles.progressContainer}>
                        <div className={styles.progressBarTrack}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: `${p}%`,
                              backgroundColor: progressColor,
                            }}
                          />
                        </div>
                        <span className={styles.progressPercent} style={{ color: progressColor }}>
                          {p}% used
                        </span>
                      </div>
                    </div>

                    <div className={styles.capacityMeta}>
                      <strong className={styles.capacityAmount}>{wh.capacity}</strong>
                      <span className={styles.capacityUnits}>units stored</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>No warehouse capacities available</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* SECTION: RECENT STOCK ITEMS TABLE (FULL WIDTH CARD) */}
      <section className={styles.bottomSection}>
        <article className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <div className={styles.headerTitleGroup}>
              <h3 className={styles.widgetTitle}>Recent Stock Items</h3>
              <span className={styles.widgetSubtitle}>Latest SKU movements and inventory updates</span>
            </div>
            <a href="/admin/inventory" className={styles.viewLink}>
              View All →
            </a>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {recentStocksList.length > 0 ? (
                  recentStocksList.map((stk, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong className={styles.productNameText}>{stk.product}</strong>
                      </td>
                      <td>
                        <span className={styles.skuTag}>{stk.sku}</span>
                      </td>
                      <td>{stk.category}</td>
                      <td>
                        <span className={styles.qtyPill}>{stk.quantity}</span>
                      </td>
                      <td>
                        <strong className={styles.priceTag}>{stk.sellingPrice}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No recent stock items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}