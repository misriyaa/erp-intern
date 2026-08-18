"use client";

import { useState } from "react";
import Link from "next/link";
import TransferForm from "../components/TransferForm";
import "../warehouse.css";

export default function TransferPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="warehouse-page-wrapper">
      {/* Sub-Navigation */}
      <nav className="warehouse-nav-tabs">
        <Link href="/warehouse" className="nav-tab-item">
          Warehouse Overview
        </Link>
        <Link href="/warehouse/stock" className="nav-tab-item">
          Stock Inventory
        </Link>
        <Link href="/warehouse/transfer" className="nav-tab-item active">
          Stock Transfer
        </Link>
        <button className="nav-tab-item">
          Reports & Analytics
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="warehouse-main-content">
        <TransferForm />

        {/* Bottom Floating Pagination */}
        <div className="warehouse-pagination-wrapper">
          <div className="warehouse-pagination-pill">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`page-btn ${currentPage === num ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}