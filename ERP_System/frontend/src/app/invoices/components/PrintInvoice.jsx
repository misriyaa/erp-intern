"use client";

import { useCompany } from "@/context/CompanyContext";
import { useSettings } from "@/context/SettingsContext";

export default function PrintInvoice({ invoice }) {
  const { company } = useCompany();
  const { settings } = useSettings();

  if (!invoice) return null;

  const companyName = company?.name || settings?.companyName || "ERP SUPERMARKET";
  const companyPhone = company?.phone || settings?.companyPhone || "";
  const companyAddress = company?.address || settings?.companyAddress || "";

  return (
    <div className="hidden print:block bg-white text-black p-4 font-mono text-[12px] leading-relaxed w-[80mm] max-w-[80mm] mx-auto min-h-screen">
      {/* Supermarket Header */}
      <div className="text-center space-y-1 mb-4">
        <h1 className="text-base font-black uppercase tracking-wider">{companyName}</h1>
        {companyAddress && <p className="text-[10px] text-gray-700 font-medium">{companyAddress}</p>}
        {companyPhone && <p className="text-[10px] text-gray-700">Tel: {companyPhone}</p>}
        <p className="text-[11px] font-bold mt-2 uppercase tracking-widest border-y border-dashed border-black py-1">
          Cash Receipt
        </p>
      </div>

      {/* Invoice Meta */}
      <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-2 mb-3">
        <div className="flex justify-between">
          <span>Invoice No:</span>
          <span className="font-bold">{invoice.invoiceNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Date/Time:</span>
          <span>{invoice.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{invoice.cashier || "Admin"}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-semibold">{invoice.customer}</span>
        </div>
      </div>

      {/* Items Table Headers */}
      <div className="text-[11px] font-bold border-b border-dashed border-black pb-1 mb-2">
        <div className="grid grid-cols-12 gap-1 text-left">
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Rate</span>
          <span className="col-span-2 text-right">Total</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5 text-[11px] border-b border-dashed border-black pb-3 mb-3">
        {invoice.items && invoice.items.length > 0 ? (
          invoice.items.map((item, idx) => {
            const name = item.productName || item.product || `Item #${item.productId?.slice(0, 4) || ""}`;
            const qty = item.quantity || item.qty || 1;
            const rate = item.unitPrice || item.price || 0;
            const total = item.totalPrice || (qty * rate);

            return (
              <div key={idx} className="space-y-0.5">
                {/* Item Name (Long names wrap nicely) */}
                <div className="font-bold text-gray-900 uppercase leading-none">{name}</div>
                {/* Qty, Rate, Total Line */}
                <div className="grid grid-cols-12 gap-1 text-gray-700">
                  <span className="col-span-6 text-[10px]">Code: {item.productId?.slice(0, 8) || "POS-ITEM"}</span>
                  <span className="col-span-2 text-center">{qty}</span>
                  <span className="col-span-2 text-right">{rate.toFixed(2)}</span>
                  <span className="col-span-2 text-right font-bold text-black">{total.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-2 text-gray-500">No items registered</div>
        )}
      </div>

      {/* Pricing Summary Breakdown */}
      <div className="space-y-1.5 text-[11px] border-b border-dashed border-black pb-3 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{(invoice.subTotal || 0).toFixed(2)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span>- ₹{(invoice.discount || 0).toFixed(2)}</span>
          </div>
        )}
        {invoice.tax > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Tax:</span>
            <span>₹{(invoice.tax || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-1 border-t border-dotted border-gray-400">
          <span>Grand Total:</span>
          <span>₹{(invoice.total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Supermarket Payment Footer */}
      <div className="text-[11px] space-y-1 border-b border-dashed border-black pb-3 mb-4">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="font-bold uppercase">{invoice.paymentMethod || "CASH"}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Status:</span>
          <span className="font-bold text-green-700 bg-green-50 px-1.5 rounded">PAID</span>
        </div>
      </div>

      {/* Custom centered notes/footer */}
      <div className="text-center text-[10px] space-y-1.5 pt-2">
        <p className="font-bold">*** THANK YOU FOR SHOPPING ***</p>
        <p>Please check your items before leaving the counter.</p>
        <p className="text-[9px] text-gray-500">System generated invoice. No signature required.</p>
      </div>
    </div>
  );
}
