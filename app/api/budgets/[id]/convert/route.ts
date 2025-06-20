import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { paymentMethod } = await request.json()
    const db = getDbService(COMPANY_ID)

    // Transform payment method to enum format
    const paymentMap: Record<string, string> = {
      "À Vista": "A_VISTA",
      "Cartão de Crédito": "CARTAO_CREDITO",
      "Cartão de Débito": "CARTAO_DEBITO",
      PIX: "PIX",
      Crediário: "CREDIARIO",
      Boleto: "BOLETO",
    }

    const sale = await db.convertBudgetToSale(params.id, paymentMap[paymentMethod] || "A_VISTA")
    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error converting budget to sale:", error)
    return NextResponse.json({ error: "Failed to convert budget" }, { status: 500 })
  }
}
