'use client'

import { useState, useEffect, use } from 'react'

type Slot = { day: string; time: string }
type Session = { id: string; candidateName: string; jobTitle: string; slots: Slot[] }
type Response = { candidateName: string; selectedSlots: Slot[]; submittedAt: string }

export default function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<Session | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/session?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setSession(data.session)
          setResponses(data.responses)
        }
        setLoading(false)
      })
  }, [id])

  const refresh = () => {
    setLoading(true)
    fetch(`/api/session?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setResponses(data.responses)
        setLoading(false)
      })
  }

  if (loading) return <div className="container"><div className="empty">불러오는 중...</div></div>
  if (!session) return <div className="container"><div className="empty">세션을 찾을 수 없습니다</div></div>

  const days = [...new Set(session.slots.map(s => s.day))]
  const times = [...new Set(session.slots.map(s => s.time))].sort()
  const total = responses.length

  const getCount = (day: string, time: string) =>
    responses.filter(r => r.selectedSlots.some(s => s.day === day && s.time === time)).length

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="label">관리자 · 결과 확인</div>
        <h1>{session.jobTitle} 면접</h1>
        <p>
          {session.candidateName}님 · 총 {total}명 응답
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>시간대별 현황</div>
          <button className="btn btn-sm" onClick={refresh}>새로고침</button>
        </div>

        {total === 0 ? (
          <div className="empty" style={{ padding: '2rem 0' }}>아직 응답이 없습니다</div>
        ) : (
          <>
            <div className="legend" style={{ marginBottom: 12 }}>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--green-light)', border: '1px solid var(--green)' }} />
                전원 가능
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--yellow-light)', border: '1px solid var(--yellow-border)' }} />
                일부 가능
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
                    const isSlot = session.slots.some(s => s.day === day && s.time === time)
                    if (!isSlot) return <div key={`${day}-${time}`} className="slot-cell none-open" />
                    const count = getCount(day, time)
                    const cls = count === total && total > 0 ? 'all' : count > 0 ? 'some' : ''
                    return (
                      <div key={`${day}-${time}`} className={`slot-cell ${cls}`}>
                        {count > 0 && (
                          <span className={`count-badge ${count === total ? 'green' : 'yellow'}`}>
                            {count}/{total}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="section-title">지원자별 응답</div>
        {responses.length === 0 ? (
          <div className="empty" style={{ padding: '1.5rem 0' }}>아직 응답이 없습니다</div>
        ) : (
          responses.map((r, i) => (
            <div key={i} className="response-item">
              <div>
                <div className="response-name">{r.candidateName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
                  {formatDate(r.submittedAt)}
                </div>
              </div>
              <div className="chips">
                {r.selectedSlots.map((s, j) => (
                  <span key={j} className="chip">{s.day} {s.time}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
