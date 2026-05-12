import type { CSSProperties } from 'react'

export type Theme     = 'dark' | 'light' | 'outline' | 'dots' | 'flash'
export type CardStyle = 'solid' | 'gradient'

interface Swatch {
  id:         Theme
  label:      string
  boxBg:      string
  boxBorder:  string
  labelColor: string
  dots?:      boolean
}

const SWATCHES: Swatch[] = [
  { id: 'dark',    label: 'Dark',    boxBg: '#1e1c2e', boxBorder: '2px solid transparent',  labelColor: '#f0eeff'          },
  { id: 'light',   label: 'Light',   boxBg: '#f5f0ff', boxBorder: '1px solid #c0b8e8',      labelColor: '#2d2840'          },
  { id: 'outline', label: 'Outline', boxBg: '#ffffff', boxBorder: '2px solid #4F4262',      labelColor: '#4F4262'          },
  { id: 'dots',    label: 'Dots',    boxBg: '#f5f0ff', boxBorder: '1px solid #c0b8e8',      labelColor: '#4F4262', dots: true },
  { id: 'flash',   label: 'B/W',     boxBg: '#000000', boxBorder: '2px solid transparent',  labelColor: '#FFC000'          },
]

interface Props {
  theme:             Theme
  cardStyle:         CardStyle
  onThemeChange:     (t: Theme)     => void
  onCardStyleChange: (s: CardStyle) => void
}

export default function ThemeSwitcher({ theme, cardStyle, onThemeChange, onCardStyleChange }: Props) {
  return (
    <div className="ts-wrap" role="group" aria-label="Theme controls">

      {/* Swatch row */}
      <div className="ts-swatches" role="radiogroup" aria-label="Select theme">
        {SWATCHES.map(sw => {
          const isActive = sw.id === theme
          const isFlash  = sw.id === 'flash'

          const boxStyle: CSSProperties = {
            background: sw.dots
              ? `radial-gradient(circle, rgba(79,66,98,.28) 1.2px, transparent 1.2px) #f5f0ff`
              : sw.boxBg,
            backgroundSize: sw.dots ? '6px 6px' : undefined,
            border: isActive && !isFlash
              ? '2px solid var(--color-text-primary)'
              : sw.boxBorder,
          }

          const labelStyle: CSSProperties = {
            color: sw.labelColor,
            textDecoration:      isActive && isFlash ? 'underline'  : undefined,
            textDecorationColor: isActive && isFlash ? '#FFC000'    : undefined,
            textUnderlineOffset: isActive && isFlash ? '3px'        : undefined,
            textDecorationThickness: isActive && isFlash ? '2px'   : undefined,
          }

          return (
            <button
              key={sw.id}
              className="ts-swatch"
              onClick={() => onThemeChange(sw.id)}
              aria-pressed={isActive}
              aria-label={`${sw.label} theme`}
            >
              <div className="ts-swatch-box" style={boxStyle} />
              <span className="ts-swatch-label" style={labelStyle}>{sw.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="ts-divider" aria-hidden="true" />

      {/* Solid / Gradient pill */}
      <div className="ts-style-pill" role="group" aria-label="Card style">
        {(['solid', 'gradient'] as CardStyle[]).map(s => (
          <button
            key={s}
            className={`ts-style-btn${cardStyle === s ? ' ts-style-btn-active' : ''}`}
            onClick={() => onCardStyleChange(s)}
            aria-pressed={cardStyle === s}
            aria-label={`${s === 'solid' ? 'Solid' : 'Gradient'} card style`}
          >
            {s === 'solid' ? 'Solid' : 'Gradient'}
          </button>
        ))}
      </div>

    </div>
  )
}
