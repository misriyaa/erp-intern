"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import SalesTable from "./components/SalesTable";
import SalesFilter from "./components/SalesFilter";
import useSales from "@/hooks/useSales";

export default function SalesPage() {
  const { sales, loading } = useSales();

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        (sale.invoiceNo || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (sale.customer || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (sale.cashier || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCustomer =
        customer === "" || sale.customer === customer;

      const matchesPayment =
        paymentStatus === "" ||
        sale.paymentStatus === paymentStatus;

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesPayment
      );
    });
  }, [sales, search, customer, paymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading Sales...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Sales Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage invoices and customer sales.
          </p>
        </div>

        {/* <Link
          href="/sales/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg self-start"
        >
          + New Sale
        </Link> */}

      </div>

      <SalesFilter
        search={search}
        setSearch={setSearch}
        customer={customer}
        setCustomer={setCustomer}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
      />

      <SalesTable sales={filteredSales} />

    </div>
  );
}