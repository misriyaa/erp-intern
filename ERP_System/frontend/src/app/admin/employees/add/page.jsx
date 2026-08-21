"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, User, Loader2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast, Toaster } from "react-hot-toast";
import styles from "./addEmployees.module.css";
import { getRoles } from "@/services/roleService";
import { getDesignations } from "@/services/designationService";
import { getBranches } from "@/services/branchService";
import { useCompany } from "@/context/CompanyContext";

export default function AddEmployeePage() {
  const router = useRouter();
  const { user, company, industryCode } = useCompany();

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
      newErrors.branchId = "Branch is required";
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

  const fetchRoles = async () => {
    let dbRoles = [];
    let dbDesignations = [];

    const isTex = Boolean(industryCode?.includes("TEXTILE"));
    const isGymMode = Boolean(industryCode?.includes("GYM"));

    try {
      const [roleRes, desigRes] = await Promise.allSettled([
        getRoles(),
        getDesignations(),
      ]);

      if (roleRes.status === "fulfilled" && roleRes.value) {
        const val = roleRes.value;
        const rawRoles = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        dbRoles = rawRoles.filter((r) => {
          const nameUpper = (r.name || "").toUpperCase();
          if (nameUpper === "ADMIN" || nameUpper === "SUPER_ADMIN") return true;
          const rIsTex = r.isTextile === true || r.category === "TEXTILE";
          return isTex ? rIsTex : !rIsTex;
        });
      }

      if (desigRes.status === "fulfilled" && desigRes.value) {
        const val = desigRes.value;
        const rawDesigs = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
        dbDesignations = rawDesigs.filter((d) => {
          const dIsTex = d.isTextile === true || d.category === "TEXTILE";
          return isTex ? dIsTex : !dIsTex;
        });
      }
    } catch (err) {
      console.error("Failed to fetch roles/designations:", err);
    }

    const defaultRoles = isTex
      ? ["Loom Weaving Specialist", "Quality Inspector", "Spinning Machine Master", "Dyeing Technician", "Textile Mill Supervisor", "Factory Manager"]
      : isGymMode
      ? ["Senior Personal Trainer", "Sports Nutritionist", "Desk & Check-in Specialist", "Fitness Manager"]
      : ["Store Operations Manager", "Senior POS Cashier", "Inventory & Stock Clerk", "Sales Executive", "Retail Supervisor"];

    const combined = [];

    // 1. Added DB Roles
    dbRoles.forEach((r) => {
      const name = typeof r === "object" ? r.name : r;
      if (name && !combined.some((item) => item.name?.toLowerCase() === name.toLowerCase())) {
        combined.push({ id: r.id || name, name });
      }
    });

    // 2. Added DB Designations
    dbDesignations.forEach((d) => {
      const name = typeof d === "object" ? (d.designation || d.name) : d;
      if (name && !combined.some((item) => item.name?.toLowerCase() === name.toLowerCase())) {
        combined.push({ id: d.id || name, name });
      }
    });

    // 3. Only fallback if no DB roles or designations exist at all
    if (combined.length === 0) {
      defaultRoles.forEach((name) => {
        if (!combined.some((item) => item.name?.toLowerCase() === name.toLowerCase())) {
          combined.push({ id: name, name });
        }
      });
    }

    // Filter out Admin/Super Admin roles if logged-in user is a business Admin
    let finalRoles = combined;
    if (user?.role?.toUpperCase() === "ADMIN") {
      finalRoles = combined.filter((r) => {
        const nameUpper = r.name?.toUpperCase();
        return nameUpper !== "ADMIN" && nameUpper !== "SUPER_ADMIN" && nameUpper !== "SUPERADMIN";
      });
    }

    setRoles(finalRoles);
  };

  const fetchBranches = async () => {
    let dbBranches = [];
    try {
      const res = await getBranches();
      dbBranches = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : (res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }

    const isTex = Boolean(industryCode?.includes("TEXTILE"));
    const isGymMode = Boolean(industryCode?.includes("GYM"));

    const defaultBranches = isTex
      ? [
          { id: "b-tex-1", name: "Weaving Mill #1", code: "MILL-01" },
          { id: "b-tex-2", name: "Dyeing & Finishing Unit", code: "MILL-02" },
          { id: "b-tex-3", name: "Spinning Plant A", code: "MILL-03" },
        ]
      : isGymMode
      ? [
          { id: "b-gym-1", name: "Downtown Fitness Club", code: "GYM-01" },
          { id: "b-gym-2", name: "Uptown Health Hub", code: "GYM-02" },
        ]
      : [
          { id: "b-ret-1", name: "Central Supermarket Outlet", code: "RET-01" },
          { id: "b-ret-2", name: "Westside Retail Depot", code: "RET-02" },
        ];

    const combined = [...dbBranches];

    if (combined.length === 0) {
      defaultBranches.forEach((b) => combined.push(b));
    }

    setBranches(combined);
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


                    <div className={styles.formGroup}>

                      <label className={styles.label}>
                        Employee ID{" "}
                        <span className={styles.required}>
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="EMP-001"
                        style={errors.employeeId ? { borderColor: "#ef4444" } : {}}
                      />
                      {errors.employeeId && (
                        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          {errors.employeeId}
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
                        Branch{" "}
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
                        <option value="">Select Branch</option>
                        {branches.length > 0 ? (
                          branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} {b.code ? `(${b.code})` : ""}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No branches available
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
                        📍 {branches.find((b) => b.id === formData.branchId)?.name || ""}
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

              </div>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}