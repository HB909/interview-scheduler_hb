import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/kv'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const { candidateName, jobTitle, slots } = await req.json()
  const id = nanoid(8)
  await createSession({ id, candidateName, jobTitle, slots, createdAt: new Date().toISOString() })
  return NextResponse.json({ id })
}
