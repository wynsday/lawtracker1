import type { Decision } from '../types/bill'

export default function Decisions({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="decisions">
      {decisions.map((d, i) => (
        <div key={i} className="decision-item">
          <span className="decision-label">{d.label}:</span> {d.text}
        </div>
      ))}
    </div>
  )
}
