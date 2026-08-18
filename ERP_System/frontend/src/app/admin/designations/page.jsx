"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiPrinter,
  FiDownload,
  FiSearch,
  FiChevronDown,
  FiMoreVertical,
  FiRefreshCw,
  FiFilter,
  FiX,
  FiSave,
  FiArrowDown,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";

import styles from "./designations.module.css";
import { useAlert } from "@/context/AlertContext";
import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "@/services/designationService";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/roleService";

export default function DesignationsPage() {
  const [activeTab, setActiveTab] = useState("designations"); // "designations" | "roles"

  // Data states
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const { showSuccess, showError, showConfirm } = useAlert();

  // Form states
  const [designationForm, setDesignationForm] = useState({
    designation: "",
    department: "",
    status: "ACTIVE",
    code: "",
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
  });

  // Load all initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [desigRes, rolesRes, deptRes] = await Promise.allSettled([
        getDesignations(),
        getRoles(),
        axios.get("http://localhost:5000/api/departments"),
      ]);

      if (desigRes.status === "fulfilled" && desigRes.value.success) {
        setDesignations(desigRes.value.data || []);
      }

      if (rolesRes.status === "fulfilled" && rolesRes.value.success) {
        setRoles(rolesRes.value.data || []);
      }

      if (deptRes.status === "fulfilled" && deptRes.value.data) {
        const depts = deptRes.value.data.data || deptRes.value.data;
        if (Array.isArray(depts)) {
          setDepartments(depts.map((d) => (typeof d === "object" ? d.name : d)));
        }
      }
    } catch (err) {
      console.error("Error loading designations/roles data:", err);
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Designations
  const filteredDesignations = useMemo(() => {
    let result = designations.filter((item) => {
      const value = search.toLowerCase();
      const nameMatch = item.designation?.toLowerCase().includes(value);
      const codeMatch = item.code?.toLowerCase().includes(value);
      const deptMatch = item.department?.toLowerCase().includes(value);

      const matchesSearch = nameMatch || codeMatch || deptMatch;
      const matchesStatus =
        filterStatus === "All" ||
        item.status === filterStatus ||
        (filterStatus === "Active" && item.status === "ACTIVE") ||
        (filterStatus === "Inactive" && item.status === "INACTIVE");

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      return sortAsc
        ? (a.designation || "").localeCompare(b.designation || "")
        : (b.designation || "").localeCompare(a.designation || "");
    });

    return result;
  }, [designations, search, filterStatus, sortAsc]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    let result = roles.filter((r) => {
      const value = search.toLowerCase();
      return r.name?.toLowerCase().includes(value);
    });

    result.sort((a, b) => {
      return sortAsc
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "");
    });

    return result;
  }, [roles, search, sortAsc]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === "designations") {
      setDesignationForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setRoleForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit Designation (Add or Edit)
  const handleSubmitDesignation = async (e) => {
    e.preventDefault();

    if (!designationForm.designation.trim() || !designationForm.department) {
      toast.error("Please enter designation name and select department.");
      return;
    }

    try {
      if (editingItem) {
        const res = await updateDesignation(editingItem.id, designationForm);
        if (res.success) {
          toast.success("Designation updated successfully");
          setDesignations((prev) =>
            prev.map((d) => (d.id === editingItem.id ? res.data : d))
          );
        }
      } else {
        const res = await createDesignation(designationForm);
        if (res.success) {
          toast.success("Designation created successfully");
          setDesignations((prev) => [res.data, ...prev]);
        }
      }

      setDesignationForm({ designation: "", department: "", status: "ACTIVE", code: "" });
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save designation");
    }
  };

  // Submit Role (Add or Edit)
  const handleSubmitRole = async (e) => {
    e.preventDefault();

    if (!roleForm.name.trim()) {
      toast.error("Please enter role name.");
      return;
    }

    try {
      if (editingItem) {
        const res = await updateRole(editingItem.id, roleForm);
        if (res.success) {
          toast.success("Role updated successfully");
          setRoles((prev) => prev.map((r) => (r.id === editingItem.id ? res.data : r)));
        }
      } else {
        const res = await createRole(roleForm);
        if (res.success) {
          toast.success("Role created successfully");
          setRoles((prev) => [res.data, ...prev]);
        }
      }

      setRoleForm({ name: "" });
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save role");
    }
  };

  // Delete Handler
  const handleDelete = (id) => {
    const isDesig = activeTab === "designations";
    setOpenMenu(null);
    showConfirm({
      title: `Delete ${isDesig ? "Designation" : "Role"}`,
      message: `Are you sure you want to delete this ${isDesig ? "designation" : "role"}? This action cannot be undone.`,
      confirmText: `Delete ${isDesig ? "Designation" : "Role"}`,
      type: "danger",
      onConfirm: async () => {
        try {
          if (isDesig) {
            await deleteDesignation(id);
            setDesignations((prev) => prev.filter((item) => item.id !== id));
            showSuccess("Designation Deleted", "Designation deleted successfully");
          } else {
            await deleteRole(id);
            setRoles((prev) => prev.filter((r) => r.id !== id));
            showSuccess("Role Deleted", "Role deleted successfully");
          }
        } catch (error) {
          showError("Deletion Failed", error.response?.data?.message || "Failed to delete item");
        }
      },
    });
  };

  // Edit Trigger
  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === "designations") {
      setDesignationForm({
        designation: item.designation,
        department: item.department,
        status: item.status || "ACTIVE",
        code: item.code || "",
      });
    } else {
      setRoleForm({
        name: item.name,
      });
    }

    setShowAddForm(true);
    setOpenMenu(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (activeTab === "designations") {
      const headers = ["ID", "Code", "Designation", "Department", "Created On", "Status"];
      const rows = designations.map((item) => [
        item.id,
        item.code,
        item.designation,
        item.department,
        new Date(item.createdAt).toLocaleDateString(),
        item.status,
      ]);
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      downloadCSV(csv, "designations.csv");
    } else {
      const headers = ["ID", "Role Name", "Employees Count", "Created On"];
      const rows = roles.map((item) => [
        item.id,
        item.name,
        item._count?.users || 0,
        new Date(item.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      downloadCSV(csv, "roles.csv");
    }
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = () => {
    setSortAsc((prev) => !prev);
  };

  const handleRefresh = () => {
    setSearch("");
    setFilterStatus("All");
    setSortAsc(true);
    loadData();
  };

  const openNewForm = () => {
    setEditingItem(null);
    setDesignationForm({ designation: "", department: "", status: "ACTIVE", code: "" });
    setRoleForm({ name: "" });
    setShowAddForm((prev) => !prev);
    setOpenMenu(null);
  };

  return (
    <div className={styles.page}>
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1>Designations & Roles Management</h1>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} onClick={handlePrint}>
            <FiPrinter size={15} />
            Print
          </button>

          <button className={styles.secondaryButton} onClick={handleExport}>
            <FiDownload size={15} />
            Export
            <FiChevronDown size={14} />
          </button>

          <button className={styles.addButton} onClick={openNewForm}>
            {showAddForm ? <FiX size={17} /> : <FiPlus size={17} />}
            {showAddForm
              ? "Close"
              : activeTab === "designations"
              ? "Add Designation"
              : "Add Role"}
          </button>
        </div>
      </header>

      {/* TABS CONTAINER */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "designations" ? styles.activeTab : ""
          }`}
          onClick={() => {
            setActiveTab("designations");
            setShowAddForm(false);
            setEditingItem(null);
          }}
        >
          <FiBriefcase style={{ marginRight: 6 }} /> Designations
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === "roles" ? styles.activeTab : ""
          }`}
          onClick={() => {
            setActiveTab("roles");
            setShowAddForm(false);
            setEditingItem(null);
          }}
        >
          <FiUsers style={{ marginRight: 6 }} /> Roles
        </button>
      </div>

      {/* ADD / EDIT FORM CARD */}
      {showAddForm && (
        <section className={styles.addCard}>
          <div className={styles.addCardHeader}>
            <div>
              <h2>
                {editingItem ? "Edit" : "Add New"}{" "}
                {activeTab === "designations" ? "Designation" : "Role"}
              </h2>
              <p>
                {activeTab === "designations"
                  ? "Manage employee designation title and department assignment."
                  : "Manage user system role permissions for employees."}
              </p>
            </div>

            <button className={styles.closeButton} onClick={() => { setShowAddForm(false); setEditingItem(null); }}>
              <FiX size={18} />
            </button>
          </div>

          {activeTab === "designations" ? (
            <form className={styles.form} onSubmit={handleSubmitDesignation}>
              <div className={styles.formGroup}>
                <label htmlFor="designation">
                  Designation Title <span>*</span>
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={designationForm.designation}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="department">
                  Department <span>*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={designationForm.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                    </>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={designationForm.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => { setShowAddForm(false); setEditingItem(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  <FiSave size={16} />
                  {editingItem ? "Update Designation" : "Save Designation"}
                </button>
              </div>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSubmitRole}>
              <div className={styles.formGroup}>
                <label htmlFor="name">
                  Role Name <span>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Admin, Manager, HR"
                  value={roleForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => { setShowAddForm(false); setEditingItem(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  <FiSave size={16} />
                  {editingItem ? "Update Role" : "Save Role"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* TABLE CARD */}
      <section className={styles.tableCard}>
        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FiSearch size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.toolbarRight}>
            {activeTab === "designations" && (
              <div className={styles.filterWrapper}>
                <button
                  className={styles.toolbarButton}
                  onClick={() =>
                    setFilterStatus(
                      filterStatus === "All"
                        ? "Active"
                        : filterStatus === "Active"
                        ? "Inactive"
                        : "All"
                    )
                  }
                >
                  <FiFilter size={16} />
                  Filter
                  <FiChevronDown size={14} />
                </button>
                {filterStatus !== "All" && (
                  <span className={styles.filterBadge}>{filterStatus}</span>
                )}
              </div>
            )}

            <button className={styles.toolbarButton} onClick={handleSort}>
              <FiArrowDown
                size={16}
                className={sortAsc ? styles.arrowUp : styles.arrowDown}
              />
              Sort By
              <FiChevronDown size={14} />
            </button>

            <button
              className={styles.iconButton}
              onClick={handleRefresh}
              title="Refresh"
            >
              <FiRefreshCw size={17} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Loading data...
            </div>
          ) : activeTab === "designations" ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Created On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesignations.length > 0 ? (
                  filteredDesignations.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.id}>{item.code}</td>
                      <td>
                        <strong>{item.designation}</strong>
                      </td>
                      <td className={styles.text}>{item.department}</td>
                      <td className={styles.text}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            item.status === "ACTIVE" || item.status === "Active"
                              ? styles.active
                              : styles.inactive
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionWrapper}>
                          <button
                            className={styles.actionButton}
                            onClick={() =>
                              setOpenMenu(openMenu === item.id ? null : item.id)
                            }
                          >
                            <FiMoreVertical size={17} />
                          </button>

                          {openMenu === item.id && (
                            <div className={styles.actionMenu}>
                              <button onClick={() => handleEdit(item)}>Edit</button>
                              <button
                                className={styles.deleteItem}
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.empty}>
                      No designations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role Name</th>
                  <th>Users Count</th>
                  <th>Created On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.id}>
                        #{item.id?.substring(0, 8)}
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td className={styles.text}>
                        {item._count?.users || 0} user(s)
                      </td>
                      <td className={styles.text}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <div className={styles.actionWrapper}>
                          <button
                            className={styles.actionButton}
                            onClick={() =>
                              setOpenMenu(openMenu === item.id ? null : item.id)
                            }
                          >
                            <FiMoreVertical size={17} />
                          </button>

                          {openMenu === item.id && (
                            <div className={styles.actionMenu}>
                              <button onClick={() => handleEdit(item)}>Edit</button>
                              <button
                                className={styles.deleteItem}
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.empty}>
                      No roles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}