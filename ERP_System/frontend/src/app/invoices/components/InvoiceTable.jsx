"use client";

import { FiEye, FiPrinter } from "react-icons/fi";

export default function InvoiceTable({ invoices = [], onView, onPrint }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Invoice No
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Cashier
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-gray-500 font-medium">
                No Completed Invoices Found
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => {
              const statusColor = "bg-green-100 text-green-700 border border-green-200";

              return (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {invoice.invoiceNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {invoice.cashier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                    ₹{invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onView(invoice)}
                        className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 px-3.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm font-semibold cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={15} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onPrint(invoice)}
                        className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all text-sm font-semibold cursor-pointer"
                        title="Print Invoice"
                      >
                        <FiPrinter size={15} />
                        <span>Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
