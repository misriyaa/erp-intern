"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiGlobe,
  FiFileText,
  FiShoppingCart,
  FiShield,
  FiSave,
  FiRefreshCw,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiImage,
  FiBox,
  FiTag,
  FiLayout,
  FiExternalLink,
  FiPlus,
  FiLayers,
  FiPrinter,
} from "react-icons/fi";
import { getSettings, updateSettings, resetSettings } from "@/services/settingsService";
import { getLandingPage, updateLandingPage } from "@/services/landingAdmin.service";
import { useSettings } from "@/context/SettingsContext";
import styles from "./settings.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [toast, setToast] = useState({ type: null, message: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Landing Page Settings State
  const [landingLoading, setLandingLoading] = useState(false);
  const [landingSaving, setLandingSaving] = useState(false);
  const [landingForm, setLandingForm] = useState({
    logoText: "",
    logoHighlight: "",
    loginText: "",
    heroTag: "",
    heroTitle: "",
    heroDescription: "",
    heroButtonText: "",
    dashboardTitle: "",
    dashboardSubtitle: "",
    aboutTag: "",
    aboutTitle: "",
    aboutDescription: "",
    footerText: "",
  });

  const [landingFiles, setLandingFiles] = useState({
    heroImage: null,
    heroBackgroundImage: null,
    aboutImage1: null,
    aboutImage2: null,
    aboutImage3: null,
    aboutImage4: null,
  });

  const [landingPreview, setLandingPreview] = useState({
    heroImage: "",
    heroBackgroundImage: "",
    aboutImage1: "",
    aboutImage2: "",
    aboutImage3: "",
    aboutImage4: "",
  });

  const [formData, setFormData] = useState({
    // Business Info
    companyName: "",
    legalName: "",
    taxNumber: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyLogo: "",

    // Localization & Finance
    currency: "USD",
    currencySymbol: "$",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
    fiscalYearStart: "January",

    // Invoicing & Sales
    invoicePrefix: "INV-",
    salesOrderPrefix: "SO-",
    purchaseOrderPrefix: "PO-",
    defaultTaxRate: 0,
    enableMultiBranch: false,

    // Inventory & POS
    enableStockAlerts: true,
    lowStockThreshold: 10,
    receiptHeader: "",
    receiptFooter: "",
    receiptPaperSize: "80mm",
    autoPrintReceipt: true,
    showTaxOnReceipt: true,

    // Security & System
    emailNotifications: true,
    dailyReportEmail: false,
    sessionTimeoutMinutes: 60,
    themePreference: "system",
  });

  // Fetch Settings on Mount
  useEffect(() => {
    fetchSettingsData();
    loadLandingData();
  }, []);

  const loadLandingData = async () => {
    try {
      setLandingLoading(true);
      const data = await getLandingPage();
      if (data) {
        setLandingForm({
          logoText: data.logoText || "",
          logoHighlight: data.logoHighlight || "",
          loginText: data.loginText || "",
          heroTag: data.heroTag || "",
          heroTitle: data.heroTitle || "",
          heroDescription: data.heroDescription || "",
          heroButtonText: data.heroButtonText || "",
          dashboardTitle: data.dashboardTitle || "",
          dashboardSubtitle: data.dashboardSubtitle || "",
          aboutTag: data.aboutTag || "",
          aboutTitle: data.aboutTitle || "",
          aboutDescription: data.aboutDescription || "",
          footerText: data.footerText || "",
        });
        setLandingPreview({
          heroImage: data.heroImage ? `${API_URL}/uploads/landingpageimage/${data.heroImage}` : "",
          heroBackgroundImage: data.heroBackgroundImage ? `${API_URL}/uploads/landingpageimage/${data.heroBackgroundImage}` : "",
          aboutImage1: data.aboutImage1 ? `${API_URL}/uploads/landingpageimage/${data.aboutImage1}` : "",
          aboutImage2: data.aboutImage2 ? `${API_URL}/uploads/landingpageimage/${data.aboutImage2}` : "",
          aboutImage3: data.aboutImage3 ? `${API_URL}/uploads/landingpageimage/${data.aboutImage3}` : "",
          aboutImage4: data.aboutImage4 ? `${API_URL}/uploads/landingpageimage/${data.aboutImage4}` : "",
        });
      }
    } catch (err) {
      console.error("Load landing data error:", err);
    } finally {
      setLandingLoading(false);
    }
  };

  const handleLandingChange = (e) => {
    const { name, value } = e.target;
    setLandingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLandingImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = e.target.name;
    setLandingFiles((prev) => ({ ...prev, [name]: file }));
    setLandingPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const handleLandingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLandingSaving(true);
      const payload = new FormData();
      Object.keys(landingForm).forEach((key) => {
        payload.append(key, landingForm[key]);
      });
      Object.keys(landingFiles).forEach((key) => {
        if (landingFiles[key]) {
          payload.append(key, landingFiles[key]);
        }
      });
      await updateLandingPage(payload);
      showToast("success", "Landing page settings updated successfully!");
      await loadLandingData();
    } catch (err) {
      console.error("Update landing error:", err);
      showToast("error", err.message || "Failed to update landing page settings.");
    } finally {
      setLandingSaving(false);
    }
  };

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      if (data) {
        setFormData({
          companyName: data.companyName || "",
          legalName: data.legalName || "",
          taxNumber: data.taxNumber || "",
          companyEmail: data.companyEmail || "",
          companyPhone: data.companyPhone || "",
          companyAddress: data.companyAddress || "",
          companyLogo: data.companyLogo || "",

          currency: data.currency || "USD",
          currencySymbol: data.currencySymbol || "$",
          timezone: data.timezone || "UTC",
          dateFormat: data.dateFormat || "YYYY-MM-DD",
          fiscalYearStart: data.fiscalYearStart || "January",

          invoicePrefix: data.invoicePrefix || "INV-",
          salesOrderPrefix: data.salesOrderPrefix || "SO-",
          purchaseOrderPrefix: data.purchaseOrderPrefix || "PO-",
          defaultTaxRate: data.defaultTaxRate !== undefined ? Number(data.defaultTaxRate) : 0,
          enableMultiBranch: Boolean(data.enableMultiBranch),

          enableStockAlerts: Boolean(data.enableStockAlerts),
          lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 10,
          receiptHeader: data.receiptHeader || "",
          receiptFooter: data.receiptFooter || "",
          receiptPaperSize: data.receiptPaperSize || "80mm",
          autoPrintReceipt: Boolean(data.autoPrintReceipt),
          showTaxOnReceipt: Boolean(data.showTaxOnReceipt),

          emailNotifications: Boolean(data.emailNotifications),
          dailyReportEmail: Boolean(data.dailyReportEmail),
          sessionTimeoutMinutes: data.sessionTimeoutMinutes !== undefined ? Number(data.sessionTimeoutMinutes) : 60,
          themePreference: data.themePreference || "system",
        });

        if (data.companyLogo) {
          setLogoPreview(`${API_URL}/uploads/${data.companyLogo}`);
        } else {
          setLogoPreview(null);
        }
      }
    } catch (error) {
      showToast("error", error.message || "Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: null, message: "" });
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Please select a valid image file (PNG, JPG, WEBP).");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let payload;

      if (logoFile) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => {
          payload.append(key, formData[key]);
        });
        payload.append("companyLogo", logoFile);
      } else {
        payload = formData;
      }

      const res = await updateSettings(payload);
      showToast("success", res.message || "Settings saved successfully!");
      if (res.data?.companyLogo) {
        setLogoPreview(`${API_URL}/uploads/${res.data.companyLogo}`);
      }
      setLogoFile(null);
      await refreshSettings();
    } catch (error) {
      showToast("error", error.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    try {
      setResetting(true);
      const res = await resetSettings();
      showToast("success", res.message || "Settings reset to default successfully.");
      setShowResetModal(false);
      await fetchSettingsData();
      await refreshSettings();
    } catch (error) {
      showToast("error", error.message || "Failed to reset settings.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "12px", color: "#64748b" }}>
          <FiRefreshCw className="animate-spin" style={{ fontSize: "1.5rem" }} />
          <span>Loading system configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>
            <FiBriefcase /> System Settings
          </h1>
          <p>Configure business details, localization, tax rates, inventory thresholds, and system preferences.</p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnReset}
            onClick={() => setShowResetModal(true)}
            disabled={saving || resetting}
          >
            <FiRefreshCw /> Reset Defaults
          </button>

          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSubmit}
            disabled={saving || resetting}
          >
            <FiSave /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast.type && (
        <div className={toast.type === "success" ? styles.toastSuccess : styles.toastError}>
          {toast.type === "success" ? <FiCheckCircle style={{ fontSize: "1.2rem" }} /> : <FiAlertCircle style={{ fontSize: "1.2rem" }} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Tabs Shell */}
      <div className={styles.tabsShell}>
        {/* Navigation Sidebar */}
        <nav className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "business" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("business")}
          >
            <FiBriefcase className={styles.tabIcon} />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "localization" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("localization")}
          >
            <FiGlobe className={styles.tabIcon} />
            <span>Localization & Finance</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "invoicing" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("invoicing")}
          >
            <FiFileText className={styles.tabIcon} />
            <span>Invoicing & Sales</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "pos" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("pos")}
          >
            <FiShoppingCart className={styles.tabIcon} />
            <span>Inventory & POS</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "warehouse" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("warehouse")}
          >
            <FiBox className={styles.tabIcon} />
            <span>Warehouse & Stock</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "barcode" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("barcode")}
          >
            <FiTag className={styles.tabIcon} />
            <span>Barcode Printing</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "landing" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("landing")}
          >
            <FiLayout className={styles.tabIcon} />
            <span>Landing Page Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "security" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FiShield className={styles.tabIcon} />
            <span>Security & System</span>
          </button>
        </nav>

        {/* Tab Content Panels */}
        <div className={styles.tabContent}>
          <form onSubmit={handleSubmit}>
            {/* Tab 1: Business Profile */}
            {activeTab === "business" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Business Details & Identity</h2>
                  <p>Company branding, tax registration, contact information, and main address.</p>
                </div>

                <div className={styles.formGrid}>
                  {/* Logo Upload Dropzone */}
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>Company Logo</label>
                    <div className={styles.logoWrapper}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Company Logo" className={styles.logoPreview} />
                      ) : (
                        <div className={styles.logoPlaceholder}>
                          <FiImage />
                        </div>
                      )}

                      <div className={styles.logoActions}>
                        <label htmlFor="logo-upload" className={styles.uploadBtn}>
                          <FiUploadCloud /> Upload New Logo
                        </label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          style={{ display: "none" }}
                        />
                        <span className={styles.logoHelp}>Recommended format: PNG, JPG, or SVG (Max 5MB).</span>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                        placeholder="e.g. ERP Enterprise Ltd"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Legal / Trade Name</label>
                      <input
                        type="text"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="e.g. ERP Solutions Inc."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tax / VAT Registration Number</label>
                      <input
                        type="text"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="e.g. TAX-99887766"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Official Business Email</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="support@company.com"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Business Phone Number</label>
                      <input
                        type="text"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Headquarters Address</label>
                      <textarea
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        placeholder="Enter full street, city, state and country..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Localization & Finance */}
            {activeTab === "localization" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Localization & Financial Configuration</h2>
                  <p>Define base operating currency, currency symbol, timezone, and fiscal calendar.</p>
                </div>

                <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Primary Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                      <option value="AUD">AUD ($) - Australian Dollar</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Currency Symbol</label>
                    <input
                      type="text"
                      name="currencySymbol"
                      value={formData.currencySymbol}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="$, €, ₹, £"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>System Timezone</label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date Format</label>
                    <select
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-11)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (11/08/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (08/11/2026)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fiscal Year Starts In</label>
                    <select
                      name="fiscalYearStart"
                      value={formData.fiscalYearStart}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="January">January</option>
                      <option value="April">April</option>
                      <option value="July">July</option>
                      <option value="October">October</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Invoicing & Sales */}
            {activeTab === "invoicing" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Invoicing, Sales & Order Prefixes</h2>
                  <p>Customize numbering prefixes for invoices, sales orders, purchase orders, and tax rates.</p>
                </div>

                <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Invoice Number Prefix</label>
                    <input
                      type="text"
                      name="invoicePrefix"
                      value={formData.invoicePrefix}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g. INV-"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sales Order Number Prefix</label>
                    <input
                      type="text"
                      name="salesOrderPrefix"
                      value={formData.salesOrderPrefix}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g. SO-"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Purchase Order Number Prefix</label>
                    <input
                      type="text"
                      name="purchaseOrderPrefix"
                      value={formData.purchaseOrderPrefix}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g. PO-"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Default Sales Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="defaultTaxRate"
                      value={formData.defaultTaxRate}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="10.00"
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <h4>Enable Multi-Branch Mode</h4>
                        <p>Allow managing orders, inventories, and transactions across multiple store branches.</p>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          name="enableMultiBranch"
                          checked={formData.enableMultiBranch}
                          onChange={handleInputChange}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Inventory & POS */}
            {activeTab === "pos" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Inventory Control & POS Receipts</h2>
                  <p>Manage low stock notifications, thermal printer formats, and receipt messages.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <h4>Enable Low Stock Alerts</h4>
                      <p>Send warning alerts when item inventory reaches or drops below minimum threshold.</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="enableStockAlerts"
                        checked={formData.enableStockAlerts}
                        onChange={handleInputChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Global Low Stock Threshold</label>
                      <input
                        type="number"
                        min="0"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="10"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Receipt Thermal Paper Size</label>
                      <select
                        name="receiptPaperSize"
                        value={formData.receiptPaperSize}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="58mm">58mm Small Thermal</option>
                        <option value="80mm">80mm Standard Thermal</option>
                        <option value="A4">A4 Full Sheet Format</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>POS Receipt Header Message</label>
                    <input
                      type="text"
                      name="receiptHeader"
                      value={formData.receiptHeader}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g. Welcome to ERP Store"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>POS Receipt Footer Message</label>
                    <textarea
                      name="receiptFooter"
                      value={formData.receiptFooter}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      placeholder="e.g. Thank you for your visit! Returns valid within 14 days."
                    />
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <h4>Auto-Print Receipt</h4>
                        <p>Trigger receipt printing automatically upon POS checkout.</p>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          name="autoPrintReceipt"
                          checked={formData.autoPrintReceipt}
                          onChange={handleInputChange}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <h4>Show Tax Summary on Receipt</h4>
                        <p>Print itemized VAT/Tax breakdowns on customer receipt slips.</p>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          name="showTaxOnReceipt"
                          checked={formData.showTaxOnReceipt}
                          onChange={handleInputChange}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Warehouse & Stock */}
            {activeTab === "warehouse" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Warehouse & Multi-Location Stock Configuration</h2>
                  <p>Manage warehouses, stock transfers, low stock thresholds, and location tracking.</p>
                </div>

                <div className={styles.formCard}>
                  <div className={styles.toggleRow} style={{ marginBottom: "20px" }}>
                    <div className={styles.toggleText}>
                      <h4>Enable Multi-Warehouse Tracking</h4>
                      <p>Track inventory quantities separately across multiple physical warehouses and store branches.</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="enableMultiBranch"
                        checked={formData.enableMultiBranch}
                        onChange={handleInputChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Global Low Stock Threshold</label>
                      <input
                        type="number"
                        min="1"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Stock Alert Notifications</label>
                      <select
                        name="enableStockAlerts"
                        value={formData.enableStockAlerts ? "true" : "false"}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: "enableStockAlerts", value: e.target.value === "true", type: "checkbox", checked: e.target.value === "true" },
                          })
                        }
                        className={styles.select}
                      >
                        <option value="true">Enabled (Alert on Dashboard)</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "24px 0 12px 0", color: "#0f172a" }}>
                    Warehouse Quick Actions & Management
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <Link href="/warehouse" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }}>
                        <FiBox style={{ fontSize: "24px", color: "#4f46e5", marginBottom: "8px" }} />
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>All Warehouses</h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>View and manage warehouse locations</p>
                      </div>
                    </Link>

                    <Link href="/warehouse/add" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }}>
                        <FiPlus style={{ fontSize: "24px", color: "#10b981", marginBottom: "8px" }} />
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>Add Warehouse</h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Create a new warehouse location</p>
                      </div>
                    </Link>

                    <Link href="/warehouse/stock" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }}>
                        <FiLayers style={{ fontSize: "24px", color: "#f59e0b", marginBottom: "8px" }} />
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>Warehouse Stock</h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Inspect stock levels per warehouse</p>
                      </div>
                    </Link>

                    <Link href="/warehouse/transfer" style={{ textDecoration: "none" }}>
                      <div style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }}>
                        <FiExternalLink style={{ fontSize: "24px", color: "#ec4899", marginBottom: "8px" }} />
                        <h4 style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>Stock Transfer</h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Move stock between locations</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Barcode Printing */}
            {activeTab === "barcode" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Barcode Generation & Printing Configuration</h2>
                  <p>Configure default barcode dimensions, paper sizing, and open the barcode generator tool.</p>
                </div>

                <div className={styles.formCard}>
                  <div style={{ padding: "20px", borderRadius: "12px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "17px", fontWeight: "700" }}>Barcode Printer & Generator Tool</h3>
                      <p style={{ margin: "4px 0 0 0", color: "#1e40af", fontSize: "13px" }}>Select products, pick paper grid formats, and print customized product price tags and barcodes.</p>
                    </div>
                    <Link href="/admin/pos/barcode-print" style={{ textDecoration: "none" }}>
                      <button type="button" style={{ padding: "10px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <FiPrinter /> Open Barcode Printer
                      </button>
                    </Link>
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Default Receipt & Label Paper Size</label>
                      <select
                        name="receiptPaperSize"
                        value={formData.receiptPaperSize}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="80mm">80mm Thermal Receipt Paper</option>
                        <option value="58mm">58mm Small Thermal Paper</option>
                        <option value="grid40">A4 Sheet (40 Labels per Page)</option>
                        <option value="grid24">A4 Sheet (24 Labels per Page)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Barcode Type / Encoding Standard</label>
                      <select className={styles.select} defaultValue="CODE128">
                        <option value="CODE128">CODE128 (Standard Product Barcode)</option>
                        <option value="EAN13">EAN-13 (International Commercial)</option>
                        <option value="UPC">UPC-A (Retail Universal)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 7: Landing Page Settings */}
            {activeTab === "landing" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Landing Page Content & Branding</h2>
                  <p>Customize hero text, tags, navbar titles, section headings, about section, and landing images.</p>
                </div>

                <div className={styles.formCard}>
                  {landingLoading ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Landing Page settings...</div>
                  ) : (
                    <div>
                      {/* Navbar Settings */}
                      <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0f172a" }}>Navbar Configuration</h3>
                      <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Logo Text</label>
                          <input
                            type="text"
                            name="logoText"
                            value={landingForm.logoText}
                            onChange={handleLandingChange}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Logo Highlight Word</label>
                          <input
                            type="text"
                            name="logoHighlight"
                            value={landingForm.logoHighlight}
                            onChange={handleLandingChange}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Login Button Label</label>
                          <input
                            type="text"
                            name="loginText"
                            value={landingForm.loginText}
                            onChange={handleLandingChange}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      {/* Hero Section Settings */}
                      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "24px 0 16px 0", color: "#0f172a" }}>Hero Banner Section</h3>
                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Hero Badge / Tagline</label>
                        <input
                          type="text"
                          name="heroTag"
                          value={landingForm.heroTag}
                          onChange={handleLandingChange}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Hero Main Title</label>
                        <input
                          type="text"
                          name="heroTitle"
                          value={landingForm.heroTitle}
                          onChange={handleLandingChange}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Hero Description Paragraph</label>
                        <textarea
                          name="heroDescription"
                          rows="4"
                          value={landingForm.heroDescription}
                          onChange={handleLandingChange}
                          className={styles.textarea}
                        />
                      </div>

                      <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Hero Button Text</label>
                          <input
                            type="text"
                            name="heroButtonText"
                            value={landingForm.heroButtonText}
                            onChange={handleLandingChange}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Dashboard Showcase Title</label>
                          <input
                            type="text"
                            name="dashboardTitle"
                            value={landingForm.dashboardTitle}
                            onChange={handleLandingChange}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Hero Image Upload</label>
                        <input
                          type="file"
                          name="heroImage"
                          accept="image/*"
                          onChange={handleLandingImageChange}
                          className={styles.input}
                        />
                        {landingPreview.heroImage && (
                          <div style={{ marginTop: "8px" }}>
                            <img src={landingPreview.heroImage} alt="Hero Preview" style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                          </div>
                        )}
                      </div>

                      {/* About Section Settings */}
                      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "24px 0 16px 0", color: "#0f172a" }}>About & Features Section</h3>
                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>About Section Title</label>
                        <input
                          type="text"
                          name="aboutTitle"
                          value={landingForm.aboutTitle}
                          onChange={handleLandingChange}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>About Description</label>
                        <textarea
                          name="aboutDescription"
                          rows="4"
                          value={landingForm.aboutDescription}
                          onChange={handleLandingChange}
                          className={styles.textarea}
                        />
                      </div>

                      {/* Footer */}
                      <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "24px 0 16px 0", color: "#0f172a" }}>Footer Note</h3>
                      <div className={styles.formGroupFull}>
                        <label className={styles.label}>Footer Text</label>
                        <input
                          type="text"
                          name="footerText"
                          value={landingForm.footerText}
                          onChange={handleLandingChange}
                          className={styles.input}
                        />
                      </div>

                      <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={handleLandingSubmit}
                          disabled={landingSaving}
                          className={styles.btnSave}
                        >
                          <FiSave /> {landingSaving ? "Saving Landing Page..." : "Save Landing Page Settings"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 8: Security & Preferences */}
            {activeTab === "security" && (
              <div>
                <div className={styles.sectionHeader}>
                  <h2>Security, Notifications & System Options</h2>
                  <p>Configure automated system notifications, session timeouts, and theme preferences.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <h4>System Email Notifications</h4>
                      <p>Receive system alerts for low stock, new orders, and security updates via email.</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <h4>Daily Executive Summary Email</h4>
                      <p>Send daily aggregated revenue, sales, and stock performance reports to admin email.</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        name="dailyReportEmail"
                        checked={formData.dailyReportEmail}
                        onChange={handleInputChange}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>User Session Timeout (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="1440"
                        name="sessionTimeoutMinutes"
                        value={formData.sessionTimeoutMinutes}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="60"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Default Interface Theme</label>
                      <select
                        name="themePreference"
                        value={formData.themePreference}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="system">Follow System Preference</option>
                        <option value="light">Light Mode Clean</option>
                        <option value="dark">Dark Mode Professional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <FiAlertCircle />
            </div>
            <h3>Reset All Settings?</h3>
            <p>Are you sure you want to restore all system configuration settings to factory default values? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnConfirmDanger}
                onClick={handleResetConfirm}
                disabled={resetting}
              >
                {resetting ? "Resetting..." : "Yes, Reset Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
