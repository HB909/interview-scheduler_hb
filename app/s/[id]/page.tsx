'use client'

import { useState, useEffect, use } from 'react'

type Slot = { day: string; time: string }
type Session = { id: string; candidateName: string; jobTitle: string; slots: Slot[] }

export default function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<Session | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const key = (slot: Slot) => `${slot.day}__${slot.time}`

  useEffect(() => {
    fetch(`/api/session?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); setLoading(false); return }
        setSession(data.session)
        setLoading(false)
      })
  }, [id])

  const toggle = (slot: Slot) => {
    const k = key(slot)
    setSelected(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!session || selected.size === 0) return
    setSubmitting(true)
    const selectedSlots = session.slots.filter(s => selected.has(key(s)))
    await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, candidateName: session.candidateName, selectedSlots }),
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="container">
      <div className="empty">불러오는 중...</div>
    </div>
  )

  if (notFound) return (
    <div className="container">
      <div className="empty">링크가 만료되었거나 존재하지 않습니다</div>
    </div>
  )

  if (submitted) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>제출 완료</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          가능한 시간을 알려주셔서 감사합니다.<br />일정이 확정되면 별도로 연락드리겠습니다.
        </p>
      </div>
    </div>
  )

  if (!session) return null

  const days = [...new Set(session.slots.map(s => s.day))]
  const times = [...new Set(session.slots.map(s => s.time))].sort()

  return (
    <div className="container">
      <div className="page-header">
        <div className="label">주식회사 엔츠 · 면접 일정 조율</div>
        <h1>{session.jobTitle} 면접</h1>
        <p>{session.candidateName}님, 가능한 일정을 선택 부탁드립니다</p>
      </div>

      <div className="card">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-border)' }} />
            후보 시간
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)' }} />
            선택됨
          </div>
        </div>

        <div
          className="slot-grid"
          style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}
        >
          <div />
          {days.map(d => <div key={d} className="slot-day-label">{d}</div>)}

          {times.map(time => (
            <>
              <div key={`t-${time}`} className="slot-time-label">{time}</div>
              {days.map(day => {
                const slot = session.slots.find(s => s.day === day && s.time === time)
                const k = slot ? key(slot) : null
                const isOpen = !!slot
                const isChosen = k ? selected.has(k) : false
                return (
                  <div
                    key={`${day}-${time}`}
                    className={`slot-cell${!isOpen ? ' none-open' : isChosen ? ' chosen' : ' open'}`}
                    onClick={() => slot && toggle(slot)}
                  />
                )
              })}
            </>
          ))}
        </div>

        <div className="btn-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {selected.size}개 선택됨
          </span>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || selected.size === 0}
          >
            {submitting ? '제출 중...' : '제출하기 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
