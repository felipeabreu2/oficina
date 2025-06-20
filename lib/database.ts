import { prisma } from "./prisma"

// Company context for multi-tenancy
export class DatabaseService {
  private companyId: string

  constructor(companyId: string) {
    this.companyId = companyId
  }

  // Products
  async getProducts() {
    return await prisma.product.findMany({
      where: { companyId: this.companyId },
      orderBy: { createdAt: "desc" },
    })
  }

  async createProduct(data: {
    code: string
    type: string
    brand: string
    model: string
    size: string
    price: number
    costPrice?: number
    stock: number
    minStock?: number
    conditionRating?: number
  }) {
    return await prisma.product.create({
      data: {
        ...data,
        companyId: this.companyId,
      },
    })
  }

  async updateProduct(id: string, data: any) {
    return await prisma.product.update({
      where: { id, companyId: this.companyId },
      data,
    })
  }

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id, companyId: this.companyId },
    })
  }

  // Clients
  async getClients() {
    return await prisma.client.findMany({
      where: { companyId: this.companyId },
      include: {
        vehicles: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async createClient(data: {
    code: string
    name: string
    document: string
    phone: string
    email?: string
    address?: string
    vehicles?: any[]
  }) {
    const { vehicles, ...clientData } = data

    return await prisma.client.create({
      data: {
        ...clientData,
        companyId: this.companyId,
        vehicles: vehicles
          ? {
              create: vehicles.map((vehicle) => ({
                ...vehicle,
                companyId: this.companyId,
              })),
            }
          : undefined,
      },
      include: {
        vehicles: true,
      },
    })
  }

  async updateClient(id: string, data: any) {
    const { vehicles, ...clientData } = data

    return await prisma.client.update({
      where: { id, companyId: this.companyId },
      data: {
        ...clientData,
        vehicles: vehicles
          ? {
              deleteMany: {},
              create: vehicles.map((vehicle: any) => ({
                ...vehicle,
                companyId: this.companyId,
              })),
            }
          : undefined,
      },
      include: {
        vehicles: true,
      },
    })
  }

  async deleteClient(id: string) {
    return await prisma.client.delete({
      where: { id, companyId: this.companyId },
    })
  }

  // Sales
  async getSales() {
    return await prisma.sale.findMany({
      where: { companyId: this.companyId },
      include: {
        client: true,
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async createSale(data: {
    code: string
    clientId: string
    items: any[]
    subtotal: number
    generalDiscount: number
    total: number
    paymentMethod: string
    saleDate: string
  }) {
    const { items, ...saleData } = data

    return await prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          ...saleData,
          companyId: this.companyId,
          saleDate: new Date(saleData.saleDate),
        },
      })

      // Create sale items and update stock
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.quantity * item.unitPrice - item.discount,
          },
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            companyId: this.companyId,
            productId: item.productId,
            type: "SAIDA",
            quantity: -item.quantity,
            reason: `Venda ${sale.code}`,
            referenceId: sale.id,
          },
        })
      }

      // Update client total spent
      await tx.client.update({
        where: { id: data.clientId },
        data: {
          totalSpent: {
            increment: data.total,
          },
          lastPurchase: new Date(data.saleDate),
        },
      })

      return sale
    })
  }

  // Budgets
  async getBudgets() {
    return await prisma.budget.findMany({
      where: { companyId: this.companyId },
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async createBudget(data: {
    code: string
    clientId: string
    items: any[]
    subtotal: number
    generalDiscount: number
    total: number
    validityDate: string
  }) {
    const { items, ...budgetData } = data

    return await prisma.budget.create({
      data: {
        ...budgetData,
        companyId: this.companyId,
        validityDate: new Date(budgetData.validityDate),
        budgetItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.quantity * item.unitPrice - item.discount,
          })),
        },
      },
      include: {
        budgetItems: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  async convertBudgetToSale(budgetId: string, paymentMethod: string) {
    return await prisma.$transaction(async (tx) => {
      const budget = await tx.budget.findUnique({
        where: { id: budgetId, companyId: this.companyId },
        include: {
          budgetItems: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!budget) throw new Error("Budget not found")

      // Generate sale code
      const saleCount = await tx.sale.count({
        where: { companyId: this.companyId },
      })
      const saleCode = `V${String(saleCount + 1).padStart(3, "0")}`

      // Create sale from budget
      const sale = await tx.sale.create({
        data: {
          companyId: this.companyId,
          code: saleCode,
          clientId: budget.clientId,
          budgetId: budget.id,
          subtotal: budget.subtotal,
          generalDiscount: budget.generalDiscount,
          total: budget.total,
          paymentMethod: paymentMethod as any,
          saleDate: new Date(),
        },
      })

      // Create sale items and update stock
      for (const budgetItem of budget.budgetItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: budgetItem.productId,
            quantity: budgetItem.quantity,
            unitPrice: budgetItem.unitPrice,
            discount: budgetItem.discount,
            total: budgetItem.total,
          },
        })

        // Update product stock
        await tx.product.update({
          where: { id: budgetItem.productId },
          data: {
            stock: {
              decrement: budgetItem.quantity,
            },
          },
        })

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            companyId: this.companyId,
            productId: budgetItem.productId,
            type: "SAIDA",
            quantity: -budgetItem.quantity,
            reason: `Venda ${sale.code} (convertido do orçamento ${budget.code})`,
            referenceId: sale.id,
          },
        })
      }

      // Update budget status
      await tx.budget.update({
        where: { id: budgetId },
        data: { status: "CONVERTIDO" },
      })

      // Update client total spent
      await tx.client.update({
        where: { id: budget.clientId },
        data: {
          totalSpent: {
            increment: budget.total,
          },
          lastPurchase: new Date(),
        },
      })

      return sale
    })
  }

  // Installments
  async getInstallments() {
    return await prisma.installment.findMany({
      where: { companyId: this.companyId },
      include: {
        sale: {
          include: {
            client: true,
          },
        },
        installmentPayments: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async createInstallment(data: {
    saleId: string
    code: string
    totalValue: number
    installmentCount: number
    firstDueDate: string
  }) {
    return await prisma.$transaction(async (tx) => {
      const installment = await tx.installment.create({
        data: {
          companyId: this.companyId,
          saleId: data.saleId,
          code: data.code,
          totalValue: data.totalValue,
          paidValue: 0,
          remainingValue: data.totalValue,
          installmentCount: data.installmentCount,
        },
      })

      // Create installment payments
      const installmentValue = data.totalValue / data.installmentCount
      const firstDueDate = new Date(data.firstDueDate)

      for (let i = 0; i < data.installmentCount; i++) {
        const dueDate = new Date(firstDueDate)
        dueDate.setMonth(dueDate.getMonth() + i)

        await tx.installmentPayment.create({
          data: {
            installmentId: installment.id,
            installmentNumber: i + 1,
            value: installmentValue,
            dueDate,
          },
        })
      }

      return installment
    })
  }

  // Stock movements
  async getStockMovements() {
    return await prisma.stockMovement.findMany({
      where: { companyId: this.companyId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  }

  async createStockMovement(data: {
    productId: string
    type: string
    quantity: number
    reason: string
    referenceId?: string
  }) {
    return await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          ...data,
          companyId: this.companyId,
        },
      })

      // Update product stock
      const updateData =
        data.type === "ENTRADA"
          ? { stock: { increment: Math.abs(data.quantity) } }
          : { stock: { decrement: Math.abs(data.quantity) } }

      await tx.product.update({
        where: { id: data.productId },
        data: updateData,
      })

      return movement
    })
  }

  // Services
  async getServices() {
    return await prisma.service.findMany({
      where: { companyId: this.companyId },
      include: {
        client: true,
        vehicle: true,
        serviceItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { serviceDate: "desc" },
    })
  }

  async createService(data: {
    code: string
    clientId: string
    vehicleId?: string
    serviceDate: string
    serviceTime?: string
    description: string
    observations?: string
    items?: any[]
  }) {
    const { items, ...serviceData } = data

    return await prisma.service.create({
      data: {
        ...serviceData,
        companyId: this.companyId,
        serviceDate: new Date(serviceData.serviceDate),
        serviceTime: serviceData.serviceTime ? serviceData.serviceTime : undefined,
        totalValue: items ? items.reduce((sum, item) => sum + item.total, 0) : 0,
        serviceItems: items
          ? {
              create: items.map((item) => ({
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              })),
            }
          : undefined,
      },
      include: {
        serviceItems: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  // Accounts receivable
  async getAccountsReceivable() {
    return await prisma.accountsReceivable.findMany({
      where: { companyId: this.companyId },
      include: {
        client: true,
        installmentPayment: true,
      },
      orderBy: { dueDate: "asc" },
    })
  }

  // Accounts payable
  async getAccountsPayable() {
    return await prisma.accountsPayable.findMany({
      where: { companyId: this.companyId },
      orderBy: { dueDate: "asc" },
    })
  }

  async createAccountPayable(data: {
    supplierName: string
    description: string
    category: string
    value: number
    dueDate: string
  }) {
    return await prisma.accountsPayable.create({
      data: {
        ...data,
        companyId: this.companyId,
        dueDate: new Date(data.dueDate),
      },
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    const [totalProducts, totalClients, totalSales, lowStockProducts, pendingReceivables, pendingPayables] =
      await Promise.all([
        prisma.product.count({ where: { companyId: this.companyId } }),
        prisma.client.count({ where: { companyId: this.companyId } }),
        prisma.sale.aggregate({
          where: { companyId: this.companyId },
          _sum: { total: true },
        }),
        prisma.product.findMany({
          where: {
            companyId: this.companyId,
            stock: { lte: prisma.product.fields.minStock },
          },
        }),
        prisma.accountsReceivable.aggregate({
          where: {
            companyId: this.companyId,
            status: "PENDENTE",
          },
          _sum: { value: true },
        }),
        prisma.accountsPayable.aggregate({
          where: {
            companyId: this.companyId,
            status: "PENDENTE",
          },
          _sum: { value: true },
        }),
      ])

    return {
      totalProducts,
      totalClients,
      totalSales: totalSales._sum.total || 0,
      lowStockProducts,
      pendingReceivables: pendingReceivables._sum.value || 0,
      pendingPayables: pendingPayables._sum.value || 0,
    }
  }
}

// Helper function to get database service with company context
export function getDbService(companyId: string) {
  return new DatabaseService(companyId)
}
