"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { restaurantService } from "@/services/restaurantService";
import { getCustomers } from "@/services/customerService";
import { useCompany } from "@/context/CompanyContext";
import Swal, { showSuccess, showError, showWarning, showConfirm, showToastNotification } from "@/utils/swal";
import { joinOutletRoom, leaveOutletRoom, subscribeToOrderStatus, subscribeToReconnect } from "@/services/socketService";
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
  FiClock,
  FiList,
  FiPauseCircle,
  FiPlay,
  FiX,
  FiCheck,
  FiBell,
} from "react-icons/fi";

function RestaurantPOSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTableId = searchParams.get("tableId") || "";

  const { user } = useCompany();
  const roleStr = String(user?.role || user?.roleRef?.name || user?.type || "").toUpperCase();
  const isWaiter = roleStr.includes("WAITER") || roleStr.includes("STEWARD") || roleStr.includes("SERVER");
  const isCashier = roleStr.includes("CASHIER") || roleStr.includes("BILLING") || roleStr.includes("COUNTER");
  const isAdmin = roleStr.includes("SUPER") || roleStr.includes("ADMIN") || roleStr.includes("OWNER") || roleStr.includes("MANAGER");

  const canDoBilling = (isCashier || isAdmin) && !isWaiter;

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

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

  // Active Order State
  const [activeOrder, setActiveOrder] = useState(null);

  // Modals & Held Orders / Bills
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [showHeldModal, setShowHeldModal] = useState(false);
  const [heldOrders, setHeldOrders] = useState([]);

  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);
  const [heldBills, setHeldBills] = useState([]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
  const [historyTableFilter, setHistoryTableFilter] = useState("ALL");

  const [showReadyModal, setShowReadyModal] = useState(false);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);

  useEffect(() => {
    fetchPOSData();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuData(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  // Real-Time Order Status Update Listener (Socket.IO)
  useEffect(() => {
    if (!selectedRestaurantId) return;

    // Join authorized outlet room
    joinOutletRoom(selectedRestaurantId);

    // Listen for real-time status changes emitted by Kitchen Staff or Backend
    const unsubscribeStatus = subscribeToOrderStatus((data) => {
      console.log("⚡ [Waiter POS] Real-time order update received:", data);

      // Verify outlet matches assigned restaurant
      if (data.restaurantId && data.restaurantId !== selectedRestaurantId) {
        return;
      }

      // Automatically sync POS state (tables & active orders) without page refresh
      loadMenuData(selectedRestaurantId);

      // Update active order state dynamically if open
      if (data.orderId) {
        setActiveOrder((prev) => {
          if (prev && (prev.id === data.orderId || prev.orderNumber === data.orderNumber)) {
            return { ...prev, status: data.status };
          }
          return prev;
        });
      }

      // Trigger non-blocking SweetAlert2 toast notification when order becomes READY
      if (data.status === "READY") {
        const tblNum = data.tableNumber || (data.table ? data.table.tableNumber : "");
        const tableText = tblNum ? `Table ${tblNum}` : "Takeaway Order";
        showToastNotification(
          "🔔 Order Ready to Serve!",
          `${tableText} - Order #${data.orderNumber || ""} is ready to serve!`,
          "success"
        );
      }
    });

    // Handle auto-reconnection synchronization
    const unsubscribeReconnect = subscribeToReconnect(() => {
      console.log("🔄 Socket reconnected - resynchronizing active orders...");
      joinOutletRoom(selectedRestaurantId);
      loadMenuData(selectedRestaurantId);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeReconnect();
      leaveOutletRoom(selectedRestaurantId);
    };
  }, [selectedRestaurantId]);

  // Check whether current table order has unsaved changes
  const isCartDirty = () => {
    if (!selectedTableId || orderType !== "DINE_IN") return false;
    if (!activeOrder) {
      return cart.length > 0;
    }
    const origItems = (activeOrder.items || []).map((i) => ({
      menuItemId: i.menuItemId,
      quantity: Number(i.quantity),
      notes: i.notes || "",
    }));
    const currentItems = cart.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: Number(i.quantity),
      notes: i.notes || "",
    }));
    if (origItems.length !== currentItems.length) return true;
    return (
      JSON.stringify(origItems.sort((a, b) => a.menuItemId.localeCompare(b.menuItemId))) !==
      JSON.stringify(currentItems.sort((a, b) => a.menuItemId.localeCompare(b.menuItemId)))
    );
  };

  // Save / Hold current table order before switching if requested
  const saveCurrentTableOrderOnHold = async () => {
    if (cart.length === 0) return true;
    try {
      const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
      const branchId = selectedRest?.branchId;
      const holdNote = notes ? `${notes} | HELD` : "HELD";

      if (activeOrder?.id) {
        await restaurantService.updateOrder(activeOrder.id, {
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes: holdNote,
          status: activeOrder.status === "DRAFT" ? "HELD" : activeOrder.status,
        });
      } else {
        await restaurantService.createOrder({
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
          notes: holdNote,
          status: "HELD",
        });
      }
      showSuccess("Order Saved", "Current table order saved/held successfully.");
      await loadMenuData(selectedRestaurantId);
      return true;
    } catch (err) {
      showError("Failed to Save Order", err.response?.data?.message || err.message || "Failed to save order");
      return false;
    }
  };

  // Load Table Order: Clears previous table state and loads only the target table's active order or empty cart
  const loadTableOrder = (targetTableId, tableList = tables) => {
    // 1. Immediately reset current order state safely so no old cart items linger
    setSelectedTableId(targetTableId);
    setActiveOrder(null);
    setCart([]);
    setDiscountAmount(0);
    setNotes("");

    if (!targetTableId || orderType !== "DINE_IN") {
      return;
    }

    // 2. Look for existing active order for target table
    const tbl = (tableList || []).find((t) => t.id === targetTableId);
    const activeTableOrder = tbl?.orders?.find(
      (o) =>
        (!o.restaurantId || o.restaurantId === selectedRestaurantId) &&
        ["DRAFT", "HELD", "CONFIRMED", "PREPARING", "READY", "SERVED"].includes(o.status)
    );

    if (activeTableOrder) {
      // YES -> Load ONLY that table's existing active order/cart
      setActiveOrder(activeTableOrder);
      if (activeTableOrder.items && activeTableOrder.items.length > 0) {
        setCart(
          activeTableOrder.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.menuItem?.name || "Item",
            unitPrice: parseFloat(i.unitPrice),
            quantity: i.quantity,
            notes: i.notes || "",
          }))
        );
      } else {
        setCart([]);
      }
      setDiscountAmount(parseFloat(activeTableOrder.discountAmount || 0));
      setNotes(activeTableOrder.notes || "");
    } else {
      // NO -> Show empty cart
      setActiveOrder(null);
      setCart([]);
      setDiscountAmount(0);
      setNotes("");
    }
  };

  // Table Switching with Unsaved Cart Protection
  const handleTableChange = async (newTableId) => {
    if (newTableId === selectedTableId) return;

    // Check for unsaved changes on current table
    if (orderType === "DINE_IN" && selectedTableId && isCartDirty()) {
      const result = await Swal.fire({
        title: "Unsaved Order Changes",
        text: "You have unsaved items in the current table order. What would you like to do?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Save / Hold Order",
        denyButtonText: "Discard Changes",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        denyButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        const saved = await saveCurrentTableOrderOnHold();
        if (!saved) return;
      } else if (result.isDenied) {
        // Discard unsaved changes and proceed
      } else {
        // Cancel -> stay on current table
        return;
      }
    }

    loadTableOrder(newTableId);
  };

  // Order Type Switching with Unsaved Cart Protection
  const handleOrderTypeChange = async (newType) => {
    if (newType === orderType) return;

    if (orderType === "DINE_IN" && selectedTableId && isCartDirty()) {
      const result = await Swal.fire({
        title: "Unsaved Order Changes",
        text: "You have unsaved items in the current table order. What would you like to do?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Save / Hold Order",
        denyButtonText: "Discard Changes",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        denyButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        const saved = await saveCurrentTableOrderOnHold();
        if (!saved) return;
      } else if (result.isDenied) {
        // Discard
      } else {
        return;
      }
    }

    setOrderType(newType);
    if (newType !== "DINE_IN") {
      setSelectedTableId("");
      setActiveOrder(null);
      setCart([]);
      setDiscountAmount(0);
      setNotes("");
    }
  };

  // Load initial table order if tableId was provided via query param on mount
  useEffect(() => {
    if (initialTableId && tables.length > 0 && selectedTableId === initialTableId && !activeOrder && cart.length === 0) {
      loadTableOrder(initialTableId, tables);
    }
  }, [tables, initialTableId]);

  const fetchPOSData = async () => {
    try {
      setLoading(true);
      const [restRes, custRes] = await Promise.all([
        restaurantService.getRestaurants(),
        getCustomers(),
      ]);

      const restList = restRes.data || [];
      setRestaurants(restList);

      // Auto Outlet Assignment based on user logged in outlet or default
      if (restList.length > 0) {
        let assigned = restList[0].id;
        if (user?.restaurantId) {
          const match = restList.find((r) => r.id === user.restaurantId);
          if (match) assigned = match.id;
        } else if (user?.branchId) {
          const match = restList.find((r) => r.branchId === user.branchId);
          if (match) assigned = match.id;
        }
        setSelectedRestaurantId(assigned);
      }

      const rawCustList = custRes.data || custRes || [];
      setCustomers(rawCustList);
    } catch (err) {
      console.error("Error loading POS data:", err);
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
      console.error("Error loading menu data:", err);
    }
  };

  // Fetch Waiter Held Draft Orders
  const loadHeldOrders = async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await restaurantService.getOrders({
        restaurantId: selectedRestaurantId,
        status: "HELD",
      });
      setHeldOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching held orders:", err);
    }
  };

  // Fetch Cashier Held Bills
  const loadHeldBills = async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await restaurantService.getOrders({
        restaurantId: selectedRestaurantId,
        search: "BILL_ON_HOLD",
      });
      const uncompletedBills = (res.data || []).filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");
      setHeldBills(uncompletedBills);
    } catch (err) {
      console.error("Error fetching held bills:", err);
    }
  };

  // Fetch Order History
  const loadOrderHistory = async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await restaurantService.getOrders({
        restaurantId: selectedRestaurantId,
      });
      setHistoryOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching order history:", err);
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

  // Total Calculations
  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = subtotal * 0.05;
  const totalAmount = Math.max(0, subtotal - parseFloat(discountAmount || 0) + taxAmount);

  // 1. WAITER: Hold Order Action (Saves Draft before sending to Kitchen)
  const handleHoldOrder = async () => {
    if (cart.length === 0) {
      showWarning("Cart Empty", "Cart is empty. Add items before holding order.");
      return;
    }
    try {
      const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
      const branchId = selectedRest?.branchId;

      if (activeOrder?.id) {
        await restaurantService.updateOrder(activeOrder.id, {
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes,
          status: "HELD",
        });
      } else {
        await restaurantService.createOrder({
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
          status: "HELD",
        });
      }

      showSuccess("Order Held", "Order temporarily saved as HELD.");
      setCart([]);
      setActiveOrder(null);
      setSelectedTableId("");
      setNotes("");
      loadMenuData(selectedRestaurantId);
    } catch (err) {
      showError("Failed to Hold Order", err.response?.data?.message || err.message || "Failed to hold order");
    }
  };

  // CASHIER: Hold Bill Action (Pauses Payment, Keeps Table Occupied & Order Active)
  const handleHoldBill = async () => {
    if (!activeOrder && cart.length === 0) {
      showWarning("No Active Bill", "No active bill/order to hold.");
      return;
    }
    try {
      const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
      const holdNote = notes ? `${notes} | BILL_ON_HOLD` : "BILL_ON_HOLD";

      if (activeOrder?.id) {
        await restaurantService.updateOrder(activeOrder.id, {
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes: holdNote,
        });
      } else {
        await restaurantService.createOrder({
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
          notes: holdNote,
          status: "CONFIRMED",
        });
      }

      showSuccess("Bill On Hold", "Bill for table set to ON HOLD. Order remains active and table occupied.");
      setCart([]);
      setActiveOrder(null);
      setSelectedTableId("");
      setNotes("");
      loadMenuData(selectedRestaurantId);
    } catch (err) {
      showError("Failed to Hold Bill", err.response?.data?.message || err.message || "Failed to hold bill");
    }
  };

  // Resume Held Order or Held Bill
  const handleResumeHeldOrder = (heldOrder) => {
    setActiveOrder(heldOrder);
    setOrderType(heldOrder.orderType || "DINE_IN");
    if (heldOrder.tableId) setSelectedTableId(heldOrder.tableId);
    if (heldOrder.customerId) setSelectedCustomerId(heldOrder.customerId);
    if (heldOrder.items) {
      setCart(
        heldOrder.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.menuItem?.name || "Item",
          unitPrice: parseFloat(i.unitPrice),
          quantity: i.quantity,
          notes: i.notes || "",
        }))
      );
    }
    setShowHeldModal(false);
    setShowHeldBillsModal(false);
  };

  // Mark Order as Served
  const handleMarkServed = async (orderId) => {
    try {
      await restaurantService.updateOrder(orderId, { status: "SERVED" });
      showSuccess("Order Marked as Served", "Order status updated to SERVED. Stock deducted successfully.");
      loadMenuData(selectedRestaurantId);
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, status: "SERVED" } : null));
      }
    } catch (err) {
      showError("Failed to Mark Served", err.response?.data?.message || err.message || "Failed to mark order as served");
    }
  };

  // Cancel Held Order
  const handleCancelHeldOrder = async (orderId) => {
    const isConfirmed = await showConfirm({
      title: "Cancel Held Order?",
      text: "Are you sure you want to cancel this held order?",
      confirmButtonText: "Yes, Cancel",
      icon: "warning",
    });
    if (!isConfirmed) return;
    try {
      await restaurantService.cancelOrder(orderId, "Cancelled from Held Orders");
      loadHeldOrders();
      loadMenuData(selectedRestaurantId);
      showSuccess("Order Cancelled", "Held order was successfully cancelled.");
    } catch (err) {
      showError("Cancel Failed", err.response?.data?.message || "Failed to cancel order");
    }
  };

  // 2. WAITER: Send Order to Kitchen (Confirm Order & Route to KDS)
  const handleSendKOT = async () => {
    if (cart.length === 0) {
      showWarning("Cart Empty", "Cart is empty.");
      return;
    }
    if (orderType === "DINE_IN" && (!selectedTableId || selectedTableId.trim() === "")) {
      showWarning("Table Required", "Please select a table before sending the order to the kitchen.");
      return;
    }

    try {
      const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId);
      const branchId = selectedRest?.branchId;

      let orderId = activeOrder?.id;

      if (orderId) {
        // Accumulate/update existing active table order
        await restaurantService.updateOrder(orderId, {
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
          notes,
        });
      } else {
        // Create new table order
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
          status: "DRAFT",
        });
        orderId = createRes.data?.id;
      }

      const confirmRes = await restaurantService.confirmOrderAndSendKOT(orderId, null, false);
      showSuccess("KOT Sent!", `KOT Generated: ${confirmRes.data?.kot?.kotNumber || "Success"}. Order automatically sent to Kitchen Display (KDS).`);
      
      setCart([]);
      setActiveOrder(null);
      setSelectedTableId("");
      loadMenuData(selectedRestaurantId);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      showError("Failed to Send Order", errorMsg);
    }
  };

  // 3. CASHIER: Complete Order & Process Payment Action
  const handleProcessPayment = async () => {
    if (!activeOrder && cart.length === 0) {
      showWarning("No Order", "No active bill/order to process.");
      return;
    }

    try {
      setProcessingPayment(true);
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
          status: "CONFIRMED",
        });
        orderId = createRes.data?.id;
      } else if (cart.length > 0) {
        await restaurantService.updateOrder(orderId, {
          items: cart,
          subtotal,
          discountAmount: parseFloat(discountAmount || 0),
          taxAmount,
          totalAmount,
        });
      }

      await restaurantService.completeOrder(orderId, {
        amount: totalAmount || (activeOrder ? parseFloat(activeOrder.totalAmount) : 0),
        method: paymentMethod,
      });

      showSuccess("Payment Confirmed!", "Payment Confirmed! Order status updated to COMPLETED. Table is now AVAILABLE.");
      setShowPayModal(false);
      setCart([]);
      setActiveOrder(null);
      setSelectedTableId("");
      loadMenuData(selectedRestaurantId);
      if (showHistoryModal) loadOrderHistory();
    } catch (err) {
      showError("Payment Failed", err.response?.data?.message || err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Extract all READY TO SERVE orders for current outlet
  const readyOrders = [];
  tables.forEach((t) => {
    if (t.orders && t.orders.length > 0) {
      t.orders.forEach((o) => {
        if (o.status === "READY") {
          readyOrders.push({
            ...o,
            tableNumber: t.tableNumber,
            areaName: t.area?.name,
          });
        }
      });
    }
  });

  const filteredMenuItems = menuItems.filter((i) => {
    const matchesCat = activeCategoryId === "ALL" || i.categoryId === activeCategoryId;
    const matchesSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredHistoryOrders = historyOrders.filter((o) => {
    const matchesSearch = !historySearch || (o.orderNumber || "").toLowerCase().includes(historySearch.toLowerCase());
    const matchesStatus = historyStatusFilter === "ALL" || o.status === historyStatusFilter;
    const matchesTable = historyTableFilter === "ALL" || o.tableId === historyTableFilter;
    return matchesSearch && matchesStatus && matchesTable;
  });

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Restaurant POS...</div>;
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", backgroundColor: "#f8fafc", overflow: "hidden" }}>
      {/* LEFT & CENTER PANEL: Menu & Controls */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
        {/* Top Control Bar */}
        <div style={{ padding: "14px 20px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Order Type Selector */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
            {["DINE_IN", "TAKEAWAY", "DELIVERY"].map((type) => (
              <button
                key={type}
                onClick={() => handleOrderTypeChange(type)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  backgroundColor: orderType === type ? "#2563eb" : "transparent",
                  color: orderType === type ? "#fff" : "#475569",
                }}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Table Picker for DINE_IN */}
          {orderType === "DINE_IN" && (
            <select
              value={selectedTableId}
              onChange={(e) => handleTableChange(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "13px" }}
            >
              <option value="">Select Table...</option>
              {tables.map((t) => {
                const activeTblOrder = t.orders?.find(
                  (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
                );
                const statusBadge = activeTblOrder ? `Active Order (${activeTblOrder.status})` : t.status;
                return (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} {t.area?.name ? `(${t.area.name})` : ""} — {statusBadge}
                  </option>
                );
              })}
            </select>
          )}

          {/* Customer Picker (Only for Takeaway / Delivery) */}
          {orderType !== "DINE_IN" && (
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "13px" }}
            >
              <option value="">Select Customer (Optional)...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: "140px", padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />

          {/* TOP RIGHT TOOLBAR BUTTONS */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowReadyModal(true)}
              style={{
                padding: "7px 12px",
                backgroundColor: readyOrders.length > 0 ? "#10b981" : "#059669",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: readyOrders.length > 0 ? "0 0 10px rgba(16, 185, 129, 0.4)" : "none",
              }}
            >
              <FiBell size={14} /> Ready ({readyOrders.length})
            </button>

            <button
              onClick={() => {
                loadHeldOrders();
                setShowHeldModal(true);
              }}
              style={{ padding: "7px 12px", backgroundColor: "#64748b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
            >
              <FiClock size={14} /> Held Orders
            </button>

            {canDoBilling && (
              <>
                <button
                  onClick={() => {
                    loadHeldBills();
                    setShowHeldBillsModal(true);
                  }}
                  style={{ padding: "7px 12px", backgroundColor: "#d97706", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FiPauseCircle size={14} /> Held Bills
                </button>

                <button
                  onClick={() => {
                    loadOrderHistory();
                    setShowHistoryModal(true);
                  }}
                  style={{ padding: "7px 12px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FiList size={14} /> Order History
                </button>
              </>
            )}
          </div>
        </div>

        {/* INLINE READY TO SERVE SECTION */}
        {readyOrders.length > 0 && (
          <div style={{ padding: "14px 20px", backgroundColor: "#ecfdf5", borderBottom: "2px solid #10b981", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", color: "#065f46", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FiBell size={16} color="#059669" /> READY TO SERVE ORDERS ({readyOrders.length})
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#a7f3d0", color: "#065f46", padding: "2px 8px", borderRadius: "10px" }}>
                Kitchen Completed
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
              {readyOrders.map((ro) => (
                <div key={ro.id} style={{ backgroundColor: "#ffffff", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>Table {ro.tableNumber}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#059669" }}>#{ro.orderNumber}</span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
                    {ro.items?.map((item, idx) => (
                      <div key={idx} style={{ fontWeight: "600" }}>
                        {item.quantity} × {item.menuItem?.name || "Item"}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleMarkServed(ro.id)}
                    style={{
                      width: "100%",
                      padding: "7px",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <FiCheckCircle size={14} /> Mark as Served
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Pills */}
        <div style={{ padding: "10px 20px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "8px", overflowX: "auto" }}>
          <button
            onClick={() => setActiveCategoryId("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              border: "none",
              fontWeight: "700",
              fontSize: "12px",
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
                padding: "6px 14px",
                borderRadius: "16px",
                border: "none",
                fontWeight: "700",
                fontSize: "12px",
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
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          {restaurants.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <FiShoppingBag size={48} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>No Restaurant Outlets Available</h3>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <FiShoppingBag size={48} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>No Menu Items Found</h3>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "14px", alignContent: "start" }}>
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{item.category?.name}</div>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#059669" }}>₹{parseFloat(item.sellingPrice).toFixed(2)}</span>
                    <span style={{ backgroundColor: "#2563eb", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiPlus size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Current Cart & Checkout */}
      <div style={{ width: "400px", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Cart Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>
              {activeOrder ? `Order #${activeOrder.orderNumber}` : "Current Order"}
            </h3>
            <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
              <span>{orderType} {selectedTableId ? `(Table ${tables.find((t) => t.id === selectedTableId)?.tableNumber})` : ""}</span>
              {activeOrder && (
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    backgroundColor:
                      activeOrder.status === "READY"
                        ? "#d1fae5"
                        : activeOrder.status === "PREPARING"
                        ? "#fef3c7"
                        : activeOrder.status === "CONFIRMED"
                        ? "#dbeafe"
                        : activeOrder.status === "SERVED"
                        ? "#e2e8f0"
                        : "#f1f5f9",
                    color:
                      activeOrder.status === "READY"
                        ? "#065f46"
                        : activeOrder.status === "PREPARING"
                        ? "#92400e"
                        : activeOrder.status === "CONFIRMED"
                        ? "#1e40af"
                        : activeOrder.status === "SERVED"
                        ? "#334155"
                        : "#475569",
                  }}
                >
                  {activeOrder.status === "READY" ? "🟢 READY TO SERVE" : activeOrder.status === "PREPARING" ? "🔵 PREPARING" : activeOrder.status === "CONFIRMED" ? "🟡 CONFIRMED" : activeOrder.status}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => { setCart([]); setActiveOrder(null); }} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Clear Cart
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, padding: "14px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {cart.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", margin: "auto", fontSize: "14px" }}>Cart is empty. Select menu dishes.</p>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{item.name}</div>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>₹{item.unitPrice.toFixed(2)} each</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button onClick={() => handleUpdateQty(item.menuItemId, -1)} style={{ padding: "2px 8px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px", fontWeight: "700" }}>-</button>
                    <span style={{ fontWeight: "700", fontSize: "13px" }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.menuItemId, 1)} style={{ padding: "2px 8px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px", fontWeight: "700" }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Actions */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          {/* Financial Totals (Only visible to Cashier / Admin) */}
          {canDoBilling && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginBottom: "4px" }}>
                <span>Tax (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: "800", color: "#0f172a", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #cbd5e1" }}>
                <span>Total</span>
                <span style={{ color: "#059669" }}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </>
          )}

          {/* Action Buttons Matrix based on Role */}
          <div style={{ display: "grid", gridTemplateColumns: canDoBilling ? "1fr 1fr 1fr" : "1fr 1fr", gap: "8px", marginTop: "14px" }}>
            {/* WAITER: HOLD ORDER BUTTON */}
            {isWaiter && (
              <button
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                style={{
                  padding: "10px",
                  backgroundColor: "#475569",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <FiPauseCircle size={14} /> Hold Order
              </button>
            )}

            {/* CASHIER: HOLD BILL BUTTON */}
            {canDoBilling && (
              <button
                onClick={handleHoldBill}
                disabled={cart.length === 0 && !activeOrder}
                style={{
                  padding: "10px",
                  backgroundColor: "#d97706",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: cart.length === 0 && !activeOrder ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <FiPauseCircle size={14} /> Hold Bill
              </button>
            )}

            {/* WAITER: SEND TO KITCHEN BUTTON */}
            <button
              onClick={handleSendKOT}
              disabled={cart.length === 0}
              style={{
                padding: "10px",
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <FiSend size={14} /> Send to Kitchen
            </button>

            {/* CASHIER: PAY & BILL BUTTON */}
            {canDoBilling && (
              <button
                onClick={() => setShowPayModal(true)}
                disabled={cart.length === 0 && !activeOrder}
                style={{
                  padding: "10px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: cart.length === 0 && !activeOrder ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <FiCreditCard size={14} /> Pay & Bill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WAITER HELD ORDERS MODAL */}
      {showHeldModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>⏸ Held Draft Orders</h3>
              <button onClick={() => setShowHeldModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {heldOrders.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "32px" }}>No held draft orders found.</p>
              ) : (
                heldOrders.map((o) => (
                  <div key={o.id} style={{ padding: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>Order #{o.orderNumber} ({o.orderType})</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {o.table ? `Table: ${o.table.tableNumber}` : "Takeaway"} • {o.items?.length || 0} items
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleResumeHeldOrder(o)}
                        style={{ padding: "8px 12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <FiPlay size={12} /> Resume
                      </button>
                      <button
                        onClick={() => handleCancelHeldOrder(o.id)}
                        style={{ padding: "8px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CASHIER HELD BILLS MODAL */}
      {showHeldBillsModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>⏸ Held Table Bills (Unpaid)</h3>
              <button onClick={() => setShowHeldBillsModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {heldBills.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "32px" }}>No held table bills found.</p>
              ) : (
                heldBills.map((o) => (
                  <div key={o.id} style={{ padding: "14px", border: "1px solid #fde68a", borderRadius: "8px", backgroundColor: "#fffbeb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>Order #{o.orderNumber} ({o.orderType})</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {o.table ? `Table: ${o.table.tableNumber}` : "Takeaway"} • Status: {o.status} • Billing: ON HOLD
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>
                        ₹{parseFloat(o.totalAmount).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleResumeHeldOrder(o)}
                        style={{ padding: "8px 12px", backgroundColor: "#d97706", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <FiPlay size={12} /> Resume Bill
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY MODAL (CASHIER & ADMIN) */}
      {showHistoryModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "820px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>📜 Restaurant Order History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search order #..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", flex: 1 }}
              />
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              >
                <option value="ALL">All Statuses</option>
                <option value="HELD">HELD</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="SERVED">SERVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Order History Table */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Order #</th>
                    <th style={{ padding: "10px" }}>Type / Table</th>
                    <th style={{ padding: "10px" }}>Items</th>
                    <th style={{ padding: "10px" }}>Total</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistoryOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px", fontWeight: "700" }}>{o.orderNumber}</td>
                      <td style={{ padding: "10px" }}>{o.orderType} {o.table ? `(${o.table.tableNumber})` : ""}</td>
                      <td style={{ padding: "10px" }}>{o.items?.length || 0}</td>
                      <td style={{ padding: "10px", fontWeight: "700", color: "#059669" }}>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: o.status === "COMPLETED" ? "#d1fae5" : o.status === "SERVED" ? "#dbeafe" : "#fef3c7",
                          color: o.status === "COMPLETED" ? "#065f46" : o.status === "SERVED" ? "#1e40af" : "#92400e",
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedPrintOrder(o)}
                            style={{ padding: "4px 8px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            title="Print Bill"
                          >
                            <FiPrinter size={12} />
                          </button>
                          {o.status !== "COMPLETED" && o.status !== "CANCELLED" && (
                            <button
                              onClick={() => {
                                setActiveOrder(o);
                                setShowPayModal(true);
                              }}
                              style={{ padding: "4px 8px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "700" }}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRINT BILL MODAL */}
      {selectedPrintOrder && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "380px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>RESTO ERP BILL RECEIPT</h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Order #{selectedPrintOrder.orderNumber}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Type: {selectedPrintOrder.orderType}</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              {selectedPrintOrder.items?.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                  <span>{item.quantity} x {item.menuItem?.name || "Item"}</span>
                  <span style={{ fontWeight: "700" }}>₹{parseFloat(item.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "10px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "800" }}>
                <span>Total Amount</span>
                <span style={{ color: "#059669" }}>₹{parseFloat(selectedPrintOrder.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                <span>Status</span>
                <span style={{ fontWeight: "700" }}>{selectedPrintOrder.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSelectedPrintOrder(null)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }}>
                Close
              </button>
              <button onClick={() => window.print()} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700" }}>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "700" }}>Complete Order & Payment</h3>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669", marginBottom: "20px" }}>
              Total Payable: ₹{(totalAmount || (activeOrder ? parseFloat(activeOrder.totalAmount) : 0)).toFixed(2)}
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
              <button
                onClick={handleProcessPayment}
                disabled={processingPayment}
                style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: processingPayment ? "not-allowed" : "pointer" }}
              >
                {processingPayment ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* READY TO SERVE MODAL */}
      {showReadyModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "650px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#065f46", display: "flex", alignItems: "center", gap: "8px" }}>
                🔔 READY TO SERVE ORDERS ({readyOrders.length})
              </h3>
              <button onClick={() => setShowReadyModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {readyOrders.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "32px" }}>No orders currently ready to serve.</p>
              ) : (
                readyOrders.map((o) => (
                  <div key={o.id} style={{ padding: "14px", border: "1px solid #a7f3d0", borderRadius: "8px", backgroundColor: "#ecfdf5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px" }}>Table {o.tableNumber} • Order #{o.orderNumber}</div>
                      <div style={{ fontSize: "13px", color: "#065f46", marginTop: "4px" }}>
                        {o.items?.map((i) => `${i.quantity} × ${i.menuItem?.name || "Item"}`).join(", ")}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#10b981", color: "#fff", padding: "2px 8px", borderRadius: "10px", marginTop: "6px", display: "inline-block" }}>
                        READY TO SERVE
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleMarkServed(o.id);
                        if (readyOrders.length <= 1) setShowReadyModal(false);
                      }}
                      style={{ padding: "9px 14px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <FiCheckCircle size={14} /> Mark as Served
                    </button>
                  </div>
                ))
              )}
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
