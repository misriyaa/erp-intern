
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

  // Filter completed / paid invoices
  const completedInvoices = useMemo(() => {
    return sales.filter((sale) => {
      const isCompleted = sale.paymentStatus === "Paid";

      if (!isCompleted) return false;

      const search = searchQuery.toLowerCase();

      const matchesSearch =
        (sale.invoiceNo || "").toLowerCase().includes(search) ||
        (sale.customer || "").toLowerCase().includes(search);

      return matchesSearch;
    });
  }, [sales, searchQuery]);

  const handlePrint = (invoice) => {
    setInvoiceToPrint(invoice);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Loading
  if (loading) {
    return (
      <div
        className="no-print"
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#6b7280",
          }}
        >
          <FiRefreshCw
            size={24}
            style={{
              color: "#2563eb",
              animation: "spin 1s linear infinite",
            }}
          />

          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Loading Invoices...
          </span>
        </div>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* PRINT COMPONENT */}
      {invoiceToPrint && <PrintInvoice invoice={invoiceToPrint} />}

      {/* MAIN SCREEN */}
      <div
        className="no-print"
        style={{
          padding: "24px",
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          {/* TITLE */}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: "1.2",
                fontWeight: "800",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FiFileText
                size={28}
                style={{
                  color: "#2563eb",
                }}
              />

              <span>Invoices & Billing</span>
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              View, preview, and print invoices generated from completed POS
              sales.
            </p>
          </div>

          {/* REFRESH BUTTON */}
          <button
            onClick={refresh}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              padding: "10px 16px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <FiRefreshCw size={15} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "16px 20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              marginBottom: "24px",
              maxWidth: "600px",
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin: "0 0 5px",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              Failed to load sales database
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* FILTER TOOLBAR */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <FiSearch
              size={18}
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }}
            />

            <input
              type="text"
              placeholder="Search by Invoice No or Customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "46px",
                boxSizing: "border-box",
                padding: "0 16px 0 44px",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1f2937",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(59,130,246,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* COUNT */}
          <div
            style={{
              padding: "9px 16px",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: "10px",
              color: "#6b7280",
              fontSize: "13px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            Showing{" "}
            <span
              style={{
                color: "#111827",
                fontWeight: "700",
              }}
            >
              {completedInvoices.length}
            </span>{" "}
            Invoice(s)
          </div>
        </div>

        {/* INVOICE TABLE */}
        <InvoiceTable
          invoices={completedInvoices}
          onView={(invoice) => setSelectedInvoice(invoice)}
          onPrint={handlePrint}
        />

        {/* INVOICE PREVIEW */}
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

