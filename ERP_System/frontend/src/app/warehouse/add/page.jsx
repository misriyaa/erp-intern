"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouse } from "@/services/warehouseService";
import { useAlert } from "@/context/AlertContext";
import { useCompany } from "@/context/CompanyContext";

export default function AddWarehousePage() {
  const router = useRouter();
  const { isGym, isTextile } = useCompany();
  const { showSuccess, showError } = useAlert();

  const defaultPrefix = isTextile ? "TEX-WH-" : isGym ? "GYM-WH-" : "RET-WH-";

  const [form, setForm] = useState({
    name: "",
    code: `${defaultPrefix}${Math.floor(100 + Math.random() * 900)}`,
    location: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const tag = isTextile ? "[TEXTILE]" : isGym ? "[GYM]" : "[RETAIL]";
      const finalCode = form.code?.startsWith(defaultPrefix) ? form.code : `${defaultPrefix}${form.code}`;
      const finalAddress = form.address ? `${form.address} ${tag}` : tag;

      const payload = {
        ...form,
        code: finalCode,
        address: finalAddress,
      };

      await createWarehouse(payload);
      showSuccess("Warehouse Created", `${isTextile ? "Textile Mill Warehouse" : "Warehouse"} location registered successfully.`);
      router.push("/warehouse");
    } catch (error) {
      console.error(error);
      showError("Invalid form data", error.response?.data?.message || "Failed to create warehouse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">
          {isTextile
            ? "🧵 Add Textile Mill & Processing Warehouse"
            : isGym
            ? "🏋️ Add Gym Equipment Warehouse"
            : "📦 Add Retail Warehouse"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isTextile
            ? "Register a fabric mill, yarn depot, spinning center, or dyeing facility."
            : "Register a storage facility for store products or gym gear."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {isTextile ? "Mill / Warehouse Name *" : "Warehouse Name *"}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={isTextile ? "e.g. Surat Spinning Depot A" : "Warehouse Name"}
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Warehouse Code *
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Warehouse Code"
              required
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location / City
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Industrial Estate Sector 4"
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Street Address & Details
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address details"
              rows={4}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-bold"
          >
            {loading
              ? "Creating..."
              : isTextile
              ? "Create Textile Mill Warehouse"
              : "Create Warehouse"}
          </button>
        </form>
      </div>
    </div>
  );
}