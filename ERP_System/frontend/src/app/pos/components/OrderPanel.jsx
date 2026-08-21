"use client";

import { useState } from "react";
import {
  IconUser,
  IconSearch,
  IconPlus,
  IconMinus,
  IconTrash,
  IconChevronDown,
  IconCash,
  IconCard,
  IconUPI,
  IconBank,
  IconCredit,
  IconWallet,
  IconMoney,
  IconHold,
  IconSave,
  IconPrint,
  IconCheck,
  IconClose,
} from "./icons";

const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash", icon: IconCash },
  { id: "Card", label: "Card", icon: IconCard },
  { id: "UPI", label: "UPI", icon: IconUPI },
  { id: "Bank Transfer", label: "Bank Transfer", icon: IconBank },
  { id: "Credit", label: "Credit", icon: IconCredit },
  { id: "Wallet", label: "Wallet", icon: IconWallet },
];

export default function OrderPanel({
  cart = [],
  removeItem,
  onRemoveItem,
  clearCart,
  onClearCart,
  updateQuantity,
  onUpdateQty,
  customer = "",
  setCustomer,
  onCustomerChange,
  customers = [],
  onAddCustomer,
  discountValue = 0,
  setDiscountValue,
  onDiscountChange,
  taxRate,
  activeTaxRate,
  shipping = 0,
  otherCharges = 0,
  amountReceived = 0,
  setAmountReceived,
  onAmountReceivedChange,
  selectedPayment = "Cash",
  setSelectedPayment,
  onSelectPayment,
  onCompleteSale,
  onHoldSale,
  onSaveDraft,
  onPrintReceipt,
  activeTab,
  setActiveTab,
  heldDrafts = [],
  onRestoreDraft,
  onDeleteDraft,
}) {
  const [customerSearch, setCustomerSearch] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [modalErrors, setModalErrors] = useState({});

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!newCustomerName.trim()) errors.name = "Name is required";
    if (!newCustomerPhone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    onAddCustomer?.({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      email: newCustomerEmail.trim()
    });

    // Reset & Close
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setModalErrors({});
    setShowAddCustomerModal(false);
  };

  const handleRemove = removeItem || onRemoveItem;
  const handleClear = clearCart || onClearCart;
  const handleUpdateQty = updateQuantity || onUpdateQty;
  const handleCustomerChange = onCustomerChange || setCustomer;
  const handleDiscountChange = onDiscountChange || setDiscountValue;
  const handleAmountReceivedChange = onAmountReceivedChange || setAmountReceived;
  const handleSelectPayment = onSelectPayment || setSelectedPayment;
  const effectiveTaxRate = taxRate ?? activeTaxRate ?? 10;

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = Number(discountValue) || 0;
  const taxAmount = (subtotal - discountAmount) * (effectiveTaxRate / 100);
  const grandTotal = Math.max(
    0,
    subtotal - discountAmount + (taxAmount > 0 ? taxAmount : 0) + Number(shipping) + Number(otherCharges)
  );

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const uniqueItemsCount = cart.length;

  const changeAmount = Math.max(0, Number(amountReceived) - grandTotal);

  return (
    <div className="pos-order-panel">
      {/* 1. Customer Section */}
      <div className="pos-customer-section">
        <h3 className="pos-section-title">Customer</h3>
        <div className="pos-customer-row">
          <div className="pos-customer-select-box">
            <IconUser className="pos-customer-icon" />
            <select
              className="pos-customer-dropdown"
              value={customer}
              onChange={(e) => handleCustomerChange?.(e.target.value)}
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
            <IconChevronDown className="pos-select-arrow" />
          </div>

          <button
            className="pos-customer-action-btn"
            title="Search Customer"
            onClick={() => setCustomerSearch((prev) => !prev)}
          >
            <IconSearch />
          </button>

          <button
            className="pos-customer-action-btn primary"
            title="Add Customer"
            onClick={() => setShowAddCustomerModal(true)}
          >
            <IconPlus />
          </button>
        </div>
      </div>


      {/* 2. Cart Table */}
      <div className="pos-cart-table-wrapper">
        <table className="pos-cart-table">
          <thead>
            <tr>
              <th style={{ width: "24px" }}>#</th>
              <th>Product</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Discount</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={7} className="pos-cart-empty-td">
                  No items in cart
                </td>
              </tr>
            ) : (
              cart.map((item, index) => {
                const itemTotal = item.price * item.qty;
                return (
                  <tr key={item.cartId || item.id}>
                    <td className="pos-cart-row-num">{index + 1}</td>
                    <td>
                      <div className="pos-cart-product-cell">
                        <div className="pos-cart-thumb-wrapper">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <span>{item.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="pos-cart-product-info">
                          <div className="pos-cart-product-title">{item.name}</div>
                          <div className="pos-cart-product-sku">
                            SKU: {item.sku || item.code || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹{Number(item.price).toFixed(2)}
                    </td>
                    <td>
                      <div className="pos-qty-controls">
                        <button
                          className="pos-qty-btn"
                          onClick={() => handleUpdateQty?.(item.cartId || item.id, item.qty - 1)}
                        >
                          <IconMinus />
                        </button>
                        <span className="pos-qty-val">{item.qty}</span>
                        <button
                          className="pos-qty-btn"
                          onClick={() => handleUpdateQty?.(item.cartId || item.id, item.qty + 1)}
                        >
                          <IconPlus />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>₹0.00</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{itemTotal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="pos-cart-delete-btn"
                        onClick={() => handleRemove?.(item.cartId || item.id)}
                        title="Remove item"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cart Footer Row: Clear Cart + Total Items */}
      <div className="pos-cart-footer-bar">
        <button className="pos-clear-cart-btn" onClick={handleClear}>
          <IconTrash />
          Clear Cart
        </button>
        <div className="pos-total-items-badge">
          Total Items: <strong>{totalCount} ({uniqueItemsCount})</strong>
        </div>
      </div>

      {/* 3. Lower Section: Order Summary & Payment Method */}
      <div className="pos-lower-grid">
        {/* Order Summary Card */}
        <div className="pos-summary-card">
          <h3 className="pos-section-title">Order Summary</h3>
          <div className="pos-summary-list">
            <div className="pos-summary-row">
              <span>Subtotal</span>
              <span className="pos-summary-val">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="pos-summary-row">
              <span>Discount</span>
              <div className="pos-discount-input-box">
                <span className="pos-currency-symbol">₹</span>
                <input
                  type="number"
                  className="pos-summary-input"
                  value={discountValue}
                  onChange={(e) => handleDiscountChange?.(e.target.value)}
                />
              </div>
            </div>

            <div className="pos-summary-row">
              <span>Tax (VAT {effectiveTaxRate}%)</span>
              <span className="pos-summary-val">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="pos-summary-row">
              <span>Shipping</span>
              <span className="pos-summary-val">₹{Number(shipping).toFixed(2)}</span>
            </div>

            <div className="pos-summary-row">
              <span>Other Charges</span>
              <span className="pos-summary-val">₹{Number(otherCharges).toFixed(2)}</span>
            </div>

            <div className="pos-summary-divider" />

            <div className="pos-summary-row grand-total">
              <span>Grand Total</span>
              <span className="pos-grand-total-val">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="pos-payment-card">
          <h3 className="pos-section-title">Payment Method</h3>
          <div className="pos-payment-grid">
            {PAYMENT_METHODS.filter((pm) => {
              if (pm.id === "Credit") {
                return customer !== "";
              }
              return true;
            }).map((pm) => {
              const IconComp = pm.icon;
              const isSelected = selectedPayment === pm.id;
              return (
                <button
                  key={pm.id}
                  className={`pos-payment-chip ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectPayment?.(pm.id)}
                >
                  <IconComp className="pos-payment-icon" />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pos-amount-received-row">
            <span className="pos-label-text">Amount Received</span>
            <div className="pos-amount-input-box">
              <IconMoney className="pos-input-icon" />
              <input
                type="number"
                className="pos-amount-input"
                value={amountReceived}
                onChange={(e) => handleAmountReceivedChange?.(e.target.value)}
              />
            </div>
          </div>

          <div className="pos-change-row">
            <span className="pos-label-text">Change</span>
            <div className="pos-change-pill">
              ₹{changeAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Action Buttons */}
      <div className="pos-bottom-actions-row">
        <button className="pos-action-btn hold" onClick={onHoldSale}>
          <IconHold />
          <span>Bill Hold</span>
        </button>

        <button className="pos-action-btn draft" onClick={onSaveDraft}>
          <IconSave />
          <span>Save Draft</span>
        </button>

        <button className="pos-action-btn print" onClick={onPrintReceipt}>
          <IconPrint />
          <span>Print Receipt</span>
        </button>

        <button className="pos-action-btn complete" onClick={onCompleteSale}>
          <IconCheck />
          <span>Complete Sale</span>
        </button>
      </div>

      {showAddCustomerModal && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-card">
            <div className="pos-modal-header">
              <h3>Add New Customer</h3>
              <button 
                className="pos-modal-close-btn"
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setModalErrors({});
                }}
              >
                <IconClose />
              </button>
            </div>
            
            <div className="pos-modal-body">
              <form onSubmit={handleModalSubmit}>
                <div className="pos-form-group">
                  <label>Customer Name <span>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className={`pos-form-input ${modalErrors.name ? "error" : ""}`}
                  />
                  {modalErrors.name && <span className="pos-input-error-msg">{modalErrors.name}</span>}
                </div>

                <div className="pos-form-group">
                  <label>Phone Number <span>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className={`pos-form-input ${modalErrors.phone ? "error" : ""}`}
                  />
                  {modalErrors.phone && <span className="pos-input-error-msg">{modalErrors.phone}</span>}
                </div>

                <div className="pos-form-group">
                  <label>Email Address <span>(Optional)</span></label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="pos-form-input"
                  />
                </div>

                <div className="pos-modal-actions">
                  <button 
                    type="button" 
                    className="pos-modal-btn cancel"
                    onClick={() => {
                      setShowAddCustomerModal(false);
                      setModalErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="pos-modal-btn submit">
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
