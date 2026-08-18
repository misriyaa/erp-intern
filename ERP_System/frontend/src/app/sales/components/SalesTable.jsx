"use client";

import Link from "next/link";

export default function SalesTable({ sales = [] }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">

      <table className="min-w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="px-4 py-3 text-left">
              Invoice
            </th>

            <th className="px-4 py-3 text-left">
              Customer
            </th>

            <th className="px-4 py-3 text-left">
              Cashier
            </th>

            <th className="px-4 py-3 text-left">
              Date
            </th>

            <th className="px-4 py-3 text-center">
              Payment
            </th>

            <th className="px-4 py-3 text-center">
              Status
            </th>

            <th className="px-4 py-3 text-right">
              Total
            </th>

            <th className="px-4 py-3 text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {sales.length === 0 && (
            <tr>

              <td
                colSpan={8}
                className="text-center py-8 text-gray-500"
              >
                No Sales Found
              </td>

            </tr>
          )}

          {sales.map((sale) => {

            const statusColor =
              sale.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : sale.paymentStatus === "Pending"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700";

            return (

              <tr
                key={sale.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="px-4 py-4 font-semibold">
                  {sale.invoiceNo}
                </td>

                <td className="px-4 py-4">
                  {sale.customer}
                </td>

                <td className="px-4 py-4">
                  {sale.cashier}
                </td>

                <td className="px-4 py-4">
                  {sale.date}
                </td>

                <td className="px-4 py-4 text-center">
                  {sale.paymentMethod}
                </td>

                <td className="px-4 py-4 text-center">

                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                    {sale.paymentStatus}
                  </span>

                </td>

                <td className="px-4 py-4 text-right font-bold">
                  ₹{sale.total.toLocaleString()}
                </td>

                <td className="px-4 py-4">

                  <div className="flex justify-center gap-2">

                    <Link
                      href={`/sales/${sale.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      View
                    </Link>

                    

                  </div>

                </td>

              </tr>

            );
          })}

        </tbody>

      </table>

    </div>
  );
}