import { NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const db = getDbService(COMPANY_ID)
    const stats = await db.getDashboardStats()

    return NextResponse.json({
      totalProducts: stats.totalProducts,
      totalClients: stats.totalClients,
      totalSales: Number(stats.totalSales),
      stockAlerts: stats.lowStockProducts.map((product) => ({
        id: product.id,
        brand: product.brand,
        model: product.model,
        stock: product.stock,
        minStock: product.minStock,
      })),
      pendingReceivables: Number(stats.pendingReceivables),
      pendingPayables: Number(stats.pendingPayables),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
