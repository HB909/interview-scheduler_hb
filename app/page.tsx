'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['월', '화', '수', '목', '금']
const TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

type Slot = { day: string; time: string }

export default function Home() {
  const router = useRouter()
  const [candidateName, setCandidateName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [generatedId, setGeneratedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const key = (day: string, time: string) => `${day}__${time}`

  const toggle = (day: string, time: string) => {
    const k = key(day, time)
    setSelected(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  const handleCreate = async () => {
    if (!candidateName.trim() || !jobTitle.trim() || selected.size === 0) return
    setLoading(true)
    const slots: Slot[] = [...selected].map(k => {
      const [day, time] = k.split('__')
      return { day, time }
    })
    const res = await fetch('/api/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateName, jobTitle, slots }),
    })
    const data = await res.json()
    setGeneratedId(data.id)
    setLoading(false)
  }

  const link = generatedId ? `${window.location.origin}/s/${generatedId}` : ''
  const adminLink = generatedId ? `${window.location.origin}/admin/${generatedId}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const colCount = DAYS.length + 1

  return (
    <div className="container">
      <div className="page-header">
        <div className="label">Aents 면접 일정 조율</div>
        <h1>새 일정 조율 링크 만들기</h1>
        <p>후보 시간을 설정하고 지원자에게 링크를 공유하세요</p>
      </div>

      <div className="card">
        <div className="section-title">지원자 정보</div>
        <div className="input-row">
          <div className="input-group">
            <label>이름</label>
            <input type="text" placeholder="김민준" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>직무</label>
            <input type="text" placeholder="백엔드 개발자" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
          </div>
        </div>

        <div className="divider" />

        <div className="section-title" style={{ marginBottom: 6 }}>면접 후보 시간 선택</div>
        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 12 }}>
          클릭해서 후보 시간을 선택하세요 · {selected.size}개 선택됨
        </p>

        <div
          className="slot-grid"
          style={{ gridTemplateColumns: `64px repeat(${DAYS.length}, 1fr)` }}
        >
          <div />
          {DAYS.map(d => (
            <div key={d} className="slot-day-label">{d}</div>
          ))}
          {TIMES.map(time => (
            <>
              <div key={`t-${time}`} className="slot-time-label">{time}</div>
              {DAYS.map(day => {
                const k = key(day, time)
                return (
                  <div
                    key={k}
                    className={`slot-cell${selected.has(k) ? ' active' : ''}`}
                    onClick={() => toggle(day, time)}
                  />
                )
              })}
            </>
          ))}
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading || !candidateName.trim() || !jobTitle.trim() || selected.size === 0}
          >
            {loading ? '생성 중...' : '링크 생성 →'}
          </button>
        </div>
      </div>

      {generatedId && (
        <div className="card">
          <div className="section-title">생성 완료</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            아래 링크를 지원자에게 보내주세요
          </p>
          <div className="link-box" style={{ marginBottom: 8 }}>
            <code>{link}</code>
            <button className="btn btn-sm" onClick={copyLink}>
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          </div>
          <div className="link-box" style={{ marginBottom: 16 }}>
            <code style={{ color: 'var(--text-secondary)' }}>{adminLink} (결과 확인)</code>
            <button className="btn btn-sm" onClick={() => router.push(`/admin/${generatedId}`)}>
              열기
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-hint)' }}>
            * 결과 확인 링크는 본인만 보관하세요
          </p>
        </div>
      )}
    </div>
  )
}
