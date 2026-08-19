"use client";

import { use } from "react";

export default function InvoiceDetailPage({ params }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Invoice #{resolvedParams?.id || ""}</h1>
      <p className="text-gray-600">View detailed invoice line items and payment status.</p>
    </div>
  );
}
