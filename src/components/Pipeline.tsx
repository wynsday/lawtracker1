import type { Bill } from '../types/bill'
import { FEDERAL_STAGES, MICHIGAN_STAGES, LOCAL_STAGES } from '../lib/constants'

export default function Pipeline({ bill }: { bill: Bill }) {
  const stages = bill.level === 'federal' ? FEDERAL_STAGES
               : bill.level === 'local'   ? LOCAL_STAGES
               : MICHIGAN_STAGES
  const isStalled = bill.urgency === 'stalled'
  const dates = bill.stage_dates ?? []

  return (
    <div className="pipeline-section">
      <div className="pipeline-head">Legislative path</div>
      <div className="pipeline">
        {stages.map((label, i) => {
          let cls = 'pipe-step'
          if (i < bill.stage)                  cls += ' done'
          else if (i === bill.stage && !isStalled) cls += ' curr'
          else if (i === bill.stage && isStalled)  cls += ' stalled'
          return (
            <div key={i} className={cls}>
              <div className="pipe-dot" />
              <div className="pipe-label">
                {label}
                {dates[i] && <div className="pipe-date">{dates[i]}</div>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="stage-note">{bill.stage_note}</div>
    </div>
  )
}
