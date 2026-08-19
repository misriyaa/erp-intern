"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import {
  FiSearch,
  FiCalendar,
  FiChevronDown,
  FiRefreshCw,
  FiPrinter,
  FiDownload,
  FiPlus,
  FiBox,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import styles from "./products.module.css";
import { useAlert } from "@/context/AlertContext";
import apiClient from "@/services/apiClient";
import { useCompany } from "@/context/CompanyContext";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const { isGym, isTextile } = useCompany();

  /* =========================================================
     STATE
  ========================================================= */

  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const {
    showSuccess,
    showError,
    showConfirm,
  } = useAlert();

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {
    if (isTextile) {
      router.replace("/textile/products");
    } else if (isGym) {
      router.replace("/gym/plans");
    } else {
      fetchProducts();
    }
  }, [isGym, isTextile]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/products");
      const fetched = res.data?.data || (Array.isArray(res.data) ? res.data : []);

      const retailOnly = fetched.filter(
        (p) =>
          !p.sku?.startsWith("TEX-") &&
          !p.description?.includes("[TEXTILE]")
      );

      setProductsData(retailOnly);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDelete = (id) => {
    showConfirm({
      title: "Delete Product",

      message:
        "Are you sure you want to delete this product from stock inventory? This action cannot be undone.",

      confirmText: "Delete Product",

      type: "danger",

      onConfirm: async () => {
        try {
          await apiClient.delete(`/products/${id}`);

          showSuccess(
            "Product deleted",
            "Product deleted successfully."
          );

          await fetchProducts();
        } catch (error) {
          console.error(
            error.response?.data?.message ||
              error.message
          );

          showError(
            "Product couldn't be deleted",
            error.response?.data?.message ||
              "Failed to delete product. Active dependency exists."
          );
        }
      },
    });
  };

  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...productsData];

    /* -------------------------
       SEARCH
    ------------------------- */

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();

      result = result.filter((product) => {
        return (
          product.name
            ?.toLowerCase()
            .includes(keyword) ||

          product.code
            ?.toLowerCase()
            .includes(keyword) ||

          product.sku
            ?.toLowerCase()
            .includes(keyword) ||

          product.category?.name
            ?.toLowerCase()
            .includes(keyword) ||

          product.brand?.name
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }

    /* -------------------------
       STATUS FILTER
    ------------------------- */

    if (statusFilter !== "All") {
      result = result.filter((product) => {
        const quantity =
          Number(
            product.inventories?.[0]?.quantity || 0
          );

        const minimumStock =
          Number(
            product.inventories?.[0]?.minimumStock ||
              product.inventories?.[0]?.lowStock ||
              10
          );

        if (statusFilter === "In Stock") {
          return quantity > minimumStock;
        }

        if (statusFilter === "Low Stock") {
          return (
            quantity > 0 &&
            quantity <= minimumStock
          );
        }

        if (statusFilter === "No Stock") {
          return quantity === 0;
        }

        return true;
      });
    }

    /* -------------------------
       SORT
    ------------------------- */

    if (sortBy === "Name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );
    }

    if (sortBy === "Price Low") {
      result.sort(
        (a, b) =>
          Number(a.sellingPrice || 0) -
          Number(b.sellingPrice || 0)
      );
    }

    if (sortBy === "Price High") {
      result.sort(
        (a, b) =>
          Number(b.sellingPrice || 0) -
          Number(a.sellingPrice || 0)
      );
    }

    if (sortBy === "Quantity") {
      result.sort(
        (a, b) =>
          Number(
            b.inventories?.[0]?.quantity || 0
          ) -
          Number(
            a.inventories?.[0]?.quantity || 0
          )
      );
    }

    return result;
  }, [
    search,
    statusFilter,
    sortBy,
    productsData,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalProducts = productsData.length;

  const inStock = productsData.filter(
    (product) => {
      const quantity =
        Number(
          product.inventories?.[0]?.quantity || 0
        );

      return quantity > 0;
    }
  ).length;

  const lowStock = productsData.filter(
    (product) => {
      const quantity =
        Number(
          product.inventories?.[0]?.quantity || 0
        );

      const minimumStock =
        Number(
          product.inventories?.[0]?.minimumStock ||
            product.inventories?.[0]?.lowStock ||
            10
        );

      return (
        quantity > 0 &&
        quantity <= minimumStock
      );
    }
  ).length;

  const noStock = productsData.filter(
    (product) => {
      const quantity =
        Number(
          product.inventories?.[0]?.quantity || 0
        );

      return quantity === 0;
    }
  ).length;

  /* =========================================================
     PRODUCT STATUS
  ========================================================= */

  const getProductStatus = (product) => {
    const quantity =
      Number(
        product.inventories?.[0]?.quantity || 0
      );

    const minimumStock =
      Number(
        product.inventories?.[0]?.minimumStock ||
          product.inventories?.[0]?.lowStock ||
          10
      );

    if (quantity === 0) {
      return "No Stock";
    }

    if (quantity <= minimumStock) {
      return "Low Stock";
    }

    return "In Stock";
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    if (status === "In Stock") {
      return styles.inStock;
    }

    if (status === "Low Stock") {
      return styles.lowStock;
    }

    return styles.noStock;
  };

  /* =========================================================
     PRINT
  ========================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExport = () => {
    const headers = [
      "Code",
      "Product",
      "SKU",
      "Category",
      "Brand",
      "Unit",
      "Quantity",
      "Status",
      "Selling Price",
      "Purchase Price",
    ];

    const rows = filteredProducts.map(
      (product) => [
        product.code || "N/A",

        product.name || "N/A",

        product.sku || "N/A",

        product.category?.name || "N/A",

        product.brand?.name || "N/A",

        product.unit?.name || "N/A",

        product.inventories?.[0]?.quantity || 0,

        getProductStatus(product),

        product.sellingPrice || 0,

        product.costPrice || 0,
      ]
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const stringValue =
              String(value ?? "");

            if (
              stringValue.includes(",") ||
              stringValue.includes('"')
            ) {
              return `"${stringValue.replace(
                /"/g,
                '""'
              )}"`;
            }

            return stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "products.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     PRODUCT IMAGE URL
  ========================================================= */

  const getProductImage = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <main className={styles.page}>
      <Toaster position="top-right" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className={styles.header}>
        <div>
          <h1>Products</h1>
        </div>

        <div className={styles.headerActions}>
          {/* PRINT */}

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handlePrint}
          >
            <FiPrinter />

            <span>Print</span>
          </button>

          {/* EXPORT */}

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleExport}
          >
            <FiDownload />

            <span>Export</span>

            <FiChevronDown />
          </button>

          {/* ADD NEW */}

          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              window.location.href =
                "/admin/products/add";
            }}
          >
            <FiPlus />

            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className={styles.statsGrid}>
        {/* TOTAL PRODUCTS */}

        <div className={styles.statCard}>
          <div>
            <p>Total Products</p>

            <h2>{totalProducts}</h2>

            <span className={styles.growth}>
              ↗ 5.62
            </span>
          </div>

          <div
            className={`${styles.statIcon} ${styles.greenIcon}`}
          >
            <FiBox />
          </div>
        </div>

        {/* IN STOCK */}

        <div className={styles.statCard}>
          <div>
            <p>In Stock</p>

            <h2>{inStock}</h2>

            <span className={styles.growth}>
              ↗ 2.25
            </span>
          </div>

          <div
            className={`${styles.statIcon} ${styles.blueIcon}`}
          >
            <FiCheckCircle />
          </div>
        </div>

        {/* LOW STOCK */}

        <div className={styles.statCard}>
          <div>
            <p>Low Stock</p>

            <h2>{lowStock}</h2>

            <span className={styles.alertText}>
              Alerts Active
            </span>
          </div>

          <div
            className={`${styles.statIcon} ${styles.orangeIcon}`}
          >
            <FiAlertTriangle />
          </div>
        </div>

        {/* NO STOCK */}

        <div className={styles.statCard}>
          <div>
            <p>No Stock</p>

            <h2>{noStock}</h2>

            <span className={styles.alertText}>
              Needs reorder
            </span>
          </div>

          <div
            className={`${styles.statIcon} ${styles.redIcon}`}
          >
            <FiXCircle />
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <section className={styles.tableCard}>
        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className={styles.toolbar}>
          {/* SEARCH */}

          <div className={styles.searchBox}>
            <FiSearch />

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {/* DATE */}

          <button
            type="button"
            className={styles.dateButton}
          >
            <FiCalendar />

            <span>Today</span>
          </button>

          {/* RIGHT TOOLBAR */}

          <div className={styles.toolbarRight}>
            {/* FILTER */}

            <select
              className={styles.filterButton}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                Filter
              </option>

              <option value="In Stock">
                In Stock
              </option>

              <option value="Low Stock">
                Low Stock
              </option>

              <option value="No Stock">
                No Stock
              </option>
            </select>

            {/* SORT */}

            <select
              className={styles.sortButton}
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="Latest">
                Sort By
              </option>

              <option value="Name">
                Name
              </option>

              <option value="Price Low">
                Price Low
              </option>

              <option value="Price High">
                Price High
              </option>

              <option value="Quantity">
                Quantity
              </option>
            </select>

            {/* COLUMNS */}

            <button
              type="button"
              className={styles.iconButton}
              title="Columns"
            >
              <span>Ⅱ</span>
            </button>

            {/* REFRESH */}

            <button
              type="button"
              className={styles.iconButton}
              title="Refresh"
              onClick={fetchProducts}
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2
                className={styles.spinner}
                size={40}
              />

              <span>
                Loading products...
              </span>
            </div>
          ) : (
            <table className={styles.table}>
              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead>
                <tr>
                  <th>Code</th>

                  <th>Product</th>

                  <th>SKU</th>

                  <th>Category</th>

                  <th>Brand</th>

                  <th>Unit</th>

                  <th>Quantity</th>

                  <th>Status</th>

                  <th>Selling Price</th>

                  <th>Purchase Price</th>

                  <th>Action</th>
                </tr>
              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>
                {filteredProducts.length >
                0 ? (
                  filteredProducts.map(
                    (product) => {
                      const status =
                        getProductStatus(
                          product
                        );

                      const imageUrl =
                        getProductImage(
                          product.image
                        );

                      const quantity =
                        Number(
                          product
                            .inventories?.[0]
                            ?.quantity || 0
                        );

                      return (
                        <tr
                          key={product.id}
                          className={
                            styles.productRow
                          }
                          onClick={() => {
                            window.location.href =
                              `/admin/products/details/${product.id}`;
                          }}
                        >
                          {/* CODE */}

                          <td
                            className={
                              styles.code
                            }
                          >
                            {product.code ||
                              `#${String(
                                product.id ||
                                  ""
                              ).substring(
                                0,
                                6
                              )}`}
                          </td>

                          {/* PRODUCT */}

                          <td>
                            <div
                              className={
                                styles.productCell
                              }
                            >
                              <div
                                className={`${
                                  styles.productIcon
                                } ${
                                  styles[
                                    product.iconType ||
                                      "default"
                                  ] || ""
                                }`}
                              >
                                {imageUrl ? (
                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={
                                      product.name ||
                                      "Product"
                                    }
                                    className={
                                      styles.productImage
                                    }
                                  />
                                ) : (
                                  product.icon || (
                                    <FiBox />
                                  )
                                )}
                              </div>

                              <strong>
                                {product.name ||
                                  "N/A"}
                              </strong>
                            </div>
                          </td>

                          {/* SKU */}

                          <td>
                            {product.sku ||
                              "N/A"}
                          </td>

                          {/* CATEGORY */}

                          <td>
                            {product.category
                              ?.name ||
                              "N/A"}
                          </td>

                          {/* BRAND */}

                          <td>
                            {product.brand
                              ?.name ||
                              "N/A"}
                          </td>

                          {/* UNIT */}

                          <td>
                            {product.unit
                              ?.name ||
                              "N/A"}
                          </td>

                          {/* QUANTITY */}

                          <td>
                            {String(
                              quantity
                            ).padStart(2, "0")}
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`${styles.status} ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          {/* SELLING PRICE */}

                          <td
                            className={
                              styles.price
                            }
                          >
                            $
                            {Number(
                              product.sellingPrice ||
                                0
                            ).toFixed(2)}
                          </td>

                          {/* PURCHASE PRICE */}

                          <td
                            className={
                              styles.price
                            }
                          >
                            $
                            {Number(
                              product.costPrice ||
                                0
                            ).toFixed(2)}
                          </td>

                          {/* =================================================
                              ACTIONS
                          ================================================= */}

                          <td
                            className={
                              styles.actionCell
                            }
                          >
                            <div
                              className={
                                styles.actionButtons
                              }
                            >
                              {/* VIEW */}

                              <button
                                type="button"
                                title="View"
                                aria-label="View product"
                                className={`${styles.actionIconButton} ${styles.viewButton}`}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  window.location.href =
                                    `/admin/products/details/${product.id}`;
                                }}
                              >
                                <FiEye />
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                title="Edit"
                                aria-label="Edit product"
                                className={`${styles.actionIconButton} ${styles.editButton}`}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  window.location.href =
                                    `/admin/products/edit/${product.id}`;
                                }}
                              >
                                <FiEdit2 />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                title="Delete"
                                aria-label="Delete product"
                                className={`${styles.actionIconButton} ${styles.deleteButton}`}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleDelete(
                                    product.id
                                  );
                                }}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  /* =================================================
                     EMPTY
                  ================================================= */

                  <tr>
                    <td
                      colSpan="11"
                      className={
                        styles.empty
                      }
                    >
                      <div
                        className={
                          styles.emptyContent
                        }
                      >
                        <FiBox />

                        <span>
                          No products found
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}