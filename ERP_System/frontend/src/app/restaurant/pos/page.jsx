"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { restaurantService } from "@/services/restaurantService";
import { getCustomers } from "@/services/customerService";
import { getWarehouses } from "@/services/warehouseService";
import {
  FiCoffee,
  FiShoppingBag,
  FiUser,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiPrinter,
  FiCreditCard,
  FiAlertTriangle,
} from "react-icons/fi";

function RestaurantPOSContent() {
  const searchParams = useSearchParams();
  const initialTableId = searchParams.get("tableId") || "";

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  // POS State
  const [orderType, setOrderType] = useState("DINE_IN");
  const [selectedTableId, setSelectedTableId] = useState(initialTableId);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");

  // Existing order state if table selected
  const [activeOrder, setActiveOrder] = useState(null);

  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  useEffect(() => {
    fetchPOSData();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuData(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (selectedTableId && orderType === "DINE_IN") {
      const tbl = tables.find((t) => t.id === selectedTableId);
      if (tbl && tbl.orders && tbl.orders.length > 0) {
        const order = tbl.orders[0];
        setActiveOrder(order);
        if (order.items) {
          setCart(
            order.items.map((i) => ({
              menuItemId: i.menuItemId,
              name: i.menuItem?.name || "Item",
              unitPrice: parseFloat(i.unitPrice),
              quantity: i.quantity,
              notes: i.notes || "",
            }))
          );
        }
      } else {
        setActiveOrder(null);
      }
    }
  }, [selectedTableId, tables, orderType]);

  const fetchPOSData = async () => {
    try {
      setLoading(true);
      const [restRes, custRes, whRes] = await Promise.all([
        restaurantService.getRestaurants(),
        getCustomers(),
        getWarehouses(),
      ]);

      const restList = restRes.data || [];
      setRestaurants(restList);
      if (restList.length > 0) {
        setSelectedRestaurantId(restList[0].id);
      }

      setCustomers(custRes.data || custRes || []);
      const whList = whRes.data || [];
      setWarehouses(whList);
      if (whList.length > 0) {
        setSelectedWarehouseId(whList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async (restaurantId) => {
    try {
      const [catRes, itemRes, tblRes] = await Promise.all([
        restaurantService.getMenuCategories(restaurantId),
        restaurantService.getMenuItems(restaurantId),
        restaurantService.getTables(restaurantId),
      ]);
      setCategories(catRes.data || []);
      setMenuItems(itemRes.data || []);
      setTables(tblRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          unitPrice: parseFloat(item.sellingPrice),
          quantity: 1,
          notes: "",
        },
      ];
    });
  };

  const handleUpdateQty = (menuItemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  // Total Calculations
  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = subtotal * 0.05; // Default 5% tax if applicable
  const totalAmount = Math.max(0, subtotal - parseFloat(discountAmount || 0) + taxAmount);

  // Send KOT Action
  const handleSendKOT = async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (orderType === "DINE_IN" && !selectedTableId) {
      alert("Please select a table for Dine-In.");
      return;
    }

    try {
      const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
      const branchId = selectedRest?.branchId;

      let orderId = activeOrder?.id;

      if (!orderId) {
        const createRes = await restaurantService.createOrder({
          restaurantId: selectedRestaurantId,
          branchId,
          tableId: orderType === "DINE_IN" ? selectedTableId : null,
          customerId: selectedCustomerId || null,
          orderType,
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes,
        });
        orderId = createRes.data?.id;
      }

      // Check & Confirm Order, send KOT, deduct inventory
      const confirmRes = await restaurantService.confirmOrderAndSendKOT(orderId, selectedWarehouseId, false);
      alert(`KOT Generated: ${confirmRes.data?.kot?.kotNumber}. Stock deducted according to recipe.`);
      
      // Reload menu & tables
      loadMenuData(selectedRestaurantId);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg.includes("Insufficient stock")) {
        if (confirm(`${errorMsg}\nDo you want to override stock warning and proceed?`)) {
          try {
            const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
            let orderId = activeOrder?.id;
            if (!orderId) {
              const createRes = await restaurantService.createOrder({
                restaurantId: selectedRestaurantId,
                branchId: selectedRest?.branchId,
                tableId: orderType === "DINE_IN" ? selectedTableId : null,
                customerId: selectedCustomerId || null,
                orderType,
                items: cart,
                subtotal,
                discountAmount: parseFloat(discountAmount || 0),
                taxAmount,
                totalAmount,
                notes,
              });
              orderId = createRes.data?.id;
            }
            await restaurantService.confirmOrderAndSendKOT(orderId, selectedWarehouseId, true);
            alert("KOT Generated with stock override.");
            loadMenuData(selectedRestaurantId);
          } catch (e) {
            alert(e.message);
          }
        }
      } else {
        alert(errorMsg);
      }
    }
  };

  // Complete & Process Payment Action
  const handleProcessPayment = async () => {
    if (!activeOrder && cart.length === 0) {
      alert("No order to process.");
      return;
    }

    try {
      let orderId = activeOrder?.id;
      if (!orderId) {
        const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
        const createRes = await restaurantService.createOrder({
          restaurantId: selectedRestaurantId,
          branchId: selectedRest?.branchId,
          tableId: orderType === "DINE_IN" ? selectedTableId : null,
          customerId: selectedCustomerId || null,
          orderType,
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes,
        });
        orderId = createRes.data?.id;

        // Auto confirm if not already confirmed
        await restaurantService.confirmOrderAndSendKOT(orderId, selectedWarehouseId, true);
      }

      await restaurantService.completeOrder(orderId, {
        amount: totalAmount,
        method: paymentMethod,
      });

      alert("Order completed & payment processed!");
      setShowPayModal(false);
      setCart([]);
      setActiveOrder(null);
      setSelectedTableId("");
      loadMenuData(selectedRestaurantId);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const filteredMenuItems = menuItems.filter((i) => {
    const matchesCat = activeCategoryId === "ALL" || i.categoryId === activeCategoryId;
    const matchesSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Restaurant POS...</div>;
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", backgroundColor: "#f8fafc", overflow: "hidden" }}>
      {/* LEFT & CENTER PANEL: Menu & Items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
        {/* Top Control Bar */}
        <div style={{ padding: "16px 20px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Order Type Selector */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
            {["DINE_IN", "TAKEAWAY", "DELIVERY"].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  backgroundColor: orderType === type ? "#2563eb" : "transparent",
                  color: orderType === type ? "#fff" : "#475569",
                }}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Table Picker if DINE_IN */}
          {orderType === "DINE_IN" && (
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            >
              <option value="">Select Table...</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableNumber} ({t.status})
                </option>
              ))}
            </select>
          )}

          {/* Customer Picker with Loyalty ID */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.loyaltyId ? `[Loyalty ID: ${c.loyaltyId}]` : c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
            {selectedCustomerId && (() => {
              const cust = customers.find((c) => c.id === selectedCustomerId);
              return cust?.loyaltyId ? (
                <span style={{ fontSize: "12px", background: "#e0e7ff", color: "#3730a3", padding: "6px 10px", borderRadius: "6px", fontWeight: "700" }}>
                  💳 Loyalty: {cust.loyaltyId}
                </span>
              ) : null;
            })()}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search menu dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: "8px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
        </div>

        {/* Categories Pills */}
        <div style={{ padding: "12px 20px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "10px", overflowX: "auto" }}>
          <button
            onClick={() => setActiveCategoryId("ALL")}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              backgroundColor: activeCategoryId === "ALL" ? "#0f172a" : "#f1f5f9",
              color: activeCategoryId === "ALL" ? "#fff" : "#475569",
              whiteSpace: "nowrap",
            }}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                backgroundColor: activeCategoryId === cat.id ? "#0f172a" : "#f1f5f9",
                color: activeCategoryId === cat.id ? "#fff" : "#475569",
                whiteSpace: "nowrap",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", alignContent: "start" }}>
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddToCart(item)}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                transition: "transform 0.1s ease",
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{item.category?.name}</div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#059669" }}>₹{parseFloat(item.sellingPrice).toFixed(2)}</span>
                <span style={{ backgroundColor: "#2563eb", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiPlus size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Current Cart & Checkout */}
      <div style={{ width: "420px", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Cart Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Current Order</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              {orderType} {selectedTableId ? `(Table ${tables.find((t) => t.id === selectedTableId)?.tableNumber})` : ""}
            </span>
          </div>
          <button onClick={() => setCart([])} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>
            Clear Cart
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", margin: "auto" }}>Cart is empty. Tap dishes to add.</p>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{item.name}</div>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>₹{item.unitPrice.toFixed(2)} each</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => handleUpdateQty(item.menuItemId, -1)} style={{ padding: "4px 8px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px" }}>-</button>
                    <span style={{ fontWeight: "700", fontSize: "14px" }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.menuItemId, 1)} style={{ padding: "4px 8px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px" }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Actions */}
        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569", marginBottom: "6px" }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569", marginBottom: "6px" }}>
            <span>Tax (5%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #cbd5e1" }}>
            <span>Total</span>
            <span style={{ color: "#059669" }}>₹{totalAmount.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={handleSendKOT}
              disabled={cart.length === 0}
              style={{
                padding: "12px",
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <FiSend /> Send KOT
            </button>

            <button
              onClick={() => setShowPayModal(true)}
              disabled={cart.length === 0 && !activeOrder}
              style={{
                padding: "12px",
                backgroundColor: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: cart.length === 0 && !activeOrder ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <FiCreditCard /> Pay & Bill
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "700" }}>Complete Order & Payment</h3>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669", marginBottom: "20px" }}>
              Total Payable: ₹{totalAmount.toFixed(2)}
            </div>

            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Select Payment Method</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
              {["CASH", "CARD", "BANK", "WALLET"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: paymentMethod === method ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    backgroundColor: paymentMethod === method ? "#eff6ff" : "#fff",
                    color: paymentMethod === method ? "#1e40af" : "#334155",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowPayModal(false)} style={{ padding: "10px 18px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                Cancel
              </button>
              <button onClick={handleProcessPayment} style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700" }}>
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantPOSPage() {
  return (
    <Suspense fallback={<div style={{ padding: "32px", textAlign: "center" }}>Loading POS...</div>}>
      <RestaurantPOSContent />
    </Suspense>
  );
}
