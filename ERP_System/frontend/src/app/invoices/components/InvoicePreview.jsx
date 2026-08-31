"use client";

import { FiX, FiPrinter, FiUser, FiCalendar } from "react-icons/fi";
import { useCompany } from "@/context/CompanyContext";
import { useSettings } from "@/context/SettingsContext";

export default function InvoicePreview({ invoice, onClose, onPrint }) {
  const { company } = useCompany();
  const { settings } = useSettings();

  if (!invoice) return null;

  const companyName = company?.name || settings?.companyName || "Retail ERP Cloud";
  const companyPhone = company?.phone || settings?.companyPhone || "";
  const companyAddress = company?.address || settings?.companyAddress || "";

  // Normalize subtotal, discount, tax, total variables to support both database invoice and sales order records
  const subtotalVal = Number(invoice.subtotal !== undefined ? invoice.subtotal : (invoice.subTotal !== undefined ? invoice.subTotal : 0));
  const discountVal = Number(invoice.discountAmount !== undefined ? invoice.discountAmount : (invoice.discount !== undefined ? invoice.discount : 0));
  const taxVal = Number(invoice.taxAmount !== undefined ? invoice.taxAmount : (invoice.tax !== undefined ? invoice.tax : 0));
  const totalVal = Number(invoice.total !== undefined ? invoice.total : (invoice.totalAmount !== undefined ? invoice.totalAmount : 0));

  return (
    <div className="invoice-modal-overlay">
      {/* LOCAL STYLES SHEET */}
      <style>{`
        .invoice-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .invoice-modal-card {
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          animation: invoiceModalFadeIn 0.2s ease-out;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        @keyframes invoiceModalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .invoice-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          background-color: #f8fafc;
        }

        .invoice-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .invoice-modal-subtitle {
          margin: 4px 0 0 0;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .invoice-close-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .invoice-close-btn:hover {
          background-color: #cbd5e1;
          color: #334155;
        }

        .invoice-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .invoice-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
          flex-wrap: wrap;
        }

        .invoice-brand-name {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-brand-details {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #64748b;
          max-width: 320px;
          line-height: 1.45;
        }

        .invoice-meta-info {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .invoice-meta-label {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-meta-value {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .invoice-meta-date {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          margin-top: 2px;
        }

        .invoice-customer-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .invoice-card-section-title {
          margin: 0 0 6px 0;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-customer-name {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #1e293b;
          font-weight: 700;
          font-size: 13px;
        }

        .invoice-payment-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 13px;
          color: #475569;
        }

        .invoice-status-paid {
          font-weight: 700;
          color: #16a34a;
          background-color: #dcfce7;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          display: inline-block;
          width: fit-content;
        }

        .invoice-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .invoice-items-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .invoice-items-table th {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .invoice-items-table td {
          padding: 12px 14px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .invoice-totals-section {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
        }

        .invoice-totals-card {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .invoice-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #475569;
        }

        .invoice-total-row.grand-total {
          border-top: 1px solid #e2e8f0;
          margin-top: 6px;
          padding-top: 10px;
          align-items: center;
        }

        .invoice-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 24px;
          border-top: 1px solid #f1f5f9;
          background-color: #f8fafc;
        }

        .invoice-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-sizing: border-box;
        }

        .invoice-btn-secondary {
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
        }

        .invoice-btn-secondary:hover {
          background-color: #f1f5f9;
        }

        .invoice-btn-primary {
          border: none;
          background-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
        }

        .invoice-btn-primary:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      <div className="invoice-modal-card">
        {/* Header */}
        <div className="invoice-modal-header">
          <div>
            <h2 className="invoice-modal-title">Invoice Details</h2>
            <p className="invoice-modal-subtitle">Reference ID: {invoice.id}</p>
          </div>
          <button onClick={onClose} className="invoice-close-btn">
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="invoice-modal-body">
          {/* Top layout: Brand & Invoice Meta */}
          <div className="invoice-meta-row">
            <div>
              <h3 className="invoice-brand-name">{companyName}</h3>
              {companyAddress && <p className="invoice-brand-details">{companyAddress}</p>}
              {companyPhone && <p className="invoice-brand-details">Phone: {companyPhone}</p>}
            </div>

            <div className="invoice-meta-info">
              <span className="invoice-meta-label">Invoice Number</span>
              <span className="invoice-meta-value">{invoice.invoiceNo}</span>
              <div className="invoice-meta-date">
                <FiCalendar size={13} />
                <span>Date: {invoice.date}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="invoice-customer-card">
            <div>
              <h4 className="invoice-card-section-title">Billed To</h4>
              <div className="invoice-customer-name">
                <FiUser style={{ color: "#94a3b8" }} size={15} />
                <span>{invoice.customer}</span>
              </div>
            </div>
            <div>
              <h4 className="invoice-card-section-title">Payment Details</h4>
              <div className="invoice-payment-details">
                <p style={{ margin: 0 }}>
                  Method: <strong style={{ color: "#1e293b" }}>{invoice.paymentMethod || "Cash"}</strong>
                </p>
                <div style={{ marginTop: "2px" }}>
                  <span className="invoice-status-paid">PAID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="invoice-table-wrapper">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Product Details</th>
                  <th style={{ textAlign: "center", width: "80px" }}>Qty</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Price</th>
                  <th style={{ textAlign: "right", width: "140px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => {
                    const price = Number(item.unitPrice || item.price || 0);
                    const qty = Number(item.quantity || item.qty || 1);
                    const total = Number(item.total || (qty * price));
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: "#1e293b" }}>
                          {item.productName || item.product || `Product Code: ${item.productId || "N/A"}`}
                        </td>
                        <td style={{ textAlign: "center" }}>{qty}</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "16px", color: "#64748b" }}>
                      No items specified for this transaction.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="invoice-totals-section">
            <div className="invoice-totals-card">
              <div className="invoice-total-row">
                <span>Subtotal</span>
                <strong style={{ color: "#1e293b" }}>
                  ₹{subtotalVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="invoice-total-row" style={{ color: "#ef4444" }}>
                <span>Discount</span>
                <strong>
                  - ₹{discountVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="invoice-total-row">
                <span>Tax</span>
                <strong style={{ color: "#1e293b" }}>
                  ₹{taxVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="invoice-total-row grand-total">
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Grand Total</span>
                <strong style={{ fontSize: "18px", fontWeight: 900, color: "#2563eb" }}>
                  ₹{totalVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="invoice-modal-footer">
          <button onClick={onClose} className="invoice-btn invoice-btn-secondary">
            Close
          </button>
          <button onClick={() => onPrint(invoice)} className="invoice-btn invoice-btn-primary">
            <FiPrinter size={15} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
