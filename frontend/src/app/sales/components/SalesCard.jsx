"use client";

export default function SalesCard({ sale }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl font-bold">
            {sale.invoiceNo}
          </h2>

          <p className="text-gray-500">
            {sale.date}
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-white ${
            sale.paymentStatus === "Paid"
              ? "bg-green-600"
              : sale.paymentStatus === "Pending"
              ? "bg-red-600"
              : "bg-yellow-500"
          }`}
        >
          {sale.paymentStatus}
        </span>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div>
          <h3 className="font-semibold text-gray-600">
            Customer
          </h3>
          <p>{sale.customer}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">
            Cashier
          </h3>
          <p>{sale.cashier}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-600">
            Payment
          </h3>
          <p>{sale.paymentMethod}</p>
        </div>

      </div>

      <table className="min-w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">Product</th>

            <th className="p-3 text-center">Qty</th>

            <th className="p-3 text-right">Price</th>

            <th className="p-3 text-right">Total</th>

          </tr>

        </thead>

        <tbody>

          {sale.items.map((item, index) => (

            <tr key={index} className="border-b">

              <td className="p-3">
                {item.product}
              </td>

              <td className="p-3 text-center">
                {item.qty}
              </td>

              <td className="p-3 text-right">
                ₹{item.price}
              </td>

              <td className="p-3 text-right font-semibold">
                ₹{item.qty * item.price}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="flex justify-end mt-8">

        <div className="bg-gray-100 rounded-lg p-6 w-80">

          <div className="flex justify-between mb-2">

            <span>Subtotal</span>

            <span>₹{sale.subTotal}</span>

          </div>

          <div className="flex justify-between mb-2">

            <span>Discount</span>

            <span>- ₹{sale.discount}</span>

          </div>

          <div className="flex justify-between mb-2">

            <span>Tax</span>

            <span>₹{sale.tax}</span>

          </div>

          <hr className="my-3"/>

          <div className="flex justify-between text-xl font-bold">

            <span>Grand Total</span>

            <span>₹{sale.total}</span>

          </div>

        </div>

      </div>

    </div>
  );
}