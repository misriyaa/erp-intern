"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/services/customerService";

export default function CustomerSelect({ value, onChange }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await getCustomers();
        if (res && res.data) {
          setCustomers(res.data);
        } else if (Array.isArray(res)) {
          setCustomers(res);
        }
      } catch (err) {
        console.error("Failed to load customers in CustomerSelect:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg p-3"
      disabled={loading}
    >
      <option value="">
        {loading ? "Loading customers..." : "Select Customer"}
      </option>

      {customers.map((c) => {
        const name = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim();
        return (
          <option key={c.id} value={name}>
            {name} ({c.phone})
          </option>
        );
      })}
    </select>
  );
}