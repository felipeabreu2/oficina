import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const db = getDbService(COMPANY_ID)
    const budgets = await db.getBudgets()

    // Transform to match frontend interface
    const transformedBudgets = budgets.map((budget) => ({
      id: budget.id,
      clientId: budget.clientId,
      client: budget.client.name,
      items: budget.budgetItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: `${item.product.brand} ${item.product.model}`,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
      })),
      subtotal: Number(budget.subtotal),
      generalDiscount: Number(budget.generalDiscount),
      total: Number(budget.total),
      date: budget.createdAt.toISOString().split("T")[0],
      validity: budget.validityDate.toISOString().split("T")[0],
      status: budget.status.charAt(0) + budget.status.slice(1).toLowerCase(),
    }))

    return NextResponse.json(transformedBudgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = getDbService(COMPANY_ID)

    // Generate budget code
    const budgets = await db.getBudgets()
    const code = `O${String(budgets.length + 1).padStart(3, "0")}`

    const budget = await db.createBudget({
      code,
      clientId: data.clientId,
      items: data.items,
      subtotal: data.subtotal,
      generalDiscount: data.generalDiscount,
      total: data.total,
      validityDate: data.validity,
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
