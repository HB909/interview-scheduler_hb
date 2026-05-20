import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

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

const EX = 60 * 60 * 24 * 30

export async function createSession(session: Session) {
  await redis.set(`session:${session.id}`, JSON.stringify(session), { ex: EX })
}

export async function getSession(id: string): Promise<Session | null> {
  const raw = await redis.get<string>(`session:${id}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function saveResponse(sessionId: string, response: Response) {
  const key = `responses:${sessionId}`
  const existing = await redis.get<string>(key)
  const list: Response[] = existing
    ? typeof existing === 'string' ? JSON.parse(existing) : existing
    : []
  list.push(response)
  await redis.set(key, JSON.stringify(list), { ex: EX })
}

export async function getResponses(sessionId: string): Promise<Response[]> {
  const raw = await redis.get<string>(`responses:${sessionId}`)
  if (!raw) return []
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}
