import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const db = getDbService(COMPANY_ID)
    const sales = await db.getSales()

    // Transform to match frontend interface
    const transformedSales = sales.map((sale) => ({
      id: sale.id,
      clientId: sale.clientId,
      client: sale.client.name,
      items: sale.saleItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: `${item.product.brand} ${item.product.model}`,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
      })),
      subtotal: Number(sale.subtotal),
      generalDiscount: Number(sale.generalDiscount),
      total: Number(sale.total),
      date: sale.saleDate.toISOString().split("T")[0],
      payment: sale.paymentMethod.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      status: sale.status.charAt(0) + sale.status.slice(1).toLowerCase(),
    }))

    return NextResponse.json(transformedSales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = getDbService(COMPANY_ID)

    // Generate sale code
    const sales = await db.getSales()
    const code = `V${String(sales.length + 1).padStart(3, "0")}`

    // Transform payment method to enum format
    const paymentMap: Record<string, string> = {
      "À Vista": "A_VISTA",
      "Cartão de Crédito": "CARTAO_CREDITO",
      "Cartão de Débito": "CARTAO_DEBITO",
      PIX: "PIX",
      Crediário: "CREDIARIO",
      Boleto: "BOLETO",
    }

    const sale = await db.createSale({
      code,
      clientId: data.clientId,
      items: data.items,
      subtotal: data.subtotal,
      generalDiscount: data.generalDiscount,
      total: data.total,
      paymentMethod: paymentMap[data.payment] || "A_VISTA",
      saleDate: data.date,
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
