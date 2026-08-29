"use client";

import { useEffect, useState } from "react";
import { getCustomers, createCustomer } from "@/services/customerService";
import { laundryService } from "@/services/laundryService";
import { showSuccess, showError, showWarning } from "@/utils/swal";
import {
  FiUsers,
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCreditCard,
  FiPrinter,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from "react-icons/fi";

const GARMENT_TYPES = ["Shirt", "Pant", "Suit", "Saree", "Blanket", "Dress", "T-Shirt", "Jacket", "Other"];

export default function LaundryPOS() {
  const [loading, setLoading] = useState(true);
  const [laundries, setLaundries] = useState([]);
  const [selectedLaundryId, setSelectedLaundryId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");

  // POS CART STATE
  const [cart, setCart] = useState([]);
  const [discountVal, setDiscountVal] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // 5% default tax
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(0);

  // Modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // New customer inputs
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  // New item inputs (selection state)
  const [selGarment, setSelGarment] = useState("Shirt");
  const [selServiceId, setSelServiceId] = useState("");
  const [selQty, setSelQty] = useState(1);
  const [selNotes, setSelNotes] = useState("");
  const [customGarment, setCustomGarment] = useState("");

  useEffect(() => {
    fetchInitData();
  }, []);

  useEffect(() => {
    if (selectedLaundryId) {
      fetchServicesData(selectedLaundryId);
    }
  }, [selectedLaundryId]);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      const [lndRes, custRes] = await Promise.all([
        laundryService.getLaundries(),
        getCustomers(),
      ]);

      const lndList = lndRes.data || [];
      setLaundries(lndList);
      if (lndList.length > 0) {
        setSelectedLaundryId(lndList[0].id);
      }

      const rawCustList = Array.isArray(custRes?.data) ? custRes.data : Array.isArray(custRes) ? custRes : [];
      let walkInCust = rawCustList.find(c => c.name?.toLowerCase().includes("walk-in"));
      
      // If Walk-in Customer doesn't exist in DB, create one so it has a valid DB UUID
      if (!walkInCust) {
        try {
          const createdWalkIn = await createCustomer({
            name: "Walk-in Customer",
            phone: "0000000000",
            email: "walkin@laundry.local",
            address: "Counter Outlet"
          });
          if (createdWalkIn && (createdWalkIn.id || createdWalkIn.data?.id)) {
            walkInCust = createdWalkIn.data || createdWalkIn;
            rawCustList.unshift(walkInCust);
          }
        } catch (e) {
          // Soft fallback
        }
      }

      const formattedList = rawCustList.map(c => ({
        id: c.id,
        name: c.name?.toLowerCase().includes("walk-in") ? `🚶 ${c.name}` : c.name,
        phone: c.phone || "N/A"
      }));

      setCustomers(formattedList);
      if (walkInCust?.id) {
        setSelectedCustomerId(walkInCust.id);
      } else if (formattedList.length > 0) {
        setSelectedCustomerId(formattedList[0].id);
      }
    } catch (err) {
      console.error("Error loading initial Laundry POS data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesData = async (laundryId) => {
    try {
      const [catRes, serRes] = await Promise.all([
        laundryService.getCategories(laundryId),
        laundryService.getServices(laundryId),
      ]);
      setCategories(catRes.data || []);
      const serviceList = serRes.data || [];
      setServices(serviceList);
      if (serviceList.length > 0) {
        setSelServiceId(serviceList[0].id);
      }
    } catch (err) {
      console.error("Error fetching services for laundry outlet:", err);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      showWarning("Required Fields", "Please enter customer name and phone.");
      return;
    }

    try {
      const res = await createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        email: newCustEmail?.trim() || null,
        address: ""
      });
      if (res) {
        // reload customer list
        const custRes = await getCustomers();
        const updatedList = Array.isArray(custRes?.data) ? custRes.data : Array.isArray(custRes) ? custRes : [];
        setCustomers(updatedList);
        // find created customer and select them
        const matched = updatedList.find(c => c.phone === newCustPhone.trim()) || res.data || res;
        if (matched?.id) {
          setSelectedCustomerId(matched.id);
        }
        setShowAddCustomerModal(false);
        setNewCustName("");
        setNewCustPhone("");
        setNewCustEmail("");
        showSuccess("Customer Added", "Customer created successfully!");
      }
    } catch (err) {
      showError("Customer Error", "Failed to create customer: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddToCart = () => {
    if (!selServiceId) {
      showWarning("Service Required", "Please select a laundry service.");
      return;
    }
    const service = services.find(s => s.id === selServiceId);
    if (!service) {
      showWarning("Invalid Service", "The chosen service was not found.");
      return;
    }

    const garmentName = selGarment === "Other" ? (customGarment.trim() || "Other Garment") : selGarment;
    const quantity = Math.max(1, parseInt(selQty) || 1);
    const unitPrice = parseFloat(service.price) || 0;
    const itemTotal = quantity * unitPrice;

    const existingIndex = cart.findIndex(
      item => item.serviceId === selServiceId && item.garmentType === garmentName
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].totalAmount = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      if (selNotes) {
        updated[existingIndex].specialInstructions = selNotes;
        updated[existingIndex].notes = selNotes;
      }
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          serviceId: selServiceId,
          serviceName: service.name,
          garmentType: garmentName,
          quantity,
          unitPrice,
          totalAmount: itemTotal,
          specialInstructions: selNotes || "",
          notes: selNotes || "",
        }
      ]);
    }
    // reset selection
    setSelQty(1);
    setSelNotes("");
    setCustomGarment("");
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartQty = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty < 1) return;
    updated[index].quantity = newQty;
    updated[index].totalAmount = newQty * updated[index].unitPrice;
    setCart(updated);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  const discountAmount = Number(discountVal) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = parseFloat((taxableAmount * ((Number(taxRate) || 0) / 100)).toFixed(2));
  const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

  const handleCheckoutSubmit = async () => {
    if (!selectedCustomerId) {
      showWarning("Customer Required", "Please select a valid customer for this order.");
      return;
    }
    if (!selectedLaundryId) {
      showWarning("Outlet Required", "Please ensure a laundry outlet profile is selected.");
      return;
    }
    if (cart.length === 0) {
      showWarning("Cart Empty", "Please add at least one garment to the cart before checkout.");
      return;
    }

    // Validate each item
    for (let idx = 0; idx < cart.length; idx++) {
      const item = cart[idx];
      if (!item.serviceId) {
        showWarning("Invalid Item", `Item #${idx + 1} (${item.garmentType}) is missing a valid service ID.`);
        return;
      }
      if (!item.garmentType) {
        showWarning("Invalid Item", `Item #${idx + 1} is missing a garment type.`);
        return;
      }
      if (Number(item.quantity) < 1) {
        showWarning("Invalid Quantity", `Quantity for ${item.garmentType} must be at least 1.`);
        return;
      }
    }

    const currentLaundry = laundries.find(l => l.id === selectedLaundryId);
    const numSubtotal = Number(subtotal.toFixed(2));
    const numDiscount = Number(discountAmount.toFixed(2));
    const numTax = Number(taxAmount.toFixed(2));
    const numTotal = Number(totalAmount.toFixed(2));
    const numPaid = Number((Number(paidAmount) || 0).toFixed(2));

    const payload = {
      laundryId: selectedLaundryId,
      branchId: currentLaundry?.branchId || null,
      customerId: selectedCustomerId,
      subtotal: numSubtotal,
      discountAmount: numDiscount,
      taxAmount: numTax,
      totalAmount: numTotal,
      paidAmount: numPaid,
      specialInstructions: notes || "",
      items: cart.map(i => ({
        serviceId: i.serviceId,
        garmentType: i.garmentType,
        quantity: parseInt(i.quantity),
        unitPrice: parseFloat(Number(i.unitPrice).toFixed(2)),
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: parseFloat(Number(i.totalAmount || (i.quantity * i.unitPrice)).toFixed(2)),
        notes: i.specialInstructions || i.notes || ""
      })),
      payment: numPaid > 0 ? {
        method: paymentMethod || "CASH",
        amount: numPaid,
      } : null,
    };

    console.log("Submitting Laundry Order Payload:", payload);

    try {
      const res = await laundryService.createOrder(payload);
      if (res.success || res.data || res.id) {
        const orderRecord = res.data || res;
        setCreatedOrder(orderRecord);
        setCheckoutSuccess(true);
        // Clear POS state
        setCart([]);
        setDiscountVal(0);
        setNotes("");
        setPaidAmount(0);
        showSuccess("Order Placed", `Laundry order #${orderRecord.orderNumber || "CONFIRMED"} created successfully!`);
      } else {
        showError("Checkout Failed", res.message || "Failed to create laundry order.");
      }
    } catch (err) {
      console.error("Laundry Checkout Error Response:", err.response?.data || err);
      const backendError =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.map(e => e.msg).join(", ")
          : null) ||
        err.message ||
        "Checkout failed. Please check the order details and try again.";
      showError("Checkout Failed", backendError);
    }
  };

  const currentCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* LEFT COLUMN: BUILD ORDER */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* LAUNDRY & CUSTOMER SELECTOR */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>1. Setup Laundry Outlet & Customer</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            
            {/* Laundry Profile (Auto Selected & Hidden) */}
            <div style={{ display: "none" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>LAUNDRY PROFILE</label>
              <select 
                value={selectedLaundryId}
                onChange={(e) => setSelectedLaundryId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                {laundries.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.branch?.name || "No branch"})</option>
                ))}
              </select>
            </div>

            {/* Customer Search & Link */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>LINK CUSTOMER</label>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}
                >
                  + NEW CUSTOMER
                </button>
              </div>
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* GARMENT & SERVICE CONFIGURATION */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>2. Add Garments & Choose Services</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: "16px", marginBottom: "16px" }}>
            {/* Garment selector */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>GARMENT TYPE</label>
              <select 
                value={selGarment}
                onChange={(e) => setSelGarment(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                {GARMENT_TYPES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {selGarment === "Other" && (
                <input
                  type="text"
                  placeholder="Enter garment type..."
                  value={customGarment}
                  onChange={(e) => setCustomGarment(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "8px" }}
                />
              )}
            </div>

            {/* Service selector */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>SERVICE REQUESTED</label>
              <select 
                value={selServiceId}
                onChange={(e) => setSelServiceId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>QUANTITY</label>
              <input 
                type="number"
                min="1"
                value={selQty}
                onChange={(e) => setSelQty(parseInt(e.target.value) || 1)}
                style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>SPECIAL INSTRUCTIONS FOR THIS GARMENT</label>
            <input 
              type="text"
              placeholder="Collars stain, dry clean only, etc."
              value={selNotes}
              onChange={(e) => setSelNotes(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <button 
            onClick={handleAddToCart}
            style={{
              width: "100%",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37,99,235,0.2)"
            }}
          >
            Add Garment to Cart
          </button>
        </div>

        {/* CART LIST */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", flexGrow: 1 }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0" }}>Cart Items ({cart.length})</h2>
          
          {cart.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              <FiShoppingBag size={32} style={{ marginBottom: "12px" }} />
              <p>Your laundry cart is empty. Choose garments above to begin.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#1e293b" }}>{item.garmentType}</span>
                    <span style={{ margin: "0 8px", color: "#94a3b8" }}>|</span>
                    <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: "600" }}>{item.serviceName}</span>
                    {item.notes && <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>Note: {item.notes}</p>}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "4px 8px" }}>
                      <button onClick={() => updateCartQty(index, -1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><FiMinus size={12} /></button>
                      <span style={{ fontWeight: "700", color: "#334155", minWidth: "16px", textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(index, 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><FiPlus size={12} /></button>
                    </div>
                    <span style={{ fontWeight: "800", color: "#0f172a", minWidth: "60px", textAlign: "right" }}>${item.totalAmount.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(index)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: SUMMARY & PAYMENTS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* SUMMARY CARD */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", position: "sticky", top: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0" }}>Order Summary</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: "700" }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569" }}>Discount ($):</span>
              <input 
                type="number"
                min="0"
                value={discountVal}
                onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                style={{ width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "700" }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>Tax ({taxRate}%):</span>
              <span style={{ fontWeight: "700" }}>${taxAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>SPECIAL ORDER INSTRUCTIONS</label>
              <textarea 
                placeholder="Overall order instructions..."
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "none" }}
              />
            </div>
          </div>

          {/* TOTAL */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "24px" }}>
            <span>Total Amount:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          {/* PAYMENT INPUT */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px 0" }}>Payment Collection</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>METHOD</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD / VISA</option>
                  <option value="BANK">UPI / BANK</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>AMOUNT PAID</label>
                <input 
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "700" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#ef4444" }}>
              <span>Balance Due:</span>
              <span>${Math.max(0, totalAmount - paidAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <button 
            onClick={() => setShowCheckoutModal(true)}
            style={{
              width: "100%",
              background: "#16a34a",
              color: "#ffffff",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(22,163,74,0.2)"
            }}
          >
            Confirm & Place Order
          </button>

        </div>

      </div>

      {/* CHECKOUT CONFIRMATION MODAL */}
      {showCheckoutModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            {!checkoutSuccess ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <FiInfo size={48} style={{ color: "#2563eb", marginBottom: "16px" }} />
                  <h2 style={{ margin: "0 0 8px 0" }}>Confirm Order placement</h2>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Are you sure you want to register this laundry order for <strong>{currentCustomer?.name || "Unselected Customer"}</strong>?</p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
                  <button onClick={handleCheckoutSubmit} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}>Confirm Checkout</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <FiCheckCircle size={48} style={{ color: "#16a34a", marginBottom: "16px" }} />
                  <h2 style={{ margin: "0 0 8px 0", color: "#16a34a" }}>Order Placed Successfully!</h2>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Order number: <strong>{createdOrder?.orderNumber}</strong> has been generated.</p>
                </div>

                {/* Tags Details */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>GARMENT TAG BARCODES GENERATED</span>
                  {createdOrder?.items?.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span>{item.garmentType} ({item.service?.name})</span>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#2563eb" }}>{createdOrder.orderNumber}-[001...{item.quantity}]</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #2563eb", color: "#2563eb", background: "none", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <FiPrinter /> Print Receipt & Tags
                  </button>
                  <button 
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setCheckoutSuccess(false);
                      setCreatedOrder(null);
                    }}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}
                  >
                    Close POS
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
          <form onSubmit={handleCreateCustomer} style={{ background: "#ffffff", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "700" }}>Register New Customer</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>FULL NAME *</label>
                <input 
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>PHONE NUMBER *</label>
                <input 
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>EMAIL ADDRESS</label>
                <input 
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#ffffff", cursor: "pointer", fontWeight: "700" }}>Create Customer</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
