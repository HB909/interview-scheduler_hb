import { kv } from '@vercel/kv'

export type Slot = { day: string; time: string }

export type Session = {
  id: string
  candidateName: string
  jobTitle: string
  slots: Slot[]
  createdAt: string
}

export type Response = {
  sessionId: string
  candidateName: string
  selectedSlots: Slot[]
  submittedAt: string
}

export async function createSession(session: Session) {
  await kv.set(`session:${session.id}`, JSON.stringify(session), { ex: 60 * 60 * 24 * 30 })
}

export async function getSession(id: string): Promise<Session | null> {
  const raw = await kv.get<string>(`session:${id}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function saveResponse(sessionId: string, response: Response) {
  const key = `responses:${sessionId}`
  const existing = await kv.get<string>(key)
  const list: Response[] = existing
    ? typeof existing === 'string' ? JSON.parse(existing) : existing
    : []
  list.push(response)
  await kv.set(key, JSON.stringify(list), { ex: 60 * 60 * 24 * 30 })
}

export async function getResponses(sessionId: string): Promise<Response[]> {
  const raw = await kv.get<string>(`responses:${sessionId}`)
  if (!raw) return []
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}
