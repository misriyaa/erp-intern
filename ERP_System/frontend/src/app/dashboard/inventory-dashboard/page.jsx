"use client";

import React from "react";
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
   DATA
========================================================= */

const categoryData = [
  { name: "Electronics", value: 110 },
  { name: "Clothing", value: 95 },
  { name: "Machines", value: 78 },
  { name: "Sports", value: 62 },
  { name: "Bikes", value: 55 },
  { name: "Books", value: 38 },
];

const productStockData = [
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

const inventoryValueData = [
  { month: "Jan", value: 320 },
  { month: "Feb", value: 410 },
  { month: "Mar", value: 380 },
  { month: "Apr", value: 460 },
  { month: "May", value: 570 },
  { month: "Jun", value: 420 },
  { month: "Jul", value: 510 },
  { month: "Aug", value: 480 },
  { month: "Sep", value: 540 },
  { month: "Oct", value: 460 },
  { month: "Nov", value: 520 },
  { month: "Dec", value: 580 },
];

const stockMiniData = [
  { value: 175 },
  { value: 195 },
  { value: 185 },
  { value: 220 },
  { value: 245 },
  { value: 220 },
  { value: 265 },
  { value: 245 },
  { value: 280 },
  { value: 255 },
  { value: 295 },
  { value: 270 },
];

const valueMiniData = [
  { value: 120 },
  { value: 160 },
  { value: 145 },
  { value: 205 },
  { value: 185 },
  { value: 260 },
  { value: 205 },
  { value: 130 },
  { value: 180 },
  { value: 145 },
  { value: 170 },
  { value: 150 },
];

const suppliers = [
  {
    code: "#LED0020",
    name: "Apex Computers",
    supplied: "$40,000",
    icon: "▣",
    status: "Active",
  },
  {
    code: "#LED0019",
    name: "Beats Headphones",
    supplied: "$34,000",
    icon: "♧",
    status: "Inactive",
  },
  {
    code: "#LED0018",
    name: "Dazzle Shoes",
    supplied: "$32,000",
    icon: "▱",
    status: "Active",
  },
  {
    code: "#LED0017",
    name: "Best Accessories",
    supplied: "$27,000",
    icon: "▢",
    status: "Active",
  },
  {
    code: "#LED0016",
    name: "A-Z Store",
    supplied: "$13,000",
    icon: "▤",
    status: "Inactive",
  },
];

const warehouses = [
  {
    code: "#WRH0020",
    name: "Smart Stock Hub",
    contact: "Ethan Walker",
    capacity: "30,000",
    percentage: 85,
  },
  {
    code: "#WRH0019",
    name: "Flow Grid Storage",
    contact: "Madison Clark",
    capacity: "20,000",
    percentage: 75,
  },
  {
    code: "#WRH0018",
    name: "Prime Storage Solutions",
    contact: "James Harris",
    capacity: "300,000",
    percentage: 61,
  },
  {
    code: "#WRH0017",
    name: "Global Supply Depot",
    contact: "Avery Thompson",
    capacity: "25,000",
    percentage: 40,
  },
  {
    code: "#WRH0016",
    name: "Silverline Storage",
    contact: "Benjamin Wright",
    capacity: "16,000",
    percentage: 32,
  },
];

const recentStocks = [
  {
    code: "#PRD0020",
    product: "Apple iPhone 15",
    sku: "APP-PH-15",
    category: "Smartphones",
    brand: "Apple",
    unit: "Piece",
    quantity: "02",
    sellingPrice: "$250",
    purchasePrice: "$230",
    icon: "●",
  },
  {
    code: "#PRD0019",
    product: "Dell XPS 13 9310",
    sku: "DEL-LAP-9310",
    category: "Computers",
    brand: "Dell",
    unit: "Piece",
    quantity: "12",
    sellingPrice: "$300",
    purchasePrice: "$280",
    icon: "▣",
  },
  {
    code: "#PRD0018",
    product: "Bose QuietComfort 45",
    sku: "BOS-HD-45",
    category: "Headphones",
    brand: "Bose",
    unit: "Piece",
    quantity: "15",
    sellingPrice: "$100",
    purchasePrice: "$80",
    icon: "◉",
  },
  {
    code: "#PRD0017",
    product: "Adidas Running Shoe",
    sku: "ADI-SHO-RUN",
    category: "Footwear",
    brand: "Adidas",
    unit: "Pack",
    quantity: "20",
    sellingPrice: "$400",
    purchasePrice: "$380",
    icon: "▱",
  },
  {
    code: "#PRD0016",
    product: "Samsung Galaxy S24",
    sku: "SAM-PH-S24",
    category: "Smartphones",
    brand: "Samsung",
    unit: "Piece",
    quantity: "08",
    sellingPrice: "$280",
    purchasePrice: "$255",
    icon: "◈",
  },
];

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

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

/* =========================================================
   CAPACITY CIRCLE
========================================================= */

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

/* =========================================================
   PAGE
========================================================= */

export default function InventoryDashboard() {
  return (
    <main className={styles.dashboard}>
      {/* =====================================================
          HEADER
      ===================================================== */}

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

      {/* =====================================================
          TOP CONTENT
      ===================================================== */}

      <section className={styles.topGrid}>
        {/* LEFT MINI CARDS */}

        <div className={styles.leftColumn}>
          {/* TOTAL STOCK */}

          <article className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <p className={styles.cardLabel}>Total Stock</p>

                <div className={styles.valueRow}>
                  <strong>250</strong>

                  <span className={styles.positive}>
                    +6.43%
                  </span>
                </div>
              </div>

              <div className={`${styles.iconBox} ${styles.greenIcon}`}>
                ◇
              </div>
            </div>

            <div className={styles.miniChart}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockMiniData}>
                  <defs>
                    <linearGradient
                      id="stockMiniGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#079574"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="100%"
                        stopColor="#079574"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#079574"
                    strokeWidth={2.5}
                    fill="url(#stockMiniGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* INVENTORY VALUE */}

          <article className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <div>
                <p className={styles.cardLabel}>
                  Inventory Value
                </p>

                <div className={styles.valueRow}>
                  <strong>$2,300</strong>

                  <span className={styles.negative}>
                    -3.72%
                  </span>
                </div>
              </div>

              <div className={`${styles.iconBox} ${styles.orangeIcon}`}>
                $
              </div>
            </div>

            <div className={styles.miniChart}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={valueMiniData}>
                  <defs>
                    <linearGradient
                      id="valueMiniGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ef6200"
                        stopOpacity={0.2}
                      />

                      <stop
                        offset="100%"
                        stopColor="#ef6200"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ef6200"
                    strokeWidth={2.5}
                    fill="url(#valueMiniGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        {/* =================================================
            CATEGORY DISTRIBUTION
        ================================================= */}

        <article className={`${styles.card} ${styles.categoryCard}`}>
          <div className={styles.cardHeader}>
            <h2>Category Distribution</h2>

            <button className={styles.yearButton}>
              2026 <span>⌄</span>
            </button>
          </div>

          <div className={styles.categoryChart}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{
                  top: 15,
                  right: 10,
                  bottom: 10,
                  left: 0,
                }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={true}
                  stroke="#e4e8eb"
                  strokeDasharray="4 5"
                />

                <XAxis
                  type="number"
                  domain={[0, 120]}
                  tick={{ fill: "#73849a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={86}
                  tick={{
                    fill: "#6d7e94",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: "rgba(7,149,116,0.04)",
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Products"
                  fill="#2da784"
                  radius={[4, 4, 4, 4]}
                  barSize={21}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.categoryNote}>
            <span className={styles.noteDot}>●</span>

            <span>
              No of Products increased by{" "}
              <strong>+20%</strong> from last Week
            </span>
          </div>
        </article>

        {/* =================================================
            PRODUCT STOCK LEVELS
        ================================================= */}

        <article className={`${styles.card} ${styles.stockLevels}`}>
          <div className={styles.cardHeader}>
            <h2>Product Stock Levels</h2>

            <button className={styles.yearButton}>
              2026 <span>⌄</span>
            </button>
          </div>

          <div className={styles.productChart}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={productStockData}
                margin={{
                  top: 20,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#e4e8eb"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#73849a",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 800]}
                  ticks={[0, 200, 400, 600, 800]}
                  tick={{
                    fill: "#73849a",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey="products"
                  name="Total Products"
                  fill="#2da784"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />

                <Line
                  type="monotone"
                  dataKey="outOfStock"
                  name="Out Of Stock"
                  stroke="#ed5c16"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartLegend}>
            <span>
              <i
                style={{
                  background: "#079574",
                }}
              />

              Total Products
            </span>

            <span>
              <i
                style={{
                  background: "#ed5c16",
                }}
              />

              Out Of Stock
            </span>
          </div>
        </article>
      </section>

      {/* =====================================================
          SUPPLIERS + WAREHOUSE
      ===================================================== */}

      <section className={styles.middleGrid}>
        {/* SUPPLIERS */}

        <article className={`${styles.card} ${styles.listCard}`}>
          <div className={styles.cardHeader}>
            <h2>Suppliers</h2>

            <button className={styles.viewButton}>
              View All <span>›</span>
            </button>
          </div>

          <div className={styles.supplierList}>
            {suppliers.map((supplier) => (
              <div
                className={styles.supplierRow}
                key={supplier.code}
              >
                <div className={styles.supplierIcon}>
                  {supplier.icon}
                </div>

                <div className={styles.supplierName}>
                  <small>{supplier.code}</small>
                  <strong>{supplier.name}</strong>
                </div>

                <div className={styles.supplied}>
                  <small>Goods Supplied</small>
                  <strong>{supplier.supplied}</strong>
                </div>

                <span
                  className={
                    supplier.status === "Active"
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {supplier.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* WAREHOUSE */}

        <article className={`${styles.card} ${styles.listCard}`}>
          <div className={styles.cardHeader}>
            <h2>Warehouse</h2>

            <button className={styles.viewButton}>
              View All <span>›</span>
            </button>
          </div>

          <div className={styles.warehouseList}>
            {warehouses.map((warehouse) => (
              <div
                className={styles.warehouseRow}
                key={warehouse.code}
              >
                <div className={styles.warehouseName}>
                  <small>{warehouse.code}</small>
                  <strong>{warehouse.name}</strong>
                </div>

                <div className={styles.contact}>
                  <small>Contact Person</small>
                  <strong>{warehouse.contact}</strong>
                </div>

                <div className={styles.capacity}>
                  <small>Capacity</small>
                  <strong>{warehouse.capacity}</strong>
                </div>

                <CapacityCircle
                  percentage={warehouse.percentage}
                />
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* =====================================================
          INVENTORY VALUE
      ===================================================== */}

      <section className={styles.fullWidthSection}>
        <article className={`${styles.card} ${styles.inventoryChartCard}`}>
          <div className={styles.cardHeader}>
            <h2>Inventory Value</h2>

            <button className={styles.yearButton}>
              2026 <span>⌄</span>
            </button>
          </div>

          <div className={styles.largeInventoryChart}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={inventoryValueData}
                margin={{
                  top: 20,
                  right: 10,
                  left: 5,
                  bottom: 10,
                }}
              >
                <defs>
                  <linearGradient
                    id="inventoryGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#079574"
                      stopOpacity={0.18}
                    />

                    <stop
                      offset="100%"
                      stopColor="#079574"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e3e7ea"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#73849a",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[300, 600]}
                  ticks={[
                    300,
                    350,
                    400,
                    450,
                    500,
                    550,
                    600,
                  ]}
                  tick={{
                    fill: "#73849a",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Inventory Value"
                  stroke="#079574"
                  strokeWidth={2.5}
                  fill="url(#inventoryGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* =====================================================
          RECENT STOCKS
      ===================================================== */}

      <section className={styles.fullWidthSection}>
        <article className={`${styles.card} ${styles.recentStocks}`}>
          <div className={styles.cardHeader}>
            <h2>Recent Stocks</h2>

            <button className={styles.viewButton}>
              View All <span>›</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.stockTable}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                  <th>Purchase Price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentStocks.map((stock) => (
                  <tr key={stock.code}>
                    <td>{stock.code}</td>

                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productIcon}>
                          {stock.icon}
                        </span>

                        <strong>{stock.product}</strong>
                      </div>
                    </td>

                    <td>{stock.sku}</td>

                    <td>{stock.category}</td>

                    <td>{stock.brand}</td>

                    <td>{stock.unit}</td>

                    <td className={styles.quantity}>
                      {stock.quantity}
                    </td>

                    <td className={styles.price}>
                      {stock.sellingPrice}
                    </td>

                    <td className={styles.price}>
                      {stock.purchasePrice}
                    </td>

                    <td>
                      <span className={styles.stockStatus}>
                        In Stock <span>⌄</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className={styles.footer}>
        2026 © Inventory Management System. All Rights Reserved
      </footer>
    </main>
  );
}