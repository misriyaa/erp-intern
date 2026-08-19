"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import CustomerCard from "../components/CustomerCard";
import { getCustomerById, deleteCustomer } from "@/services/customerService";
import { useAlert } from "@/context/AlertContext";
import styles from "../customers.module.css";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getCustomerById(id);
        setCustomer(data);
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
        setErrorMsg("Failed to load customer profile.");
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [id]);

  const handleDelete = (targetCustomer) => {
    showConfirm({
      title: "Delete Customer",
      message: `Are you sure you want to delete customer "${targetCustomer.name}"? This action cannot be undone.`,
      confirmText: "Delete Customer",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteCustomer(targetCustomer.id);
          showSuccess("Product updated", "Customer deleted successfully.");
          router.push("/customers");
        } catch (err) {
          console.error("Delete customer error:", err);
          showError("Product couldn't be deleted", err.response?.data?.message || err.message || "Failed to delete customer.");
        }
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "350px", gap: "10px", color: "#64748b" }}>
          <FiRefreshCw className="animate-spin" size={20} />
          <span>Loading customer details...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !customer) {
    return (
      <div className={styles.page}>
        <div style={{ padding: "16px 20px", backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "8px", border: "1px solid #fecaca", maxWidth: "600px", margin: "20px auto" }}>
          {errorMsg || "Customer record not found."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CustomerCard customer={customer} onDelete={handleDelete} />
    </div>
  );
}