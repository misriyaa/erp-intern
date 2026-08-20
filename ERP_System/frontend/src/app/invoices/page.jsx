"use client";

import { useState, useMemo } from "react";
import useSales from "@/hooks/useSales";
import { FiSearch, FiRefreshCw, FiFileText } from "react-icons/fi";
import InvoiceTable from "./components/InvoiceTable";
import InvoicePreview from "./components/InvoicePreview";
import PrintInvoice from "./components/PrintInvoice";

export default function InvoicesPage() {
  const { sales, loading, error, refresh } = useSales();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  // Filter for completed/paid sales orders
  const completedInvoices = useMemo(() => {
    return sales.filter((sale) => {
      // Consider "Paid" status as completed sale invoices
      const isCompleted = sale.paymentStatus === "Paid";
      if (!isCompleted) return false;

      // Filter by search query (Invoice No or Customer Name)
      const matchesSearch =
        (sale.invoiceNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.customer || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [sales, searchQuery]);

  const handlePrint = (invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="no-print min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <FiRefreshCw className="animate-spin text-blue-600" size={24} />
          <span className="text-lg font-semibold">Loading Invoices...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print component - Hidden on screen, visible only during print */}
      {invoiceToPrint && <PrintInvoice invoice={invoiceToPrint} />}

      {/* Screen layout - Hidden during print */}
      <div className="no-print p-6 bg-gray-50 min-h-screen">
        
        {/* Page title and header actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiFileText className="text-blue-600" />
              <span>Invoices & Billing</span>
            </h1>
            <p className="text-gray-500 mt-1">
              View, preview, and print invoices generated from completed POS sales.
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm cursor-pointer shadow-sm self-start md:self-auto"
          >
            <FiRefreshCw size={15} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6 max-w-xl">
            <p className="font-bold mb-1">Failed to load sales database</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Invoice No or Customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 font-medium text-gray-800 transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-semibold bg-gray-50 px-4 py-2 rounded-xl self-end sm:self-auto">
            Showing {completedInvoices.length} Invoice(s)
          </div>
        </div>

        {/* Invoices List Table */}
        <InvoiceTable
          invoices={completedInvoices}
          onView={(invoice) => setSelectedInvoice(invoice)}
          onPrint={handlePrint}
        />

        {/* Details preview modal overlay */}
        {selectedInvoice && (
          <InvoicePreview
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onPrint={handlePrint}
          />
        )}

      </div>
    </>
  );
}
