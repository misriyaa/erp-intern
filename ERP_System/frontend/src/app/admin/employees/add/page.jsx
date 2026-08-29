"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, User, Loader2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast, Toaster } from "react-hot-toast";
import styles from "./addEmployees.module.css";
import { getRoles } from "@/services/roleService";
import { getBranches } from "@/services/branchService";
import { restaurantService } from "@/services/restaurantService";
import { useCompany } from "@/context/CompanyContext";

export default function AddEmployeePage() {
  const router = useRouter();
  const { user, company, industryCode, isRestaurant } = useCompany();

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    role: "",
    branchId: "",
    password: "",
  });

  const [selectedModules, setSelectedModules] = useState([]);

  const availableModules = useMemo(() => {
    const isTex = Boolean(industryCode?.includes("TEXTILE"));
    const isGymMode = Boolean(industryCode?.includes("GYM"));
    const isRest = Boolean(industryCode?.includes("RESTAURANT"));
    const isLnd = Boolean(industryCode?.includes("LAUNDRY"));

    if (isLnd) {
      return [
        { code: "DASHBOARD", name: "Laundry Dashboard", description: "Washing operations summary & charts" },
        { code: "LAUNDRY", name: "Laundry POS & Operations", description: "Garment tracking, active orders & queue" },
        { code: "BRANCHES", name: "Outlets & Branches", description: "Laundry outlets & branch locations" },
        { code: "SERVICES", name: "Services & Categories", description: "Washing & dry cleaning catalog" },
        { code: "CUSTOMERS", name: "Customers", description: "Client profiles & phone directory" },
        { code: "EMPLOYEES", name: "Employees & Staff", description: "Washer, presser & driver team" },
        { code: "REPORTS", name: "Laundry Reports", description: "Revenue & garment delivery analytics" },
      ];
    } else if (isGymMode) {
      return [
        { code: "DASHBOARD", name: "Dashboard", description: "Business statistics & charts" },
        { code: "MEMBERS", name: "Members", description: "Manage gym member accounts" },
        { code: "MEMBERSHIP_PLANS", name: "Membership Plans", description: "Configure membership packages" },
        { code: "TRAINERS", name: "Trainers", description: "Gym instructors & schedules" },
        { code: "ATTENDANCE", name: "Attendance", description: "Daily gym check-ins logs" },
        { code: "PAYMENTS", name: "Payments", description: "Financial receipts & invoices" },
        { code: "EMPLOYEES", name: "Employees", description: "Manage staff & team permissions" },
        { code: "SUPPLIERS", name: "Suppliers", description: "Vendor catalog & logistics" },
        { code: "REPORTS", name: "Reports & Analytics", description: "Visual operations summaries" },
      ];
    } else if (isTex) {
      return [
        { code: "DASHBOARD", name: "Dashboard", description: "Industrial performance summary" },
        { code: "PRODUCTS", name: "Products Setup", description: "Manage product listings" },
        { code: "CATEGORIES", name: "Product Categories", description: "Configure category filters" },
        { code: "BRANDS", name: "Product Brands", description: "Configure product brand tags" },
        { code: "UNITS", name: "Units of Measure", description: "Configure units of measure (UoM)" },
        { code: "RAW_MATERIALS", name: "Raw Materials", description: "Weaving yarn & mill supplies" },
        { code: "PRODUCTION", name: "Production Run", description: "Textile manufacturing tracking" },
        { code: "INVENTORY", name: "Inventory", description: "Raw & finished product stocks" },
        { code: "WAREHOUSE", name: "Warehouse", description: "Storage mills & stock depots" },
        { code: "QUALITY_CONTROL", name: "Quality Control", description: "Fabric inspection sheets" },
        { code: "SUPPLIERS", name: "Suppliers", description: "Supplier records & bulk orders" },
        { code: "SALES", name: "Sales Orders", description: "Client sales & invoices" },
        { code: "PAYMENTS", name: "Payments", description: "Transactional records ledger" },
        { code: "EMPLOYEES", name: "Employees", description: "Manage workers & mill supervisors" },
        { code: "REPORTS", name: "Industrial Reports", description: "Factory output summaries" },
      ];
    } else if (isRest) {
      return [
        { code: "DASHBOARD", name: "Restaurant Dashboard", description: "Food sales charts & analytics" },
        { code: "RESTAURANT", name: "Restaurant POS & Floor", description: "POS terminal, KOT, tables & costing" },
        { code: "PRODUCTS", name: "Menu & Ingredients", description: "Manage raw ingredients & recipes" },
        { code: "CATEGORIES", name: "Menu Categories", description: "Configure menu categories" },
        { code: "BRANDS", name: "Ingredient Brands", description: "Configure ingredient brands" },
        { code: "UNITS", name: "Units of Measure", description: "Configure recipe units of measure" },
        { code: "INVENTORY", name: "Kitchen Inventory", description: "Stock control of kitchen supplies" },
        { code: "WAREHOUSE", name: "Outlets / Storage", description: "Store storage rooms & pantries" },
        { code: "SUPPLIERS", name: "Suppliers", description: "Vendor details for food orders" },
        { code: "EMPLOYEES", name: "Staff Management", description: "Waiters, kitchen & cashier accounts" },
        { code: "REPORTS", name: "Reports & Analytics", description: "Restaurant operations overview" },
      ];
    } else {
      const list = [
        { code: "DASHBOARD", name: "Dashboard", description: "Live metrics & charts" },
        { code: "PRODUCTS", name: "Products Setup", description: "Manage product listings" },
        { code: "CATEGORIES", name: "Product Categories", description: "Configure category filters" },
        { code: "BRANDS", name: "Product Brands", description: "Configure product brand tags" },
        { code: "UNITS", name: "Units of Measure", description: "Configure units of measure (UoM)" },
        { code: "INVENTORY", name: "Inventory", description: "Current stock catalogs" },
        { code: "WAREHOUSE", name: "Warehouse", description: "Store depots & physical logs" },
        { code: "STOCK_TRANSFER", name: "Stock Transfer", description: "Inter-branch product transfers" },
        { code: "CUSTOMERS", name: "Customers", description: "Client database & profiles" },
        { code: "SUPPLIERS", name: "Suppliers", description: "Vendor details & catalog" },
        { code: "PURCHASES", name: "Purchases", description: "Supplier purchase logs" },
        { code: "SALES", name: "Sales Orders", description: "Store sales & invoices" },
        { code: "REPORTS", name: "Reports & Analytics", description: "Operations summaries" },
        { code: "INVOICES", name: "Invoices", description: "Generate receipt documents" },
        { code: "EMPLOYEES", name: "Employees / Team", description: "Manage branch staff accounts" },
      ];
      return list;
    }
  }, [industryCode]);

  useEffect(() => {
    if (formData.role === "Manager") {
      const defaultManagerModules = [
        "DASHBOARD",
        "INVENTORY",
        "WAREHOUSE",
        "STOCK_TRANSFER",
        "CUSTOMERS",
        "SUPPLIERS",
        "PURCHASES",
        "SALES",
        "REPORTS",
        "INVOICES",
        "EMPLOYEES",
        "LAUNDRY",
        "BRANCHES",
        "SERVICES",
      ];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultManagerModules.includes(c));
      setSelectedModules(valid.length > 0 ? valid : availableModules.map((m) => m.code));
    } else if (formData.role === "Admin") {
      setSelectedModules(availableModules.map((m) => m.code));
    } else if (formData.role === "Cashier") {
      const defaultCashierModules = ["SALES", "POS", "DASHBOARD", "RESTAURANT", "LAUNDRY"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultCashierModules.includes(c));
      setSelectedModules(valid);
    } else if (formData.role === "Processing Staff" || formData.role === "Delivery Driver") {
      const defaultProcModules = ["LAUNDRY", "DASHBOARD"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultProcModules.includes(c));
      setSelectedModules(valid);
    } else if (formData.role === "Inventory Manager") {
      const defaultInvModules = ["INVENTORY", "WAREHOUSE", "STOCK_TRANSFER", "DASHBOARD", "STOCK-TRANSFER"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultInvModules.includes(c));
      setSelectedModules(valid);
    } else if (formData.role === "Trainer") {
      const defaultTrainerModules = ["DASHBOARD", "ATTENDANCE", "TRAINERS"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultTrainerModules.includes(c));
      setSelectedModules(valid);
    } else if (formData.role === "Waiter") {
      const defaultWaiterModules = ["RESTAURANT", "DASHBOARD"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultWaiterModules.includes(c));
      setSelectedModules(valid);
    } else if (formData.role === "Kitchen Staff") {
      const defaultKitchenModules = ["RESTAURANT", "INVENTORY", "DASHBOARD"];
      const valid = availableModules
        .map((m) => m.code)
        .filter((c) => defaultKitchenModules.includes(c));
      setSelectedModules(valid);
    } else {
      if (formData.role) {
        setSelectedModules(availableModules.map((m) => m.code));
      } else {
        setSelectedModules([]);
      }
    }
  }, [formData.role, availableModules]);

  const handleModuleToggle = (code) => {
    setSelectedModules((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const validateEmployeeForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Enter a valid phone number (7-20 digits)";
      }
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.branchId) {
      newErrors.branchId = isRestaurant ? "Outlet is required" : "Branch is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateEmployeeId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setFormData((prev) => ({
      ...prev,
      employeeId: `EMP-${randomNum}`,
    }));
  };

  useEffect(() => {
    fetchRoles();
    fetchBranches();
  }, [industryCode]);

  useEffect(() => {
    generateEmployeeId();
  }, []);

  const fetchRoles = () => {
    const isTex = Boolean(industryCode?.includes("TEXTILE"));
    const isGymMode = Boolean(industryCode?.includes("GYM"));
    const isRestMode = Boolean(industryCode?.includes("RESTAURANT"));
    const isLndMode = Boolean(industryCode?.includes("LAUNDRY"));

    let combined = [];

    if (isGymMode) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Trainer", name: "Trainer" },
      ];
    } else if (isTex) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Weaver", name: "Weaver" },
        { id: "Dyer", name: "Dyer" },
        { id: "Quality Inspector", name: "Quality Inspector" },
      ];
    } else if (isRestMode) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Cashier", name: "Cashier" },
        { id: "Waiter", name: "Waiter" },
        { id: "Kitchen Staff", name: "Kitchen Staff" },
      ];
    } else if (isLndMode) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Cashier", name: "Cashier" },
        { id: "Processing Staff", name: "Processing Staff" },
        { id: "Delivery Driver", name: "Delivery Driver" },
      ];
    } else {
      // Retail / default
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Cashier", name: "Cashier" },
        { id: "Inventory Manager", name: "Inventory Manager" },
      ];
    }

    setRoles(combined);
  };

  const fetchBranches = async () => {
    try {
      const [branchRes, restRes, lndRes] = await Promise.all([
        getBranches().catch(() => []),
        restaurantService.getRestaurants().catch(() => []),
        apiClient.get("/laundries").catch(() => ({ data: [] })),
      ]);

      const bList = Array.isArray(branchRes?.data) ? branchRes.data : Array.isArray(branchRes) ? branchRes : (branchRes?.data?.data || []);
      const rList = Array.isArray(restRes?.data) ? restRes.data : Array.isArray(restRes) ? restRes : (restRes?.data?.data || []);
      const lList = Array.isArray(lndRes?.data?.data) ? lndRes.data.data : Array.isArray(lndRes?.data) ? lndRes.data : [];

      let combined = [];

      if (isRestaurant) {
        if (rList.length > 0) {
          combined = rList.map((r) => ({
            id: r.id,
            branchId: r.branchId || r.id,
            name: r.code ? `${r.name} (${r.code})` : r.name,
            code: r.code || "OUTLET",
          }));
        } else {
          combined = bList.map((b) => ({
            id: b.id,
            branchId: b.id,
            name: b.name,
            code: b.code || "BRANCH",
          }));
        }
      } else {
        combined = [...bList];

        rList.forEach((r) => {
          if (r?.id && !combined.some((b) => b.id === r.id || b.id === r.branchId)) {
            combined.push({
              id: r.id,
              branchId: r.branchId || r.id,
              name: `${r.name} (${r.code || "Outlet"})`,
              code: r.code || "OUTLET",
            });
          }
        });

        lList.forEach((l) => {
          if (l?.id && !combined.some((b) => b.id === l.id)) {
            combined.push({
              id: l.id,
              branchId: l.id,
              name: `${l.name} (${l.branch?.name || "Laundry"})`,
              code: "LAUNDRY",
            });
          }
        });
      }

      setBranches(combined);
    } catch (err) {
      console.error("Failed to fetch branches/outlets:", err);
      setBranches([]);
    }
  };


  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCancel = () => {
    router.push("/admin/employees/view");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmployeeForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiClient.post(
        "/employees",
        {
          ...formData,
          companyId: company?.id,
          type: industryCode,
          permissions: selectedModules.length > 0 ? selectedModules : undefined,
        }
      );

      console.log("Employee created:", response.data);

      toast.success("Employee added successfully");

      setTimeout(() => {
        router.push("/admin/employees/view");
      }, 800);
    } catch (error) {
      console.error("Add employee error:", error);
      const serverMsg = error.response?.data?.message || "";
      const lower = serverMsg.toLowerCase();

      if (lower.includes("email")) {
        setErrors((prev) => ({ ...prev, email: serverMsg }));
      } else if (lower.includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: serverMsg }));
      } else if (lower.includes("employee")) {
        setErrors((prev) => ({ ...prev, employeeId: serverMsg }));
      } else {
        toast.error(serverMsg || "Failed to add employee");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initials = formData.fullName.trim()
    ? formData.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "";

  return (
    <div className={styles.layout}>
      <Toaster position="top-right" />

      <div className={styles.container}>
        <div className={styles.content}>

          <form onSubmit={handleSubmit} noValidate>

            {/* Top Bar */}
            <div className={styles.topBar}>
              <div>
                <div className={styles.breadcrumb}>

                  <span
                    className={styles.breadcrumbLink}
                    onClick={handleCancel}
                  >
                    Employees
                  </span>

                  <ChevronRight size={14} />

                  <span>Add New</span>

                </div>

                <h1 className={styles.title}>
                  Add Employee
                </h1>
              </div>

              <div className={styles.topActions}>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >

                  {submitting && (
                    <Loader2
                      className={styles.spinnerIcon}
                      size={16}
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : "Save Employee"}

                </button>

              </div>
            </div>


            {/* Main Grid */}
            <div className={styles.grid}>

              {/* Employee Form */}
              <div className={styles.mainColumn}>

                <div className={styles.card}>

                  <h2 className={styles.cardTitle}>
                    Employee Information
                  </h2>


                  {/* Full Name + Employee ID */}
                  <div className={styles.formRow}>

                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Full Name{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="John Doe"
                        style={errors.fullName ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.fullName && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.fullName}
                        </span>
                      )}

                    </div>




                  </div>


                  {/* Email + Phone */}
                  <div className={styles.formRow}>

                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Email{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="john@example.com"
                        style={errors.email ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.email && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.email}
                        </span>
                      )}

                    </div>


                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Phone Number{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="9876543210"
                        style={errors.phone ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.phone && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.phone}
                        </span>
                      )}

                    </div>

                  </div>


                  {/* Role + Branch */}
                  <div className={styles.formRow}>

                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Role{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={styles.input}
                        style={errors.role ? { borderColor: "#ef4444" } : {}}
                      >
                        <option value="">Select Role</option>
                        {roles.length > 0 ? (
                          roles.map((r) => (
                            <option key={r.id} value={r.name}>
                              {r.name}
                            </option>
                          ))
                        ) : (
                          <>
                            {user?.role?.toUpperCase() !== "ADMIN" && <option value="Admin">Admin</option>}
                            <option value="Manager">Manager</option>
                            <option value="HR">HR</option>
                          </>
                        )}
                      </select>
                      {errors.role && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.role}
                        </span>
                      )}

                    </div>


                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        {isRestaurant ? "Outlet" : "Branch"}{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <select
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleInputChange}
                        className={styles.input}
                        style={errors.branchId ? { borderColor: "#ef4444" } : {}}
                      >
                        <option value="">{isRestaurant ? "Select Outlet" : "Select Branch"}</option>
                        {branches.length > 0 ? (
                          branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {isRestaurant ? "No outlets available" : "No branches available"}
                          </option>
                        )}
                      </select>
                      {errors.branchId && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.branchId}
                        </span>
                      )}

                    </div>

                  </div>


                  {/* Password */}
                  <div className={styles.formRow}>

                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Password{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="Enter temporary password"
                        style={errors.password ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.password && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.password}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* Preview */}
              <div className={styles.sideColumn}>

                <div className={styles.card}>

                  <h2 className={styles.cardTitle}>
                    Preview
                  </h2>

                  <div className={styles.previewBody}>

                    <div className={styles.avatar}>

                      {initials ? (
                        initials
                      ) : (
                        <User size={28} />
                      )}

                    </div>


                    <div className={styles.previewName}>
                      {formData.fullName || "New Employee"}
                    </div>


                    <div className={styles.previewRole}>
                      {formData.role || "Role not set"}
                    </div>

                    {formData.branchId && branches.length > 0 && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        📍 {branches.find((b) => b.id === formData.branchId || b.branchId === formData.branchId)?.name || ""}
                      </div>
                    )}

                    {formData.employeeId && (
                      <span
                        className={styles.previewIdBadge}
                      >
                        {formData.employeeId}
                      </span>
                    )}

                  </div>


                  <p className={styles.previewHint}>
                    This is how the employee will appear
                    in your team list once saved.
                  </p>

                </div>

                {formData.role && (
                  <div className={styles.card} style={{ marginTop: "24px" }}>
                    <h2 className={styles.cardTitle}>
                      {isRestaurant ? "Automatic Role Permissions" : "Module Access Permissions"}
                    </h2>

                    {isRestaurant ? (
                      <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#0f172a", border: "1px solid #334155" }}>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px 0" }}>
                          Access is automatically assigned based on the selected role: <strong style={{ color: "#6366f1" }}>{formData.role}</strong>
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {formData.role === "Admin" && (
                            <>
                              <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>✓ Full Restaurant ERP Access</div>
                              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Dashboard, Outlets Setup, POS, Tables, Reservations, Menu & Recipes, KDS, Orders, Wastage, Staff, Reports</div>
                            </>
                          )}
                          {formData.role === "Manager" && (
                            <>
                              <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>✓ Operational Restaurant Access</div>
                              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Dashboard, POS, Tables, Reservations, Menu & Recipes, KDS, Orders, Wastage, Staff, Reports</div>
                              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>✗ Restricted: Outlet Setup</div>
                            </>
                          )}
                          {formData.role === "Cashier" && (
                            <>
                              <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>✓ Cashier Billing Access</div>
                              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Restaurant POS, Restaurant Orders, Order History, Payment & Billing, Print Bill</div>
                              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>✗ Restricted: Dashboard, Outlet Setup, Menu, KDS, Staff, Reports</div>
                            </>
                          )}
                          {formData.role === "Waiter" && (
                            <>
                              <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>✓ Service Access</div>
                              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Restaurant POS, Floor & Tables, Reservations, My Orders</div>
                              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>✗ Restricted: Billing, Payments, Print Bill, KDS, Menu Setup</div>
                            </>
                          )}
                          {formData.role === "Kitchen Staff" && (
                            <>
                              <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>✓ Kitchen Display Access</div>
                              <div style={{ color: "#cbd5e1", fontSize: "12px" }}>Kitchen Display System (KDS)</div>
                              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>✗ Restricted: POS, Billing, Orders Management, Reports</div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                          Select which modules this {formData.role} can access.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {availableModules.map((mod) => {
                            const isSelected = selectedModules.includes(mod.code);
                            return (
                              <label
                                key={mod.code}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 12px",
                                  borderRadius: "6px",
                                  backgroundColor: isSelected ? "rgba(79, 70, 229, 0.1)" : "#1e293b",
                                  border: `1px solid ${isSelected ? "#4f46e5" : "#334155"}`,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleModuleToggle(mod.code)}
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    accentColor: "#4f46e5",
                                    cursor: "pointer",
                                  }}
                                />
                                <div>
                                  <strong style={{ display: "block", fontSize: "13px", color: "#f8fafc" }}>
                                    {mod.name}
                                  </strong>
                                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                    {mod.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}