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
    creditLimit:
      initialData.creditLimit !== undefined && initialData.creditLimit !== null
        ? String(initialData.creditLimit)
        : "",
    currentBalance: initialData.currentBalance || 0,
  });

  const [submitting, setSubmitting] = useState(false);

  const generateLoyaltyId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    setForm((prev) => ({ ...prev, loyaltyId: `LOY-${num}` }));
  };

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        name: initialData.name || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        loyaltyId: initialData.loyaltyId || `LOY-${Math.floor(100000 + Math.random() * 900000)}`,
        creditLimit:
          initialData.creditLimit !== undefined && initialData.creditLimit !== null
            ? String(initialData.creditLimit)
            : "",
        currentBalance: initialData.currentBalance || 0,
      });
    } else {
      generateLoyaltyId();
    }
  }, [initialData]);

  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitized = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, phone: sanitized }));
      if (sanitized && sanitized.length !== 10) {
        setPhoneError(`Phone number must be exactly 10 digits (${sanitized.length}/10)`);
      } else {
        setPhoneError("");
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "currentBalance" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showWarning("Invalid form data", "Customer name is required.");
      return;
    }

    const cleanPhone = form.phone.trim();
    if (!cleanPhone) {
      setPhoneError("Phone number is required.");
      showWarning("Invalid form data", "Phone number is required.");
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      showWarning(
        "Invalid Phone Number",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    try {
      setSubmitting(true);
      const parsedCreditLimit =
        form.creditLimit === "" || form.creditLimit === null || isNaN(Number(form.creditLimit))
          ? 0
          : Number(form.creditLimit);

      const finalForm = {
        ...form,
        phone: digitsOnly,
        creditLimit: parsedCreditLimit,
        currentBalance: Number(form.currentBalance) || 0,
        loyaltyId: form.loyaltyId || `LOY-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      await onSubmit(finalForm);
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
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. 9876543210"
          maxLength={10}
          pattern="[0-9]{10}"
          required
          style={{
            borderColor: phoneError ? "#ef4444" : undefined,
          }}
        />
        {phoneError && (
          <span
            style={{
              fontSize: "12px",
              color: "#ef4444",
              marginTop: "4px",
              display: "block",
              fontWeight: 500,
            }}
          >
            {phoneError}
          </span>
        )}
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
        <label htmlFor="loyaltyId">
          Customer Loyalty ID <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>(Auto-Generated)</span>
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            id="loyaltyId"
            type="text"
            name="loyaltyId"
            value={form.loyaltyId}
            onChange={handleChange}
            placeholder="e.g. LOY-889901"
            style={{ fontWeight: "700", color: "#0f172a" }}
          />
          <button
            type="button"
            onClick={generateLoyaltyId}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
            title="Generate new Loyalty ID"
          >
            ⚡ Auto Generate
          </button>
        </div>
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
          placeholder="Enter credit limit"
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