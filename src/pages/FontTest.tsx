import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BUNNY_URL =
  'https://fonts.bunny.net/css?family=' +
  [
    'saira-stencil-one:400',
    'barlow:400,700',
    'barlow-condensed:400,700',
    'exo-2:400,700',
    'rajdhani:400,700',
    'saira:400,700',
    'orbitron:400,700',
    'quicksand:400,700',
    'russo-one:400',
    'comfortaa:400,700',
    'fredoka-one:400',
    'cabin:400,700',
    'raleway:400,700',
    'outfit:400,700',
    'share-tech:400',
    'teko:400,700',
    'encode-sans:400,700',
    'jura:400,700',
    'electrolize:400',
    'audiowide:400',
    'oxanium:400,700',
    'chakra-petch:400,700',
  ].join('|') +
  '&display=swap'

const FONTS: Array<{ label: string; family: string }> = [
  { label: 'Saira Stencil One', family: '"Saira Stencil One", sans-serif' },
  { label: 'Barlow',            family: '"Barlow", sans-serif'            },
  { label: 'Barlow Condensed',  family: '"Barlow Condensed", sans-serif'  },
  { label: 'Exo 2',             family: '"Exo 2", sans-serif'             },
  { label: 'Rajdhani',          family: '"Rajdhani", sans-serif'          },
  { label: 'Saira',             family: '"Saira", sans-serif'             },
  { label: 'Orbitron',          family: '"Orbitron", sans-serif'          },
  { label: 'Quicksand',         family: '"Quicksand", sans-serif'         },
  { label: 'Russo One',         family: '"Russo One", sans-serif'         },
  { label: 'Comfortaa',         family: '"Comfortaa", sans-serif'         },
  { label: 'Fredoka One',       family: '"Fredoka One", sans-serif'       },
  { label: 'Cabin',             family: '"Cabin", sans-serif'             },
  { label: 'Raleway',           family: '"Raleway", sans-serif'           },
  { label: 'Outfit',            family: '"Outfit", sans-serif'            },
  { label: 'Share Tech',        family: '"Share Tech", sans-serif'        },
  { label: 'Teko',              family: '"Teko", sans-serif'              },
  { label: 'Encode Sans',       family: '"Encode Sans", sans-serif'       },
  { label: 'Jura',              family: '"Jura", sans-serif'              },
  { label: 'Electrolize',       family: '"Electrolize", sans-serif'       },
  { label: 'Audiowide',         family: '"Audiowide", sans-serif'         },
  { label: 'Oxanium',           family: '"Oxanium", sans-serif'           },
  { label: 'Chakra Petch',      family: '"Chakra Petch", sans-serif'      },
]

const TITLE = '3AM Pipeline'
const BILL  = 'MI SB 401 — Universal Free School Meals'

export default function FontTest() {
  const navigate = useNavigate()
  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = BUNNY_URL
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#1e1c2e', color: '#f0eeff', padding: '40px 32px' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 100,
          background: '#4F4262', color: '#fff',
          border: 'none', borderRadius: 20, padding: '5px 9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}
        aria-label="Go to home"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: '#5a5272', marginBottom: 40, fontFamily: 'system-ui' }}>
        Font preview — {FONTS.length} fonts — /fonttest
      </p>

      {FONTS.map((f, i) => (
        <div key={f.label} style={{
          marginBottom: 0,
          padding: '24px 0',
          borderBottom: i < FONTS.length - 1 ? '1px solid rgba(240,238,255,.08)' : 'none',
          display: 'grid',
          gridTemplateColumns: '160px 1fr',
          gap: '0 24px',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'system-ui', color: '#5a5272', textTransform: 'uppercase', letterSpacing: '.07em', lineHeight: 1.4 }}>
            {f.label}
          </span>
          <div>
            <div style={{ fontFamily: f.family, fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginBottom: 6 }}>
              {TITLE}
            </div>
            <div style={{ fontFamily: f.family, fontSize: 20, fontWeight: 400, lineHeight: 1.4, color: '#c0b8e8' }}>
              {BILL}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
