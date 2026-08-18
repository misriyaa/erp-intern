import invoiceRepository from "./invoices.repository.js";
import InvoiceSchema from "./invoices.schema.js";

class InvoiceService {
  // ==========================================
  // Create Invoice
  // ==========================================
  async createInvoice(data) {
    // Check duplicate invoice number
    const existingInvoice = await invoiceRepository.findByInvoiceNumber(
      data.invoiceNumber
    );

    if (existingInvoice) {
      throw new Error("Invoice Number already exists.");
    }

    // Calculate amounts
    const subtotal = Number(data.subtotal);
    const taxAmount = Number(data.taxAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const paidAmount = Number(data.paidAmount || 0);

    const totalAmount = subtotal + taxAmount - discountAmount;
    const balanceAmount = totalAmount - paidAmount;

    // Determine payment status
    let paymentStatus = "PENDING";

    if (paidAmount === totalAmount) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    const invoice = new InvoiceSchema({
      ...data,
      totalAmount,
      balanceAmount,
      paymentStatus,
    });

    return await invoiceRepository.create(invoice);
  }

  // ==========================================
  // Get All Invoices
  // ==========================================
  async getInvoices() {
    return await invoiceRepository.findAll();
  }

  // ==========================================
  // Get Invoice By ID
  // ==========================================
  async getInvoiceById(id) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    return invoice;
  }

  // ==========================================
  // Update Invoice
  // ==========================================
  async updateInvoice(id, data) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const subtotal = Number(data.subtotal);
    const taxAmount = Number(data.taxAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const paidAmount = Number(data.paidAmount || 0);

    const totalAmount = subtotal + taxAmount - discountAmount;
    const balanceAmount = totalAmount - paidAmount;

    let paymentStatus = "PENDING";

    if (paidAmount === totalAmount) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    return await invoiceRepository.update(id, {
      ...data,
      totalAmount,
      balanceAmount,
      paymentStatus,
    });
  }

  // ==========================================
  // Delete Invoice
  // ==========================================
  async deleteInvoice(id) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    return await invoiceRepository.delete(id);
  }

  // ==========================================
  // Update Invoice Status
  // ==========================================
  async updateStatus(id, status) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const allowedStatus = [
      "DRAFT",
      "ISSUED",
      "CANCELLED",
    ];

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid Invoice Status");
    }

    return await invoiceRepository.updateStatus(id, status);
  }

  // ==========================================
  // Get Customer Invoices
  // ==========================================
  async getCustomerInvoices(customerId) {
    return await invoiceRepository.findByCustomer(customerId);
  }

  // ==========================================
  // Get Payment Status
  // ==========================================
  async getPaymentStatus(status) {
    return await invoiceRepository.findByPaymentStatus(status);
  }

  // ==========================================
  // Get Invoice Statistics
  // ==========================================
  async getInvoiceCount() {
    return await invoiceRepository.count();
  }
}

export default new InvoiceService();