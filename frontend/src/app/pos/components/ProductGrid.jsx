"use client";

import { IconPlus } from "./icons";

export default function ProductGrid({ products, addToCart, onAddToCart }) {
  const handleAddToCart = addToCart || onAddToCart;

  if (!products || products.length === 0) {
    return (
      <div className="pos-products-empty">
        No products match the selected criteria.
      </div>
    );
  }

  return (
    <div className="pos-products-grid">
      {products.map((product) => (
        <div
          key={product.id}
          className="pos-product-card"
          onClick={() => handleAddToCart && handleAddToCart(product)}
          style={{ cursor: "pointer" }}
        >
          {/* Image Container */}
          <div className="pos-product-img-box">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="pos-product-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className="pos-product-placeholder"
              style={{ display: product.imageUrl ? "none" : "flex" }}
            >
              <span>{product.name?.charAt(0) || "P"}</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="pos-product-details">
            <h4 className="pos-product-title" title={product.name}>
              {product.name}
            </h4>
            <div className="pos-product-sku">
              SKU: {product.sku || product.code || "N/A"}
            </div>
            <div className="pos-product-price">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          {/* Card Footer Row: Stock & Add Button */}
          <div className="pos-product-card-footer">
            <span className="pos-product-stock">
              Stock: <strong>{product.stock ?? product.available ?? 0}</strong>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (handleAddToCart) handleAddToCart(product);
              }}
              className="pos-add-to-cart-btn"
              title="Add to Cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <IconPlus />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
