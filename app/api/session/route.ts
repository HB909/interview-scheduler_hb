import { NextRequest, NextResponse } from 'next/server'
import { getSession, getResponses } from '@/lib/kv'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'no id' }, { status: 400 })
  const session = await getSession(id)
  if (!session) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const responses = await getResponses(id)
  return NextResponse.json({ session, responses })
}
