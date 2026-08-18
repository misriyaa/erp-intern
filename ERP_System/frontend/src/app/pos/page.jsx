"use client";

import { useMemo, useState, useEffect } from "react";
import "./pos.css";

import PosToolbar from "./components/PosToolbar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import OrderPanel from "./components/OrderPanel";
import API_URL from "@/config/api";
import Swal from "sweetalert2";
import apiClient from "@/services/apiClient";
import { useAlert } from "@/context/AlertContext";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [activeTab, setActiveTab] = useState("Products");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [query, setQuery] = useState("");

  const [customer, setCustomer] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [cart, setCart] = useState([]);
  const [localHeldDrafts, setLocalHeldDrafts] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("pos_held_drafts") || "[]");
      setLocalHeldDrafts(items);
    }
  }, [activeTab]);

  // Fetch all POS dependencies from the database using authenticated apiClient
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, brandRes, custRes, taxRes, discRes] = await Promise.all([
          apiClient.get("/products").then((r) => r.data).catch(() => ({ success: false, data: [] })),
          apiClient.get("/categories").then((r) => r.data).catch(() => ({ success: false, data: [] })),
          apiClient.get("/brands").then((r) => r.data).catch(() => ({ success: false, data: [] })),
          apiClient.get("/customers").then((r) => r.data).catch(() => ({ success: false, data: [] })),
          apiClient.get("/taxes").then((r) => r.data).catch(() => ({ success: false, data: [] })),
          apiClient.get("/discounts").then((r) => r.data).catch(() => ({ success: false, data: [] })),
        ]);

        if (prodRes.success && prodRes.data) {
          const mapped = prodRes.data.map((p) => {
            const stockQty = (p.inventories && p.inventories.length > 0)
              ? p.inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0)
              : (p.stock !== undefined && p.stock !== null ? Number(p.stock) : 100);

            return {
              id: p.id,
              name: p.name,
              sku: p.sku || p.id,
              code: p.sku || p.id,
              price: Number(p.sellingPrice) || 0,
              stock: stockQty,
              category: p.category?.name || "Others",
              brand: p.brand?.name || "Generic",
              imageUrl: p.image
                ? p.image.startsWith("http")
                  ? p.image
                  : `http://localhost:5000${p.image.startsWith("/") ? "" : "/"}${p.image}`
                : "",
            };
          });
          setProducts(mapped);
        }

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }

        if (brandRes.success && brandRes.data) {
          setBrands(brandRes.data);
        }

        if (custRes.success && custRes.data) {
          setCustomers(custRes.data);
        }

        if (taxRes.success && taxRes.data) {
          setTaxes(taxRes.data);
        }

        if (discRes.success && discRes.data) {
          setDiscounts(discRes.data);
        }
      } catch (err) {
        console.error("Error loading POS dynamic data:", err);
      }
    }
    loadData();
  }, []);

  const categoryNames = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  const brandNames = useMemo(() => {
    return ["All", ...brands.map((b) => b.name)];
  }, [brands]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "All" || p.category === activeCategory;
      const matchesBrand =
        selectedBrand === "All" || p.brand === selectedBrand;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesBrand && matchesQuery;
    });
  }, [products, activeCategory, selectedBrand, query]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartId: Date.now(),
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          qty: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  const addScannedBarcode = async (code) => {
    try {
      const res = await apiClient.get(`/barcodes/scan/${code}`).then((r) => r.data);
      
      if (res.success && res.data) {
        const p = res.data;
        const stockQty = (p.inventories && p.inventories.length > 0)
          ? p.inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0)
          : (p.stock !== undefined && p.stock !== null ? Number(p.stock) : 100);

        const mapped = {
          id: p.id,
          name: p.name,
          sku: p.sku || p.id,
          code: p.sku || p.id,
          price: Number(p.sellingPrice) || 0,
          stock: stockQty,
          category: p.category?.name || "Others",
          brand: p.brand?.name || "Generic",
          imageUrl: p.image
            ? p.image.startsWith("http")
              ? p.image
              : `http://localhost:5000${p.image.startsWith("/") ? "" : "/"}${p.image}`
            : "",
        };
        addToCart(mapped);
        return;
      }
    } catch (err) {
      console.warn("Barcode not found, checking products SKU locally/dynamically...", err.message);
    }

    const found = products.find(
      (p) =>
        p.sku.toLowerCase() === code.toLowerCase() ||
        p.code.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      addToCart(found);
      return;
    }

    try {
      const res = await apiClient.get("/products").then((r) => r.data);
      if (res.success && res.data) {
        const foundDb = res.data.find(
          (p) =>
            p.sku?.toLowerCase() === code.toLowerCase() ||
            p.id?.toLowerCase() === code.toLowerCase()
        );
        if (foundDb) {
          const p = foundDb;
          const stockQty = (p.inventories && p.inventories.length > 0)
            ? p.inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0)
            : (p.stock !== undefined && p.stock !== null ? Number(p.stock) : 100);

          const mapped = {
            id: p.id,
            name: p.name,
            sku: p.sku || p.id,
            code: p.sku || p.id,
            price: Number(p.sellingPrice) || 0,
            stock: stockQty,
            category: p.category?.name || "Others",
            brand: p.brand?.name || "Generic",
            imageUrl: p.image
              ? p.image.startsWith("http")
                ? p.image
                : `http://localhost:5000${p.image.startsWith("/") ? "" : "/"}${p.image}`
              : "",
          };
          addToCart(mapped);
          return;
        }
      }
    } catch (err) {
      console.error("Dynamic product lookup error:", err);
    }

    addToCart({
      id: `scanned-${Date.now()}`,
      name: `Scanned Item (${code})`,
      sku: code,
      price: 50.0,
      imageUrl: "",
    });
  };

  const removeItem = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, nextQty) => {
    if (nextQty <= 0) {
      removeItem(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, qty: nextQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleAddCustomer = async ({ name, phone, email }) => {
    try {
      const res = await apiClient.post("/customers", {
        name,
        phone,
        email,
      }).then((r) => r.data);

      if (res.success) {
        setCustomers((prev) => [...prev, res.data]);
        setCustomer(res.data.id);
        Swal.fire({
          title: "Customer Added!",
          text: `Customer ${name} added successfully.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      } else {
        Swal.fire({
          title: "Failed to Add",
          text: res.message || "Failed to add customer",
          icon: "error",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error("Error adding customer:", err);
      Swal.fire({
        title: "Error!",
        text: "Error adding customer: " + (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      Swal.fire({
        title: "Cart Empty!",
        text: "Add products to the cart before completing the sale.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const activeTaxRate = taxes[0]?.rate ? Number(taxes[0].rate) : 10;
    const taxAmount = (subtotal - Number(discountValue)) * (activeTaxRate / 100);
    const totalAmount = subtotal;
    const netAmount = subtotal + taxAmount - Number(discountValue);

    const salePayload = {
      customerId: customer || null,
      orderNumber: `SO-${Date.now()}`,
      status: "CONFIRMED",
      orderDate: new Date().toISOString(),
      totalAmount,
      taxAmount,
      discountAmount: Number(discountValue),
      netAmount,
    };

    try {
      const res = await apiClient.post("/sales", salePayload).then((r) => r.data);

      if (res.success) {
        Swal.fire({
          title: "Sale Completed!",
          text: "Sale completed and saved successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
        clearCart();
        setDiscountValue(0);
        setAmountReceived(0);
        setCustomer("");
      } else {
        Swal.fire({
          title: "Failed to Complete",
          text: res.message || "Failed to save sale",
          icon: "error",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error("Error completing sale:", err);
      Swal.fire({
        title: "Error!",
        text: "Error completing sale: " + (err.response?.data?.message || err.message),
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const activeTaxRate = taxes[0]?.rate ? Number(taxes[0].rate) : 10;

  const saveCartLocally = (type) => {
    if (cart.length === 0) {
      Swal.fire({
        title: "Cart Empty!",
        text: `Cannot ${type.toLowerCase()} an empty cart.`,
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxAmount = (subtotal - Number(discountValue)) * (activeTaxRate / 100);
    const totalAmount = subtotal;
    const netAmount = subtotal + taxAmount - Number(discountValue);

    const selectedCustObj = customers.find((c) => c.id === customer);
    const customerName = selectedCustObj ? selectedCustObj.name : "Walk-in Customer";

    const newEntry = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      orderNumber: `SO-${Date.now()}`,
      customer,
      customerName,
      cart,
      discountValue,
      amountReceived,
      selectedPayment,
      totalAmount,
      taxAmount,
      netAmount,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("pos_held_drafts") || "[]");
    localStorage.setItem("pos_held_drafts", JSON.stringify([newEntry, ...existing]));
    setLocalHeldDrafts([newEntry, ...existing]);
    return true;
  };

  const handleHoldSale = async () => {
    const success = saveCartLocally("Hold");
    if (!success) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxAmount = (subtotal - Number(discountValue)) * (activeTaxRate / 100);
    const totalAmount = subtotal;
    const netAmount = subtotal + taxAmount - Number(discountValue);

    const salePayload = {
      customerId: customer || null,
      orderNumber: `SO-${Date.now()}`,
      status: "DRAFT",
      orderDate: new Date().toISOString(),
      totalAmount,
      taxAmount,
      discountAmount: Number(discountValue),
      netAmount,
    };

    try {
      await apiClient.post("/sales", salePayload);
    } catch (err) {
      console.error("Backend draft sync error:", err);
    }

    Swal.fire({
      title: "Sale Held!",
      text: "The current sale has been held successfully.",
      icon: "success",
      confirmButtonColor: "#2563eb",
    });
    clearCart();
    setDiscountValue(0);
    setAmountReceived(0);
    setCustomer("");
  };

  const handleSaveDraft = async () => {
    const success = saveCartLocally("Draft");
    if (!success) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxAmount = (subtotal - Number(discountValue)) * (activeTaxRate / 100);
    const totalAmount = subtotal;
    const netAmount = subtotal + taxAmount - Number(discountValue);

    const salePayload = {
      customerId: customer || null,
      orderNumber: `SO-${Date.now()}`,
      status: "DRAFT",
      orderDate: new Date().toISOString(),
      totalAmount,
      taxAmount,
      discountAmount: Number(discountValue),
      netAmount,
    };

    try {
      await apiClient.post("/sales", salePayload);
    } catch (err) {
      console.error("Backend draft sync error:", err);
    }

    Swal.fire({
      title: "Draft Saved!",
      text: "Cart contents saved as draft.",
      icon: "success",
      confirmButtonColor: "#2563eb",
    });
    clearCart();
    setDiscountValue(0);
    setAmountReceived(0);
    setCustomer("");
  };

  const handleRestoreDraft = (draft) => {
    setCart(draft.cart || []);
    setCustomer(draft.customer || "");
    setDiscountValue(draft.discountValue || 0);
    setAmountReceived(draft.amountReceived || 0);
    if (draft.selectedPayment) setSelectedPayment(draft.selectedPayment);

    const remaining = localHeldDrafts.filter((item) => item.id !== draft.id);
    localStorage.setItem("pos_held_drafts", JSON.stringify(remaining));
    setLocalHeldDrafts(remaining);

    Swal.fire({
      title: "Order Restored!",
      text: `Order ${draft.orderNumber} restored to active cart.`,
      icon: "info",
      confirmButtonColor: "#2563eb",
    });
  };

  const handleDeleteDraft = (draftId) => {
    const remaining = localHeldDrafts.filter((item) => item.id !== draftId);
    localStorage.setItem("pos_held_drafts", JSON.stringify(remaining));
    setLocalHeldDrafts(remaining);
  };

  return (
    <div className="pos-app-container">
      <div className="pos-left-section">
        <PosToolbar
          query={query}
          setQuery={setQuery}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          brandNames={brandNames}
          onBarcodeScan={addScannedBarcode}
          onReset={() => {
            setQuery("");
            setActiveCategory("All");
            setSelectedBrand("All");
          }}
        />

        <CategoryTabs
          categories={categoryNames}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <ProductGrid
          products={filteredProducts}
          addToCart={addToCart}
          onAddToCart={addToCart}
        />
      </div>

      <div className="pos-right-section">
        <OrderPanel
          cart={cart}
          customers={customers}
          customer={customer}
          setCustomer={setCustomer}
          onCustomerChange={setCustomer}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          onDiscountChange={setDiscountValue}
          amountReceived={amountReceived}
          setAmountReceived={setAmountReceived}
          onAmountReceivedChange={setAmountReceived}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          onSelectPayment={setSelectedPayment}
          activeTaxRate={activeTaxRate}
          taxRate={activeTaxRate}
          updateQuantity={updateQuantity}
          onUpdateQty={updateQuantity}
          removeItem={removeItem}
          onRemoveItem={removeItem}
          clearCart={clearCart}
          onClearCart={clearCart}
          onAddCustomer={handleAddCustomer}
          onCompleteSale={handleCompleteSale}
          onHoldSale={handleHoldSale}
          onSaveDraft={handleSaveDraft}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          heldDrafts={localHeldDrafts}
          onRestoreDraft={handleRestoreDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      </div>
    </div>
  );
}
