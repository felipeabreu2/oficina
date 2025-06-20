import { type NextRequest, NextResponse } from "next/server"
import { getDbService } from "@/lib/database"

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const db = getDbService(COMPANY_ID)

    const client = await db.updateClient(params.id, data)
    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbService(COMPANY_ID)
    await db.deleteClient(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
