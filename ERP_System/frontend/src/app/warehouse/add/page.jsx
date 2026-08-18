"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createWarehouse } from "@/services/warehouseService";
import { useAlert } from "@/context/AlertContext";

export default function AddWarehousePage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [form, setForm] = useState({
    name: "",
    code: "",
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
      await createWarehouse(form);
      showSuccess("Product created", "Warehouse location created successfully.");
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

        <h1 className="text-2xl font-bold mb-6">
          Add Warehouse
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Warehouse Name"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Warehouse Code"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            rows={4}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Warehouse"}
          </button>

        </form>

      </div>

    </div>
  );
}