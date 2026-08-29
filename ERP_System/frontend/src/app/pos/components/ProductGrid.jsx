"use client";

import { IconPlus } from "./icons";

export default function ProductGrid({ products = [], totalProducts = 0, addToCart, onAddToCart }) {
  const handleAddToCart = addToCart || onAddToCart;

  if (!products || products.length === 0) {
    return (
      <div className="pos-products-empty" style={{ padding: "50px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#64748b" }}>
          {totalProducts === 0
            ? "No products available. Add products to start selling."
            : "No products match the selected criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="pos-products-list-view" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {products.map((product) => {
        const isOutOfStock = (product.stock ?? product.available ?? 0) <= 0;
        const isLowStock = (product.stock ?? product.available ?? 0) > 0 && (product.stock ?? product.available ?? 0) <= 10;

        return (
          <div
            key={product.id}
            className="pos-product-list-item"
            onClick={() => handleAddToCart && handleAddToCart(product)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              gap: "16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)";
              e.currentTarget.style.transform = "translateX(2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* Left: Thumbnail & Main Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#f1f5f9",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #e2e8f0",
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: product.imageUrl ? "none" : "flex",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#64748b",
                  }}
                >
                  {product.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
              </div>

              {/* Text Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  {product.brand && product.brand !== "Generic" && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "1px 7px",
                        borderRadius: "10px",
                        backgroundColor: "#e0e7ff",
                        color: "#3730a3",
                      }}
                    >
                      {product.brand}
                    </span>
                  )}
                  {product.category && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "1px 7px",
                        borderRadius: "10px",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", display: "flex", gap: "10px" }}>
                  <span>SKU: <strong style={{ color: "#334155" }}>{product.sku || product.code || "N/A"}</strong></span>
                  {product.barcode && product.barcode !== product.sku && (
                    <span>Barcode: <strong style={{ color: "#334155" }}>{product.barcode}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stock, Price & Add Action */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
              {/* Stock Status */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor: isOutOfStock ? "#fee2e2" : isLowStock ? "#fef3c7" : "#ecfdf5",
                    color: isOutOfStock ? "#dc2626" : isLowStock ? "#d97706" : "#16a34a",
                  }}
                >
                  {isOutOfStock ? "Out of Stock" : `${product.stock ?? 0} in stock`}
                </span>
              </div>

              {/* Price */}
              <div style={{ textAlign: "right", minWidth: "80px" }}>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  ₹{Number(product.price).toFixed(2)}
                </div>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (handleAddToCart) handleAddToCart(product);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                title="Add to Cart"
                aria-label={`Add ${product.name} to cart`}
              >
                <IconPlus width={15} height={15} />
                <span>Add</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
