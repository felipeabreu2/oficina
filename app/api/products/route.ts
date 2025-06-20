import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

// Mock company ID - in real app, get from auth session
const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const db = getDbService(COMPANY_ID)
    const products = await db.getProducts()

    // Transform to match frontend interface
    const transformedProducts = products.map((product) => ({
      id: product.id,
      type: product.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      brand: product.brand,
      model: product.model,
      size: product.size,
      price: Number(product.price),
      stock: product.stock,
      condition: product.conditionRating,
      minStock: product.minStock,
      costPrice: product.costPrice ? Number(product.costPrice) : undefined,
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = getDbService(COMPANY_ID)

    // Generate product code
    const products = await db.getProducts()
    const code = `P${String(products.length + 1).padStart(3, "0")}`

    // Transform type to enum format
    const typeMap: Record<string, string> = {
      "Pneu Novo": "PNEU_NOVO",
      "Pneu Usado": "PNEU_USADO",
      "Pneu Remold": "PNEU_REMOLD",
      "Peças/Utensílios": "PECAS_UTENSILIOS",
      Serviço: "SERVICO",
    }

    const product = await db.createProduct({
      code,
      type: typeMap[data.type] || "PNEU_NOVO",
      brand: data.brand,
      model: data.model,
      size: data.size,
      price: data.price,
      costPrice: data.costPrice,
      stock: data.stock,
      minStock: data.minStock,
      conditionRating: data.condition,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
