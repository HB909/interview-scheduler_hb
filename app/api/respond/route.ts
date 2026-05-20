import { NextRequest, NextResponse } from 'next/server'
import { saveResponse } from '@/lib/kv'

export async function POST(req: NextRequest) {
  const { sessionId, candidateName, selectedSlots } = await req.json()
  await saveResponse(sessionId, {
    sessionId,
    candidateName,
    selectedSlots,
    submittedAt: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}
