"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, X, Users, Loader2, Plus, CreditCard, Mail, Phone, Building2 } from "lucide-react";
import styles from "./viewEmployees.module.css";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { getRoles } from "@/services/roleService";
import { getBranches } from "@/services/branchService";
import apiClient from "@/services/apiClient";
import { useSettings } from "@/context/SettingsContext";
import { useAlert } from "@/context/AlertContext";
import { useCompany } from "@/context/CompanyContext";

export default function EmployeePage() {
  const router = useRouter();
  const { user, company, industryCode, isGym, isTextile, isRestaurant } = useCompany();
  const { settings, logoUrl } = useSettings();
  const { showSuccess, showError, showConfirm } = useAlert();

  const pageTitle = isGym
    ? "Gym Fitness Trainers & Staff Roster"
    : isTextile
    ? "Mill Machine Operators, Technicians & QC Staff"
    : "Employees & Staff Directory";

  const pageSub = isGym
    ? "Manage personal trainers, front-desk staff, and fitness managers."
    : isTextile
    ? "Manage weaving loom operators, dyeing technicians, quality inspectors, and mill supervisors."
    : "Manage store employees, sales cashiers, and department staff.";

  const addBtnText = isGym ? "Add Trainer / Staff" : isTextile ? "Add Operator / Staff" : "Add Employee";

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    role: "",
    branchId: "",
  });

  const validateEditEmployeeForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchRoles = () => {
    let combined = [];
    if (isGym) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Trainer", name: "Trainer" },
        { id: "Data Entry", name: "Data Entry" },
      ];
    } else if (isTextile) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Weaver", name: "Weaver" },
        { id: "Dyer", name: "Dyer" },
        { id: "Quality Inspector", name: "Quality Inspector" },
        { id: "Data Entry", name: "Data Entry" },
      ];
    } else if (isRestaurant) {
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Cashier", name: "Cashier" },
        { id: "Waiter", name: "Waiter" },
        { id: "Kitchen Staff", name: "Kitchen Staff" },
        { id: "Data Entry", name: "Data Entry" },
      ];
    } else {
      // Retail / default
      combined = [
        { id: "Manager", name: "Manager" },
        { id: "Cashier", name: "Cashier" },
        { id: "Inventory Manager", name: "Inventory Manager" },
        { id: "Data Entry", name: "Data Entry" },
      ];
    }
    setRoles(combined);
  };

  const fetchBranches = async () => {
    try {
      const [res, restRes] = await Promise.all([
        getBranches().catch(() => []),
        restaurantService.getRestaurants().catch(() => []),
      ]);

      const bList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : (res?.data?.data || []);
      const rList = Array.isArray(restRes?.data) ? restRes.data : Array.isArray(restRes) ? restRes : (restRes?.data?.data || []);

      const combined = [...bList];
      rList.forEach((r) => {
        if (r?.id && !combined.some((b) => b.id === r.id)) {
          combined.push({
            id: r.id,
            name: `${r.name} (${r.code || "Outlet"})`,
            code: r.code || "OUTLET",
          });
        }
      });

      setBranches(combined);
    } catch (err) {
      console.error("Failed to fetch branches/outlets:", err);
    }
  };

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        `/employees?companyId=${company?.id || ""}&type=${industryCode || ""}`
      );

      const rawList = response.data?.data || [];

      // Filter out admins if logged-in user is a business-type admin
      let baseList = rawList;
      if (user?.role?.toUpperCase() === "ADMIN") {
        baseList = rawList.filter(
          (emp) =>
            emp.role?.toUpperCase() !== "ADMIN" &&
            emp.role?.toUpperCase() !== "SUPER_ADMIN" &&
            emp.role?.toUpperCase() !== "SUPERADMIN"
        );
      }

      const filteredList = baseList.filter((emp) => {
        const isTex =
          emp.type === "TEXTILE" ||
          (!emp.type && (
            emp.employeeId?.startsWith("EMP-TEX") ||
            emp.role?.toLowerCase().includes("loom") ||
            emp.role?.toLowerCase().includes("weaving") ||
            emp.role?.toLowerCase().includes("spinning") ||
            emp.role?.toLowerCase().includes("dyeing") ||
            emp.role?.toLowerCase().includes("textile") ||
            emp.role?.toLowerCase().includes("mill")
          ));

        const isGymEmp =
          emp.type === "GYM" ||
          (!emp.type && (
            emp.employeeId?.startsWith("EMP-GYM") ||
            emp.role?.toLowerCase().includes("trainer") ||
            emp.role?.toLowerCase().includes("nutrition") ||
            emp.role?.toLowerCase().includes("fitness") ||
            emp.role?.toLowerCase().includes("desk") ||
            emp.role?.toLowerCase().includes("check-in") ||
            emp.role?.toLowerCase().includes("receptionist")
          ));

        if (isTextile) return isTex;
        if (isGym) return isGymEmp;
        return !isTex && !isGymEmp;
      });

      setEmployees(filteredList);
    } catch (error) {
      console.error("Fetch employees error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const handleAddEmployee = () => {
    router.push("/admin/employees/add");
  };

  // =====================================================
  // EDIT EMPLOYEE
  // =====================================================

  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setErrors({});

    setFormData({
      fullName: employee.fullName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      employeeId: employee.employeeId || "",
      role: employee.role?.name || "Admin",
      branchId: employee.branchId || employee.branch?.id || "",
    });

    setIsModalOpen(true);
  };

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  const handleDeleteEmployee = (employeeId) => {
    showConfirm({
      title: "Delete Employee",
      message: "Are you sure you want to delete this employee record? This action cannot be undone.",
      confirmText: "Delete Employee",
      type: "danger",
      onConfirm: async () => {
        try {
          if (typeof employeeId === "string" && !employeeId.startsWith("emp-")) {
            await apiClient.delete(`/employees/${employeeId}`);
          }
          showSuccess("Employee Deleted", "Employee profile deleted successfully.");
          setEmployees((previous) => previous.filter((employee) => employee.id !== employeeId));
        } catch (error) {
          console.error("Delete employee error:", error);
          showError("Employee Deletion Failed", error.response?.data?.message || "Failed to delete employee.");
        }
      },
    });
  };

  // =====================================================
  // UPDATE EMPLOYEE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentEmployee) {
      return;
    }

    if (!validateEditEmployeeForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const updateData = { ...formData };

      const response = await apiClient.put(
        `/employees/${currentEmployee.id}`,
        updateData
      );

      toast.success(
        response.data?.message ||
          "Employee updated successfully"
      );

      closeModal();

      fetchEmployees();
    } catch (error) {
      console.error("Update employee error:", error);
      const serverMsg = error.response?.data?.message || "";
      const lower = serverMsg.toLowerCase();

      if (lower.includes("email")) {
        setErrors((prev) => ({ ...prev, email: serverMsg }));
      } else if (lower.includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: serverMsg }));
      } else if (lower.includes("employee")) {
        setErrors((prev) => ({ ...prev, employeeId: serverMsg }));
      } else {
        toast.error(serverMsg || "Failed to update employee");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);

    setCurrentEmployee(null);
    setErrors({});

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      employeeId: "",
      role: "",
      branchId: "",
    });
  };

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "EM";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // GET ROLE
  // =====================================================

  const getRoleName = (employee) => {
    if (!employee) {
      return "Employee";
    }

    if (
      employee.role &&
      typeof employee.role === "object"
    ) {
      return employee.role?.name || "Employee";
    }

    if (
      employee.role &&
      typeof employee.role === "string"
    ) {
      return employee.role;
    }

    return "Employee";
  };

  // =====================================================
  // GET EMPLOYEE IMAGE
  // =====================================================

  const getEmployeeImage = (employee) => {
    if (!employee) {
      return null;
    }

    return (
      employee.image ||
      employee.profileImage ||
      employee.photo ||
      employee.avatar ||
      null
    );
  };

  const isTrainerRole = (emp) => {
    const roleName = getRoleName(emp).toLowerCase();
    return (
      roleName.includes("trainer") ||
      roleName.includes("nutrition") ||
      roleName.includes("coach") ||
      roleName.includes("instructor") ||
      emp.employeeId?.startsWith("EMP-TRN")
    );
  };

  const displayedEmployees = employees.filter((emp) => {
    const callerRole = (user?.role || "").toUpperCase();
    if (callerRole !== "SUPER_ADMIN" && callerRole !== "SUPERADMIN") {
      const empRole = (typeof emp.role === "string" ? emp.role : (emp.role?.name || "")).toUpperCase();
      if (empRole === "ADMIN" || empRole === "SUPER_ADMIN" || empRole === "SUPERADMIN") {
        return false;
      }
    }

    if (!isGym) return true;
    if (filterType === "staff") {
      return !isTrainerRole(emp);
    }
    if (filterType === "trainers") {
      return isTrainerRole(emp);
    }
    return true; // "all"
  });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <div className={styles.content}>

          {/* =================================================
              TOASTER
          ================================================= */}

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className={styles.header}>

            <div>
              <h1 className={styles.title}>
                {pageTitle}
              </h1>

              <p className={styles.subtitle}>
                {pageSub}
              </p>
            </div>

            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddEmployee}
            >
              <Plus size={18} />

              {addBtnText}
            </button>

          </div>

          {isGym && (
            <div className={styles.filterContainer}>
              <button
                type="button"
                className={`${styles.filterButton} ${filterType === "all" ? styles.filterButtonActive : ""}`}
                onClick={() => setFilterType("all")}
              >
                All Employees
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filterType === "staff" ? styles.filterButtonActive : ""}`}
                onClick={() => setFilterType("staff")}
              >
                Staff Only
              </button>
              <button
                type="button"
                className={`${styles.filterButton} ${filterType === "trainers" ? styles.filterButtonActive : ""}`}
                onClick={() => setFilterType("trainers")}
              >
                Trainers Only
              </button>
            </div>
          )}

          {/* =================================================
              EMPLOYEE GRID
          ================================================= */}

          <div className={styles.employeeGrid}>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className={styles.loadingState}>

                <Loader2
                  size={38}
                  className={styles.spinner}
                />

                <p>
                  Loading employees...
                </p>

              </div>
            )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!loading &&
              employees.length === 0 && (
                <div className={styles.emptyState}>

                  <Users
                    className={styles.emptyIcon}
                  />

                  <h3>
                    No employees found
                  </h3>

                  <p>
                    Start by adding your first
                    employee.
                  </p>

                  <button
                    type="button"
                    className={
                      styles.emptyAddButton
                    }
                    onClick={handleAddEmployee}
                  >
                    <Plus size={17} />

                    Add Employee
                  </button>

                </div>
              )}


            {/* =================================================
                FILTER EMPTY STATE
            ================================================= */}

            {!loading &&
              employees.length > 0 &&
              displayedEmployees.length === 0 && (
                <div className={styles.emptyState}>
                  <Users className={styles.emptyIcon} />
                  <h3>No employees match this filter</h3>
                  <p>Try switching to another filter tab.</p>
                </div>
              )}


            {/* =================================================
                EMPLOYEE CARDS
            ================================================= */}

            {!loading &&
              displayedEmployees.length > 0 &&
              displayedEmployees.map((employee) => {

                const employeeName =
                  employee.fullName ||
                  "Unknown Employee";

                const initials =
                  getInitials(employeeName);

                const role =
                  getRoleName(employee);

                const image =
                  getEmployeeImage(employee);

                const employeeId =
                  employee.employeeId ||
                  "EMP-000";

                const isVerified =
                  Boolean(employee.isVerified);

                return (
                  <div
                    className={
                      styles.employeeCard
                    }
                    key={employee.id}
                  >

                    {/* =================================================
                        PROFESSIONAL EMPLOYEE CARD
                    ================================================= */}

                    <div className={styles.idCard}>

                      {/* =================================================
                          CARD HEADER
                      ================================================= */}

                      <div
                        className={
                          styles.cardTop
                        }
                      >

                        <div
                          className={
                            styles.companyLogo
                          }
                        >
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={settings?.companyName || "Company Logo"}
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            />
                          ) : (
                            (settings?.companyName || "ERP").substring(0, 2).toUpperCase()
                          )}
                        </div>

                        <span
                          className={
                            styles.cardType
                          }
                        >
                          Employee ID
                        </span>

                      </div>


                      {/* =================================================
                          PROFILE IMAGE
                      ================================================= */}

                      <div
                        className={
                          styles.photoWrapper
                        }
                      >

                        {image ? (

                          <img
                            src={image}
                            alt={employeeName}
                            className={
                              styles.employeePhoto
                            }
                          />

                        ) : (

                          <div
                            className={
                              styles.initialAvatar
                            }
                          >
                            {initials}
                          </div>

                        )}

                      </div>


                      {/* =================================================
                          EMPLOYEE DETAILS
                      ================================================= */}

                      <div
                        className={
                          styles.employeeInfo
                        }
                      >

                        <h2>
                          {employeeName}
                        </h2>

                        <p
                          className={
                            styles.role
                          }
                        >
                          {role}
                        </p>


                        {/* ===============================
                            EMPLOYEE ID
                        =============================== */}

                        <div
                          className={
                            styles.infoRow
                          }
                        >

                          <div
                            className={
                              styles.infoLabel
                            }
                          >

                            <CreditCard
                              size={13}
                            />

                            <span>
                              Employee ID
                            </span>

                          </div>

                          <strong>
                            {employeeId}
                          </strong>

                        </div>


                        {/* ===============================
                            EMAIL
                        =============================== */}

                        <div
                          className={
                            styles.infoRow
                          }
                        >

                          <div
                            className={
                              styles.infoLabel
                            }
                          >

                            <Mail size={13} />

                            <span>
                              Email
                            </span>

                          </div>

                          <strong
                            title={
                              employee.email ||
                              "N/A"
                            }
                          >
                            {employee.email ||
                              "N/A"}
                          </strong>

                        </div>


                        {/* ===============================
                            PHONE
                        =============================== */}

                        <div
                          className={
                            styles.infoRow
                          }
                        >

                          <div
                            className={
                              styles.infoLabel
                            }
                          >

                            <Phone size={13} />

                            <span>
                              Phone
                            </span>

                          </div>

                          <strong>
                            {employee.phone ||
                              "N/A"}
                          </strong>

                        </div>


                        {/* ===============================
                            BRANCH
                        =============================== */}

                        <div
                          className={
                            styles.infoRow
                          }
                        >

                          <div
                            className={
                              styles.infoLabel
                            }
                          >

                            <Building2 size={13} />

                            <span>
                              Branch
                            </span>

                          </div>

                          <strong>
                            {employee.branch?.name || "N/A"}
                          </strong>

                        </div>

                      </div>


                      {/* =================================================
                          CARD FOOTER
                      ================================================= */}

                      <div
                        className={
                          styles.cardFooter
                        }
                      >

                        {/* ===============================
                            VERIFICATION STATUS
                        =============================== */}

                        <span
                          className={`
                            ${styles.status}
                            ${
                              isVerified
                                ? styles.statusVerified
                                : styles.statusPending
                            }
                          `}
                        >

                          <span
                            className={
                              styles.statusDot
                            }
                          />

                          {isVerified
                            ? "Verified"
                            : "Pending"}

                        </span>


                        {/* ===============================
                            ACTIONS
                        =============================== */}

                        <div
                          className={
                            styles.cardActions
                          }
                        >

                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={() =>
                              handleEditEmployee(
                                employee
                              )
                            }
                            title="Edit Employee"
                            aria-label="Edit Employee"
                          >
                            <Edit2 size={15} />
                          </button>


                          <button
                            type="button"
                            className={
                              styles.deleteButton
                            }
                            onClick={() =>
                              handleDeleteEmployee(
                                employee.id
                              )
                            }
                            title="Delete Employee"
                            aria-label="Delete Employee"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

          </div>


          {/* =================================================
              EDIT EMPLOYEE MODAL
          ================================================= */}

          {isModalOpen && (

            <div
              className={
                styles.modalOverlay
              }
              onClick={closeModal}
            >

              <div
                className={
                  styles.modalContent
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                {/* =================================================
                    MODAL HEADER
                ================================================= */}

                <div
                  className={
                    styles.modalHeader
                  }
                >
                  <h2
                    className={
                      styles.modalTitle
                    }
                  >
                    Edit Employee
                  </h2>

                  <p
                    className={
                      styles.modalSubtitle
                    }
                  >
                    Update employee information
                  </p>
                </div>


                {/* =================================================
                    EDIT FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                >

                  {/* FULL NAME */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleInputChange
                      }
                      className={
                        styles.input
                      }
                      placeholder="Enter full name"
                      style={errors.fullName ? { borderColor: "#ef4444" } : {}}
                    />
                    {errors.fullName && (
                      <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        {errors.fullName}
                      </span>
                    )}

                  </div>


                  {/* EMPLOYEE ID */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="employeeId"
                    >
                      Employee ID
                    </label>

                    <input
                      id="employeeId"
                      type="text"
                      name="employeeId"
                      value={
                        formData.employeeId
                      }
                      onChange={
                        handleInputChange
                      }
                      className={
                        styles.input
                      }
                      placeholder="EMP-001"
                      style={errors.employeeId ? { borderColor: "#ef4444" } : {}}
                    />
                    {errors.employeeId && (
                      <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        {errors.employeeId}
                      </span>
                    )}

                  </div>


                  {/* ROLE */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="role"
                    >
                      Role
                    </label>

                    <select
                      id="role"
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
                          <option value="Admin">Admin</option>
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


                  {/* BRANCH */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="branchId"
                    >
                      Branch
                    </label>

                    <select
                      id="branchId"
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


                  {/* EMAIL */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="email"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleInputChange
                      }
                      className={
                        styles.input
                      }
                      placeholder="employee@example.com"
                      style={errors.email ? { borderColor: "#ef4444" } : {}}
                    />
                    {errors.email && (
                      <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        {errors.email}
                      </span>
                    )}

                  </div>


                  {/* PHONE */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >

                    <label
                      className={
                        styles.label
                      }
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleInputChange
                      }
                      className={
                        styles.input
                      }
                      placeholder="+91 9876543210"
                      style={errors.phone ? { borderColor: "#ef4444" } : {}}
                    />
                    {errors.phone && (
                      <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        {errors.phone}
                      </span>
                    )}

                  </div>





                  {/* =================================================
                      FORM ACTIONS
                  ================================================= */}

                  <div
                    className={
                      styles.formActions
                    }
                  >

                    <button
                      type="button"
                      className={
                        styles.cancelButton
                      }
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      className={
                        styles.submitButton
                      }
                      disabled={submitting}
                    >

                      {submitting ? (
                        <>
                          <Loader2
                            size={16}
                            className={
                              styles.buttonSpinner
                            }
                          />

                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}

                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </div>
      </div>
    </div>
  );
}