import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  const session = await getUserSession()

  return NextResponse.json({
    authenticated: !!session,
    user: session ? session.user : null,
  })
}
