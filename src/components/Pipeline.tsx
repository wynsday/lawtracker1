import type { CSSProperties } from 'react'
import type { Bill } from '../types/bill'
import { FEDERAL_STAGES, MICHIGAN_STAGES, LOCAL_STAGES } from '../lib/constants'

function fmtDate(s: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + 'T00:00:00')
    const day = String(d.getDate()).padStart(2, '0')
    const mon = d.toLocaleDateString('en-US', { month: 'short' })
    const yy = String(d.getFullYear()).slice(2)
    return `${day} ${mon} ${yy}`
  }
  if (/^\d{4}-\d{2}$/.test(s)) {
    const d = new Date(s + '-01T00:00:00')
    const mon = d.toLocaleDateString('en-US', { month: 'short' })
    const yy = String(d.getFullYear()).slice(2)
    return `${mon} ${yy}`
  }
  return s
}

function pipelineColor(policyBias: number): string {
  if (policyBias < 40) return '#C84040'
  if (policyBias > 60) return '#3060C0'
  return '#764AAB'
}

export default function Pipeline({ bill }: { bill: Bill }) {
  const stages = bill.level === 'federal' ? FEDERAL_STAGES
               : bill.level === 'local'   ? LOCAL_STAGES
               : MICHIGAN_STAGES
  const isStalled = bill.urgency === 'stalled'
  const dates = bill.stage_dates ?? []

  const activeColor = pipelineColor(bill.policy_bias)

  return (
    <div className="pipeline-section">
      <div className="pipeline-head">Legislative path</div>
      <div className="pipeline">
        {stages.map((label, i) => {
          const isDone  = i < bill.stage
          const isCurr  = i === bill.stage && !isStalled
          const isStall = i === bill.stage && isStalled

          let cls = 'pipe-step'
          if (isDone)       cls += ' done'
          else if (isCurr)  cls += ' curr'
          else if (isStall) cls += ' stalled'

          const stepStyle = (isDone || isCurr)
            ? { '--pipe-active-color': activeColor } as CSSProperties
            : undefined

          const dotStyle: CSSProperties = (isDone || isCurr)
            ? { background: activeColor, borderColor: activeColor }
            : {}

          return (
            <div key={i} className={cls} style={stepStyle}>
              <div className="pipe-dot" style={dotStyle} />
              <div className="pipe-label">
                {label}
                {dates[i] && <div className="pipe-date">{fmtDate(dates[i]!)}</div>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="stage-note">{bill.stage_note}</div>
    </div>
  )
}
