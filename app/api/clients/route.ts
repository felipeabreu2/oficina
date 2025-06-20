import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const db = getDbService(COMPANY_ID)
    const clients = await db.getClients()

    // Transform to match frontend interface
    const transformedClients = clients.map((client) => ({
      id: client.id,
      name: client.name,
      document: client.document,
      phone: client.phone,
      email: client.email,
      address: client.address,
      vehicles: client.vehicles.map((vehicle) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        frontTires: vehicle.frontTires || "",
        rearTires: vehicle.rearTires || "",
      })),
      lastPurchase: client.lastPurchase?.toISOString().split("T")[0],
      totalSpent: Number(client.totalSpent),
    }))

    return NextResponse.json(transformedClients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = getDbService(COMPANY_ID)

    // Generate client code
    const clients = await db.getClients()
    const code = `C${String(clients.length + 1).padStart(3, "0")}`

    const client = await db.createClient({
      code,
      name: data.name,
      document: data.document,
      phone: data.phone,
      email: data.email,
      address: data.address,
      vehicles: data.vehicles,
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
