"use client";

import { useCompany } from "@/context/CompanyContext";
import {
  FiMonitor,
  FiUsers,
  FiLayers,
  FiGrid,
  FiRefreshCw,
  FiShield,
  FiAlertTriangle,
  FiArrowLeft,
  FiBriefcase,
  FiCoffee
} from "react-icons/fi";
import Link from "next/link";
import styles from "./superAdminDashboard.module.css";

export default function SuperAdminDashboard() {
  const {
    user,
    industryOverride,
    changeIndustryOverride,
    industryCode,
    loading
  } = useCompany();

  const roleUpper = (user?.role || "").toUpperCase();
  const isSuperAdmin = roleUpper.includes("SUPER");

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading Super Admin Context...
      </div>
    );
  }

  // Access control
  if (!isSuperAdmin) {
    return (
      <div style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif"
      }}>
        <FiAlertTriangle size={48} style={{ color: "#ef4444", marginBottom: "16px" }} />
        <h2 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "22px", fontWeight: "700" }}>Access Denied</h2>
        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "14px", textAlign: "center", maxWidth: "400px" }}>
          You do not have the required Super Admin privileges to access this control center.
        </p>
        <Link 
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1>
          <FiShield style={{ color: "#4f46e5" }} /> Super Admin Control Dashboard
        </h1>
        <p>
          Simulate different client environments, test module combinations, and toggle the active 
          business type modules loaded in the application layout aside navigation.
        </p>
      </header>

      {/* ACTIVE STATUS BANNER */}
      <section className={styles.activeBanner}>
        <div className={styles.activeInfo}>
          <span className={styles.activeLabel}>Active Context View:</span>
          <span className={styles.activeVal}>
            {industryOverride ? <FiRefreshCw size={14} style={{ marginRight: "4px" }} /> : null}
            {industryCode} {industryOverride ? "(OVERRIDDEN)" : "(DEFAULT)"}
          </span>
        </div>

        {industryOverride && (
          <button 
            className={styles.resetBtn}
            onClick={() => changeIndustryOverride(null)}
          >
            <FiRefreshCw size={14} />
            Reset to Default
          </button>
        )}
      </section>

      {/* CARDS GRID */}
      <div className={styles.cardsGrid}>
        {/* RETAIL CARD */}
        <div className={`${styles.card} ${styles.cardRetail} ${industryCode === "RETAIL" ? styles.cardActive : ""}`}>
          <div className={`${styles.cardIcon} ${styles.iconRetail}`}>
            <FiMonitor />
          </div>
          <h3>Retail & Commerce</h3>
          <p>Standard retail workflow including POS transactions, warehouses, product listings, invoices, and customers.</p>
          
          <div className={styles.modulesList}>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotRetail}`} />
              <span>POS Sales Terminal & Barcodes</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotRetail}`} />
              <span>Product, Brands, & Categories</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotRetail}`} />
              <span>Inventory Stock & Vendors</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotRetail}`} />
              <span>Invoices & Sales Orders</span>
            </div>
          </div>

          <button 
            className={`${styles.actionBtn} ${styles.btnRetail} ${industryCode === "RETAIL" ? styles.btnActive : ""}`}
            onClick={() => changeIndustryOverride("RETAIL")}
            disabled={industryCode === "RETAIL"}
          >
            {industryCode === "RETAIL" ? "Currently Simulating" : "Activate Retail View"}
          </button>
        </div>

        {/* GYM CARD */}
        <div className={`${styles.card} ${styles.cardGym} ${industryCode === "GYM" ? styles.cardActive : ""}`}>
          <div className={`${styles.cardIcon} ${styles.iconGym}`}>
            <FiUsers />
          </div>
          <h3>Gym & Fitness Club</h3>
          <p>Manage membership subscription plans, member profile logins, trainers, daily attendance logs, and fee payments.</p>
          
          <div className={styles.modulesList}>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotGym}`} />
              <span>Member Profile Registration</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotGym}`} />
              <span>Membership Subscription Plans</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotGym}`} />
              <span>Trainer Allocation & Payroll</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotGym}`} />
              <span>Attendance Logging & Payments</span>
            </div>
          </div>

          <button 
            className={`${styles.actionBtn} ${styles.btnGym} ${industryCode === "GYM" ? styles.btnActive : ""}`}
            onClick={() => changeIndustryOverride("GYM")}
            disabled={industryCode === "GYM"}
          >
            {industryCode === "GYM" ? "Currently Simulating" : "Activate Gym View"}
          </button>
        </div>

        {/* TEXTILE CARD */}
        <div className={`${styles.card} ${styles.cardTextile} ${industryCode === "TEXTILE" ? styles.cardActive : ""}`}>
          <div className={`${styles.cardIcon} ${styles.iconTextile}`}>
            <FiLayers />
          </div>
          <h3>Textile ERP Mill</h3>
          <p>Heavy manufacturing tracking for yarn mills, dye batches, production workflow status, raw materials, and quality audits.</p>
          
          <div className={styles.modulesList}>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotTextile}`} />
              <span>Production Tracking & Mill Scheduling</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotTextile}`} />
              <span>Yarn, Fabric, & Raw Materials</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotTextile}`} />
              <span>Batch Quality Control Auditing</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={`${styles.moduleDot} ${styles.dotTextile}`} />
              <span>Export Shipments & Mill Warehouses</span>
            </div>
          </div>

          <button 
            className={`${styles.actionBtn} ${styles.btnTextile} ${industryCode === "TEXTILE" ? styles.btnActive : ""}`}
            onClick={() => changeIndustryOverride("TEXTILE")}
            disabled={industryCode === "TEXTILE"}
          >
            {industryCode === "TEXTILE" ? "Currently Simulating" : "Activate Textile View"}
          </button>
        </div>

        {/* RESTAURANT CARD */}
        <div className={`${styles.card} ${industryCode === "RESTAURANT" ? styles.cardActive : ""}`} style={{ borderColor: industryCode === "RESTAURANT" ? "#f59e0b" : "#e2e8f0" }}>
          <div className={styles.cardIcon} style={{ background: "#fef3c7", color: "#d97706" }}>
            <FiCoffee />
          </div>
          <h3>Restaurant & Food ERP</h3>
          <p>Complete food service management with Dine-In/Takeaway POS, Table floor plans, KOT kitchen displays, recipe BOM, and food costing.</p>
          
          <div className={styles.modulesList}>
            <div className={styles.moduleItem}>
              <span className={styles.moduleDot} style={{ background: "#f59e0b" }} />
              <span>Restaurant POS & Floor Table Map</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={styles.moduleDot} style={{ background: "#f59e0b" }} />
              <span>Kitchen Display System (KDS) & KOT</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={styles.moduleDot} style={{ background: "#f59e0b" }} />
              <span>Recipe BOM & Auto Stock Deduction</span>
            </div>
            <div className={styles.moduleItem}>
              <span className={styles.moduleDot} style={{ background: "#f59e0b" }} />
              <span>Food Costing & Wastage Logs</span>
            </div>
          </div>

          <button 
            className={styles.actionBtn}
            style={{
              background: industryCode === "RESTAURANT" ? "#f59e0b" : "#fef3c7",
              color: industryCode === "RESTAURANT" ? "#ffffff" : "#d97706",
              border: "none"
            }}
            onClick={() => changeIndustryOverride("RESTAURANT")}
            disabled={industryCode === "RESTAURANT"}
          >
            {industryCode === "RESTAURANT" ? "Currently Simulating" : "Activate Restaurant View"}
          </button>
        </div>
      </div>
    </main>
  );
}
