"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/services/customerService";

import { useCompany } from "@/context/CompanyContext";

export default function CustomerSelect({ value, onChange }) {
  const { isGym, isTextile } = useCompany();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await getCustomers();
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setCustomers(list);
        } else {
          if (isTextile) {
            setCustomers([
              { id: "c-tex-1", name: "Garment Factories Ltd", phone: "+91 98765 43210" },
              { id: "c-tex-2", name: "Apex Apparel Exporters", phone: "+91 98765 43211" },
              { id: "c-tex-3", name: "Fashion Trend Mills", phone: "+91 98765 43212" },
            ]);
          } else if (isGym) {
            setCustomers([
              { id: "c-gym-1", name: "John Doe (Gym Member)", phone: "+91 98765 54321" },
              { id: "c-gym-2", name: "Sarah Connor (PT Client)", phone: "+91 98765 54322" },
              { id: "c-gym-3", name: "Alex Smith (Annual Pass)", phone: "+91 98765 54323" },
            ]);
          } else {
            setCustomers([
              { id: "c-ret-1", name: "Walk-in Supermarket Shopper", phone: "+91 98765 65432" },
              { id: "c-ret-2", name: "Regular Retail Customer", phone: "+91 98765 65433" },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load customers in CustomerSelect:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [isGym, isTextile]);

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