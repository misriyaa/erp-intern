"use client";

import { FiX, FiCheck, FiPackage, FiCalendar } from "react-icons/fi";

export default function BatchSelectionModal({ isOpen, onClose, product, onSelectBatch }) {
  if (!isOpen || !product) return null;

  const batches = Array.isArray(product.batches) ? product.batches : [];

  const formatPrice = (val) => {
    return `₹${Number(val || 0).toFixed(2)}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                SELECT BATCH
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>SKU: {product.sku || product.code}</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0" }}>
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#64748b" }}>
            This product has multiple inventory batches. Choose the batch to sell from:
          </p>

          {batches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
              <FiPackage size={36} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
              <p style={{ margin: 0 }}>No batch records available for this product.</p>
            </div>
          ) : (
            batches.map((batch) => {
              const isAvailable = Number(batch.quantity || 0) > 0;
              const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();

              return (
                <div
                  key={batch.id}
                  onClick={() => {
                    if (isAvailable && !isExpired) {
                      onSelectBatch(product, batch);
                    }
                  }}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${isAvailable && !isExpired ? "#cbd5e1" : "#f1f5f9"}`,
                    backgroundColor: isAvailable && !isExpired ? "#ffffff" : "#f8fafc",
                    opacity: isAvailable && !isExpired ? 1 : 0.65,
                    cursor: isAvailable && !isExpired ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable && !isExpired) {
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.backgroundColor = "#f0f7ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable && !isExpired) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                        Batch {batch.batchNumber}
                      </span>
                      {isExpired ? (
                        <span style={{ padding: "2px 8px", borderRadius: "10px", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "11px", fontWeight: "700" }}>
                          Expired
                        </span>
                      ) : !isAvailable ? (
                        <span style={{ padding: "2px 8px", borderRadius: "10px", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "11px", fontWeight: "700" }}>
                          Out of Stock
                        </span>
                      ) : (
                        <span style={{ padding: "2px 8px", borderRadius: "10px", backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "700" }}>
                          {batch.quantity} in stock
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", fontSize: "13px" }}>
                      <span>
                        MRP: <strong style={{ color: "#16a34a" }}>{formatPrice(batch.mrp)}</strong>
                      </span>
                      <span>
                        Selling Price: <strong style={{ color: "#2563eb" }}>{formatPrice(batch.sellingPrice)}</strong>
                      </span>
                      {batch.expiryDate && (
                        <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiCalendar size={13} /> Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable || isExpired}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isAvailable && !isExpired ? "#2563eb" : "#cbd5e1",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: isAvailable && !isExpired ? "pointer" : "not-allowed",
                    }}
                  >
                    <FiCheck size={14} /> Select
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
