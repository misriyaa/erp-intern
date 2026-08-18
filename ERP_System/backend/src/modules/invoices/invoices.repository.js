import prisma from "../../config/prisma.js";

class InvoiceRepository {
  // ==========================================
  // Create Invoice
  // ==========================================
  async create(data) {
    return await prisma.invoice.create({
      data,
    });
  }

  // ==========================================
  // Get All Invoices
  // ==========================================
  async findAll() {
    return await prisma.invoice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ==========================================
  // Get Invoice By ID
  // ==========================================
  async findById(id) {
    return await prisma.invoice.findUnique({
      where: {
        id,
      },
    });
  }

  // ==========================================
  // Find By Invoice Number
  // ==========================================
  async findByInvoiceNumber(invoiceNumber) {
    return await prisma.invoice.findUnique({
      where: {
        invoiceNumber,
      },
    });
  }

  // ==========================================
  // Find By Customer
  // ==========================================
  async findByCustomer(customerId) {
    return await prisma.invoice.findMany({
      where: {
        customerId,
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });
  }

  // ==========================================
  // Find By Branch
  // ==========================================
  async findByBranch(branchId) {
    return await prisma.invoice.findMany({
      where: {
        branchId,
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });
  }

  // ==========================================
  // Find By Payment Status
  // ==========================================
  async findByPaymentStatus(paymentStatus) {
    return await prisma.invoice.findMany({
      where: {
        paymentStatus,
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });
  }

  // ==========================================
  // Find By Invoice Status
  // ==========================================
  async findByStatus(status) {
    return await prisma.invoice.findMany({
      where: {
        status,
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });
  }

  // ==========================================
  // Update Invoice
  // ==========================================
  async update(id, data) {
    return await prisma.invoice.update({
      where: {
        id,
      },
      data,
    });
  }

  // ==========================================
  // Update Invoice Status
  // ==========================================
  async updateStatus(id, status) {
    return await prisma.invoice.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  // ==========================================
  // Delete Invoice
  // ==========================================
  async delete(id) {
    return await prisma.invoice.delete({
      where: {
        id,
      },
    });
  }

  // ==========================================
  // Count Invoices
  // ==========================================
  async count() {
    return await prisma.invoice.count();
  }
}

export default new InvoiceRepository();