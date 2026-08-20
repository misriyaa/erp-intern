"use client";

import { FiX, FiPrinter, FiShoppingBag, FiUser, FiCalendar, FiDollarSign } from "react-icons/fi";
import { useCompany } from "@/context/CompanyContext";
import { useSettings } from "@/context/SettingsContext";

export default function InvoicePreview({ invoice, onClose, onPrint }) {
  const { company } = useCompany();
  const { settings } = useSettings();

  if (!invoice) return null;

  const companyName = company?.name || settings?.companyName || "Retail ERP Cloud";
  const companyPhone = company?.phone || settings?.companyPhone || "";
  const companyAddress = company?.address || settings?.companyAddress || "";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Reference ID: {invoice.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top layout: Brand & Invoice Meta */}
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-2xl font-black text-blue-600 uppercase tracking-wide">
                {companyName}
              </h3>
              {companyAddress && <p className="text-sm text-gray-500 mt-1 max-w-sm">{companyAddress}</p>}
              {companyPhone && <p className="text-sm text-gray-500">Phone: {companyPhone}</p>}
            </div>

            <div className="md:text-right space-y-1">
              <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Invoice Number</div>
              <div className="text-lg font-bold text-gray-900">{invoice.invoiceNo}</div>
              <div className="text-sm text-gray-500 flex md:justify-end items-center gap-1.5 mt-1">
                <FiCalendar size={14} />
                <span>Date: {invoice.date}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h4>
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <FiUser className="text-gray-400" size={16} />
                <span>{invoice.customer}</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Method: <span className="font-semibold text-gray-800">{invoice.paymentMethod}</span></p>
                <p>Status: <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">PAID</span></p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product Details</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {item.productName || item.product || `Product Code: ${item.productId || "N/A"}`}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {item.quantity || item.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ₹{(item.unitPrice || item.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                        ₹{((item.totalPrice || ((item.quantity || item.qty || 1) * (item.unitPrice || item.price || 0)))).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No items specified for this transaction.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-80 space-y-3 bg-gray-50 p-5 rounded-2xl">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{(invoice.subTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span className="font-semibold">- ₹{(invoice.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span className="font-semibold text-gray-900">₹{(invoice.tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-gray-200 my-2 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-blue-600">
                  ₹{(invoice.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4.5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-semibold text-sm cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => onPrint(invoice)}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-sm cursor-pointer shadow-md"
          >
            <FiPrinter size={16} />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
}
