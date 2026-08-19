"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import { useAlert } from "@/context/AlertContext";
import styles from "../customers.module.css";

export default function CustomerForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {
  const router = useRouter();
  const { showWarning } = useAlert();

  const [form, setForm] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
    loyaltyId: initialData.loyaltyId || "",
    creditLimit: initialData.creditLimit || 0,
    currentBalance: initialData.currentBalance || 0,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        loyaltyId: initialData.loyaltyId || "",
        creditLimit: initialData.creditLimit || 0,
        currentBalance: initialData.currentBalance || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "creditLimit" || name === "currentBalance"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showWarning("Invalid form data", "Customer name is required.");
      return;
    }

    if (!form.phone.trim()) {
      showWarning("Invalid form data", "Phone number is required.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/customers");
    }
  };

  return (
    <form className={styles.customerForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Customer Name *</label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Phone *</label>
        <input
          id="phone"
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. +1 (555) 019-2834"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="customer@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="loyaltyId">Loyalty ID</label>
        <input
          id="loyaltyId"
          type="text"
          name="loyaltyId"
          value={form.loyaltyId}
          onChange={handleChange}
          placeholder="e.g. LOYAL-8899"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="creditLimit">Credit Limit</label>
        <input
          id="creditLimit"
          type="number"
          step="0.01"
          min="0"
          name="creditLimit"
          value={form.creditLimit}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="currentBalance">Current Balance</label>
        <input
          id="currentBalance"
          type="number"
          step="0.01"
          min="0"
          name="currentBalance"
          value={form.currentBalance}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <div className={styles.formGroupFull}>
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter street, city, state address"
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleCancelClick}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={submitting}
        >
          <FiSave size={16} />
          {submitting ? "Saving..." : "Save Customer"}
        </button>
      </div>
    </form>
  );
}