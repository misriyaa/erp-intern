"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customerService";

import {
  FiPlus,
  FiPrinter,
  FiDownload,
  FiSearch,
  FiChevronDown,
  FiRefreshCw,
  FiArrowDown,
  FiX,
  FiFilter,
} from "react-icons/fi";

import CustomerTable from "./components/CustomerTable";
import CustomerForm from "./components/CustomerForm";
import { useAlert } from "@/context/AlertContext";
import styles from "./customers.module.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [filterStatus, setFilterStatus] = useState("All");

  const { showSuccess, showError, showConfirm } = useAlert();

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      if (response && response.data) {
        setCustomers(response.data);
      } else if (Array.isArray(response)) {
        setCustomers(response);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      showError("API/server failure", err.response?.data?.message || err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleAddNew = () => {
    setEditingCustomer(null);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCustomer) {
        const res = await updateCustomer(editingCustomer.id, formData);
        showSuccess("Product updated", res.message || `Customer "${formData.name}" updated successfully.`);
      } else {
        const res = await createCustomer(formData);
        showSuccess("Employee added", res.message || `Customer "${formData.name}" added successfully.`);
      }
      await fetchCustomerData();
      handleCancelForm();
    } catch (err) {
      console.error("Customer submit error:", err);
      showError("Invalid form data", err.response?.data?.message || err.message || "Failed to save customer record.");
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCustomer = (customer) => {
    showConfirm({
      title: "Delete Customer",
      message: `Are you sure you want to delete customer "${customer.name || "this customer"}"? This action cannot be undone.`,
      confirmText: "Delete Customer",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteCustomer(customer.id);
          showSuccess("Product updated", res.message || "Customer record deleted successfully.");
          await fetchCustomerData();
        } catch (err) {
          console.error("Customer delete error:", err);
          showError("Product couldn't be deleted", err.response?.data?.message || err.message || "Failed to delete customer.");
        }
      },
    });
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === "default" ? "az" : prev === "az" ? "za" : "default"));
  };

  const handleRefresh = async () => {
    setSearch("");
    setFilterStatus("All");
    setSortOrder("default");
    await fetchCustomerData();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = ["ID", "Customer Name", "Phone", "Email", "Loyalty ID", "Credit Limit", "Current Balance"];
    const rows = customers.map((c) => [
      c.id,
      c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
      c.phone || "",
      c.email || "",
      c.loyaltyId || "",
      c.creditLimit || 0,
      c.currentBalance || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredCustomers = useMemo(() => {
    let data = [...customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) => {
        const name = (c.name || `${c.firstName || ""} ${c.lastName || ""}`).toLowerCase();
        const email = (c.email || "").toLowerCase();
        const phone = (c.phone || "").toLowerCase();
        const id = (c.id || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
      });
    }

    if (filterStatus !== "All") {
      data = data.filter((c) => (c.status || "ACTIVE").toUpperCase() === filterStatus.toUpperCase());
    }

    if (sortOrder === "az") {
      data.sort((a, b) =>
        (a.name || a.firstName || "").localeCompare(b.name || b.firstName || "")
      );
    } else if (sortOrder === "za") {
      data.sort((a, b) =>
        (b.name || b.firstName || "").localeCompare(a.name || a.firstName || "")
      );
    }

    return data;
  }, [customers, search, filterStatus, sortOrder]);

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1>Customers</h1>

        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryButton} onClick={handlePrint}>
            <FiPrinter size={15} />
            Print
          </button>

          <button type="button" className={styles.secondaryButton} onClick={handleExport}>
            <FiDownload size={15} />
            Export
            <FiChevronDown size={14} />
          </button>

          <button type="button" className={styles.addButton} onClick={handleAddNew}>
            <FiPlus size={17} />
            Add Customer
          </button>
        </div>
      </div>

      {/* ADD / EDIT CUSTOMER FORM CARD */}
      {showAddForm && (
        <div className={styles.addCard}>
          <div className={styles.addHeader}>
            <div>
              <h2>{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
              <p>{editingCustomer ? "Update customer information" : "Create a new customer profile"}</p>
            </div>

            <button type="button" className={styles.closeButton} onClick={handleCancelForm}>
              <FiX size={18} />
            </button>
          </div>

          <CustomerForm
            initialData={editingCustomer || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* TABLE CARD */}
      <div className={styles.tableCard}>
        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.toolbarRight}>
            {/* FILTER */}
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() =>
                setFilterStatus((prev) => (prev === "All" ? "ACTIVE" : prev === "ACTIVE" ? "INACTIVE" : "All"))
              }
            >
              <FiFilter size={16} />
              Filter: {filterStatus}
              <FiChevronDown size={14} />
            </button>

            {/* SORT */}
            <button type="button" className={styles.toolbarButton} onClick={handleSort}>
              <FiArrowDown size={15} />
              Sort: {sortOrder.toUpperCase()}
              <FiChevronDown size={14} />
            </button>

            {/* REFRESH */}
            <button type="button" className={styles.iconButton} onClick={handleRefresh} title="Refresh">
              <FiRefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td colSpan="8" className={styles.empty}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <FiRefreshCw className="animate-spin" size={18} />
                      Loading customer records...
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onDelete={handleDeleteCustomer}
            onEdit={handleEditCustomer}
          />
        )}
      </div>
    </div>
  );
}