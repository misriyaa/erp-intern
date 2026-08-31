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
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }).catch(() => []);

    // Collect all product IDs to resolve product names
    const productIds = [...new Set(invoices.flatMap(inv => (inv.items || []).map(item => item.productId)))];
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    }).catch(() => []) : [];
    
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    const enrichedInvoices = await Promise.all(
      invoices.map(async (inv) => {
        let customerName = "Walk-in Customer";
        let customerPhone = "";
        let customerEmail = "";
        if (inv.customerId) {
          const customer = await prisma.customer.findUnique({
            where: { id: inv.customerId },
            select: { name: true, phone: true, email: true },
          }).catch(() => null);
          if (customer) {
            customerName = customer.name;
            customerPhone = customer.phone || "";
            customerEmail = customer.email || "";
          }
        }

        let salesOrderNumber = null;
        if (inv.salesOrderId) {
          const so = await prisma.salesOrder.findUnique({
            where: { id: inv.salesOrderId },
            select: { orderNumber: true },
          }).catch(() => null);
          if (so) {
            salesOrderNumber = so.orderNumber;
          }
        }

        const enrichedItems = (inv.items || []).map((item) => ({
          ...item,
          productName: productMap[item.productId] || "Walk-in Product",
        }));

        return {
          ...inv,
          items: enrichedItems,
          customerName,
          customer: customerName,
          customerPhone,
          customerEmail,
          salesOrderNumber: salesOrderNumber || inv.invoiceNumber,
          referenceNumber: salesOrderNumber || inv.invoiceNumber,
          total: Number(inv.totalAmount || 0),
          totalAmount: Number(inv.totalAmount || 0),
          date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split("T")[0] : new Date(inv.createdAt).toISOString().split("T")[0],
          invoiceNo: inv.invoiceNumber,
        };
      })
    );

    // Also include sales orders as invoices so no transaction is missed
    const salesOrders = await prisma.salesOrder.findMany({
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    const salesInvoices = await Promise.all(
      salesOrders.map(async (so) => {
        const invNum = `INV-${so.orderNumber.replace(/^SO-/, "")}`;
        if (enrichedInvoices.some((i) => i.invoiceNumber === invNum || i.salesOrderId === so.id || i.invoiceNo === invNum || i.id === so.id)) {
          return null;
        }

        let customerName = "Walk-in Customer";
        let customerPhone = "";
        let customerEmail = "";
        if (so.customerId) {
          const customer = await prisma.customer.findUnique({
            where: { id: so.customerId },
            select: { name: true, phone: true, email: true },
          }).catch(() => null);
          if (customer) {
            customerName = customer.name;
            customerPhone = customer.phone || "";
            customerEmail = customer.email || "";
          }
        }

        return {
          id: so.id,
          companyId: so.companyId,
          branchId: so.branchId,
          salesOrderId: so.id,
          customerId: so.customerId,
          invoiceNumber: invNum,
          invoiceNo: invNum,
          customerName,
          customer: customerName,
          customerPhone,
          customerEmail,
          salesOrderNumber: so.orderNumber,
          referenceNumber: so.orderNumber,
          date: so.orderDate ? new Date(so.orderDate).toISOString().split("T")[0] : new Date(so.createdAt).toISOString().split("T")[0],
          subtotal: Number(so.totalAmount || 0),
          taxAmount: Number(so.taxAmount || 0),
          discountAmount: Number(so.discountAmount || 0),
          totalAmount: Number(so.netAmount || so.totalAmount || 0),
          total: Number(so.netAmount || so.totalAmount || 0),
          paidAmount: Number(so.netAmount || so.totalAmount || 0),
          balanceAmount: 0,
          paymentStatus: so.status === "COMPLETED" ? "PAID" : (so.status === "CANCELLED" ? "CANCELLED" : "PENDING"),
          status: so.status || "PAID",
          notes: `Sales Order ${so.orderNumber}`,
          items: [],
        };
      })
    );

    const nonNullSalesInvoices = salesInvoices.filter(Boolean);
    return [...enrichedInvoices, ...nonNullSalesInvoices];
  }

  // ==========================================
  // Get Invoice By ID
  // ==========================================
  async findById(id) {
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    }).catch(() => null);

    if (!inv) return null;

    // Collect product IDs to resolve product names
    const productIds = [...new Set((inv.items || []).map(item => item.productId))];
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    }).catch(() => []) : [];
    
    const productMap = products.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    const enrichedItems = (inv.items || []).map((item) => ({
      ...item,
      productName: productMap[item.productId] || "Walk-in Product",
    }));

    let customerName = "Walk-in Customer";
    let customerPhone = "";
    let customerEmail = "";
    if (inv.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: inv.customerId },
        select: { name: true, phone: true, email: true },
      }).catch(() => null);
      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone || "";
        customerEmail = customer.email || "";
      }
    }

    let salesOrderNumber = null;
    if (inv.salesOrderId) {
      const so = await prisma.salesOrder.findUnique({
        where: { id: inv.salesOrderId },
        select: { orderNumber: true },
      }).catch(() => null);
      if (so) {
        salesOrderNumber = so.orderNumber;
      }
    }

    return {
      ...inv,
      items: enrichedItems,
      customerName,
      customer: customerName,
      customerPhone,
      customerEmail,
      salesOrderNumber: salesOrderNumber || inv.invoiceNumber,
      referenceNumber: salesOrderNumber || inv.invoiceNumber,
      total: Number(inv.totalAmount || 0),
      date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split("T")[0] : new Date(inv.createdAt).toISOString().split("T")[0],
      invoiceNo: inv.invoiceNumber,
    };
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