import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    await clearSession(response)
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
