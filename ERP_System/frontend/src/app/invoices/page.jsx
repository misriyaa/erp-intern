"use client";

import { useState, useMemo, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiFileText, FiFilter } from "react-icons/fi";
import InvoiceTable from "./components/InvoiceTable";
import InvoicePreview from "./components/InvoicePreview";
import PrintInvoice from "./components/PrintInvoice";
import apiClient from "@/services/apiClient";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const [invRes, salesRes] = await Promise.allSettled([
        apiClient.get("/invoices"),
        apiClient.get("/sales"),
      ]);

      let list = [];
      if (invRes.status === "fulfilled" && invRes.value.data?.data) {
        const rawInv = Array.isArray(invRes.value.data.data) ? invRes.value.data.data : [];
        list = [...rawInv];
      }

      // Also merge sales orders as fallback if not in invoices
      if (salesRes.status === "fulfilled" && salesRes.value.data?.data) {
        const rawSales = Array.isArray(salesRes.value.data.data) ? salesRes.value.data.data : [];
        rawSales.forEach((sale) => {
          const invNum = sale.orderNumber || `SO-${sale.id}`;
          if (!list.some((i) => i.invoiceNumber === invNum || i.salesOrderId === sale.id || i.id === sale.id)) {
            list.push({
              id: sale.id,
              invoiceNumber: invNum,
              invoiceNo: invNum,
              customerName: sale.customerName || sale.customer || "Walk-in Customer",
              customer: sale.customerName || sale.customer || "Walk-in Customer",
              date: sale.orderDate ? new Date(sale.orderDate).toISOString().split("T")[0] : new Date(sale.createdAt || Date.now()).toISOString().split("T")[0],
              referenceNumber: sale.orderNumber || invNum,
              salesOrderNumber: sale.orderNumber || invNum,
              totalAmount: Number(sale.netAmount || sale.totalAmount || 0),
              total: Number(sale.netAmount || sale.totalAmount || 0),
              subTotal: Number(sale.totalAmount || 0),
              tax: Number(sale.taxAmount || 0),
              discount: Number(sale.discountAmount || 0),
              paymentStatus: sale.status === "COMPLETED" ? "PAID" : (sale.status === "CANCELLED" ? "CANCELLED" : "PENDING"),
              status: sale.status || "PAID",
              paymentMethod: sale.paymentMethod || "Cash",
              items: sale.items || [],
            });
          }
        });
      }

      setInvoices(list);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const num = (inv.invoiceNumber || inv.invoiceNo || "").toLowerCase();
      const cust = (inv.customerName || inv.customer || "").toLowerCase();
      const ref = (inv.referenceNumber || inv.salesOrderNumber || "").toLowerCase();
      const matchesSearch = !q || num.includes(q) || cust.includes(q) || ref.includes(q);

      const status = (inv.paymentStatus || "").toUpperCase();
      const matchesPayment =
        paymentFilter === "ALL" ||
        (paymentFilter === "PAID" && (status === "PAID" || status === "COMPLETED")) ||
        (paymentFilter === "PENDING" && (status === "PENDING" || status === "UNPAID"));

      return matchesSearch && matchesPayment;
    });
  }, [invoices, searchQuery, paymentFilter]);

  const handlePrint = (invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div
        className="no-print"
        style={{
          minHeight: "80vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <FiRefreshCw
          size={26}
          style={{
            color: "#2563eb",
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ fontSize: "16px", fontWeight: "600", color: "#64748b" }}>
          Loading Invoices...
        </span>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FiFileText size={26} style={{ color: "#2563eb" }} />
              <span>Invoices & Billing</span>
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>
              View, preview, and print invoices generated from store sales and customer orders.
            </p>
          </div>

          {/* REFRESH BUTTON */}
          <button
            onClick={fetchInvoices}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <FiRefreshCw size={14} />
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
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* FILTER TOOLBAR */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}
          <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
            <FiSearch
              size={17}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by Invoice #, Customer, or Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 16px 0 40px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "9px",
                outline: "none",
                fontSize: "13px",
                color: "#1e293b",
                fontWeight: "500",
              }}
            />
          </div>

          {/* PAYMENT FILTER BUTTONS */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {["ALL", "PAID", "PENDING"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setPaymentFilter(status)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: paymentFilter === status ? "#2563eb" : "#cbd5e1",
                  backgroundColor: paymentFilter === status ? "#2563eb" : "#ffffff",
                  color: paymentFilter === status ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                {status === "ALL" ? "All Invoices" : status === "PAID" ? "Paid" : "Pending"}
              </button>
            ))}

            <div
              style={{
                padding: "7px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: "700",
                whiteSpace: "nowrap",
                marginLeft: "8px",
              }}
            >
              Showing <strong style={{ color: "#0f172a" }}>{filteredInvoices.length}</strong> Invoice(s)
            </div>
          </div>
        </div>

        {/* INVOICE TABLE */}
        <InvoiceTable
          invoices={filteredInvoices}
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
