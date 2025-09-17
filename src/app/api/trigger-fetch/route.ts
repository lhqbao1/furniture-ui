// app/api/trigger-fetch/route.ts
import { NextResponse } from "next/server"
import { triggerMerchantFetch } from "@/lib/googleMerchant"

export async function GET() {
  try {
    const result = await triggerMerchantFetch()
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error("Fetch failed", err)
    return NextResponse.json({ success: false, error: "Fetch failed" }, { status: 500 })
  }
}
