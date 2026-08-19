"use client";

import Link from "next/link";
import { FiPrinter, FiDownload, FiX } from "react-icons/fi";
import PurchaseForm from "../components/PurchaseForm";
import "../purchases.css";

export default function AddPurchasePage() {
  return (
    <div className="page">
      {/* PAGE HEADER */}
      <header className="header">
        <div>
          <h1>Purchases</h1>
          <p>Manage company purchase orders, supplier inventory, and stock receipts.</p>
        </div>

        <div className="headerActions">
          <button
            className="secondaryButton"
            onClick={() => window.print()}
          >
            <FiPrinter size={15} />
            Print
          </button>

          <button
            className="secondaryButton"
            onClick={() => alert("Exporting template...")}
          >
            <FiDownload size={15} />
            Export
          </button>

          <Link href="/purchases" className="addButton">
            <FiX size={17} />
            Close
          </Link>
        </div>
      </header>

      {/* ADD CARD */}
      <PurchaseForm />
    </div>
  );
}



