import { useEffect, useRef, useState } from 'react'
import PageTopBar from '../components/PageTopBar'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]

// 3-digit ZIP prefix ranges → state abbreviation (USPS geographic distribution)
const ZIP_STATE_RANGES: [number, number, string][] = [
  [10,  27,  'MA'], [28,  29,  'RI'], [30,  38,  'NH'], [39,  49,  'ME'],
  [50,  59,  'VT'], [60,  69,  'CT'], [70,  89,  'NJ'],
  [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'],
  [200, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'],
  [247, 268, 'WV'], [270, 289, 'NC'], [290, 299, 'SC'],
  [300, 319, 'GA'], [320, 349, 'FL'], [350, 369, 'AL'],
  [370, 385, 'TN'], [386, 399, 'MS'], [400, 427, 'KY'],
  [430, 459, 'OH'], [460, 479, 'IN'], [480, 499, 'MI'],
  [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'],
  [570, 577, 'SD'], [580, 588, 'ND'], [590, 599, 'MT'],
  [600, 629, 'IL'], [630, 658, 'MO'], [660, 679, 'KS'],
  [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'],
  [730, 749, 'OK'], [750, 799, 'TX'], [800, 816, 'CO'],
  [820, 831, 'WY'], [832, 838, 'ID'], [840, 847, 'UT'],
  [850, 865, 'AZ'], [870, 884, 'NM'], [889, 898, 'NV'],
  [900, 961, 'CA'], [967, 968, 'HI'], [970, 979, 'OR'],
  [980, 994, 'WA'], [995, 999, 'AK'],
]

// 5-digit ZIPs that map to exactly one primary city — conservative, high-confidence only
const ZIP_CITY: Record<string, string> = {
  // Michigan
  '49036': 'Coldwater',        '49601': 'Cadillac',
  '49770': 'Petoskey',         '49783': 'Sault Ste. Marie',
  '49855': 'Marquette',        '49883': 'Newberry',
  '49931': 'Houghton',         '49935': 'Iron Mountain',
  '49946': "L'Anse",           '48858': 'Mount Pleasant',
  // New England
  '04609': 'Bar Harbor',       '04976': 'Skowhegan',
  '03301': 'Concord',          '05401': 'Burlington',
  // Mid-Atlantic
  '13326': 'Cooperstown',      '17325': 'Gettysburg',
  // South / Appalachia
  '25425': 'Harpers Ferry',    '33040': 'Key West',
  // Mountain West
  '80517': 'Estes Park',       '82001': 'Cheyenne',
  // Great Plains
  '57501': 'Pierre',           '57785': 'Sturgis',
  '58501': 'Bismarck',
  // Pacific / Alaska
  '99901': 'Ketchikan',
  // Famous
  '90210': 'Beverly Hills',
}

function lookupZip(zip: string): { state: string | null; city: string | null } {
  if (zip.length < 5) return { state: null, city: null }
  const prefix = parseInt(zip.slice(0, 3), 10)
  const match = ZIP_STATE_RANGES.find(([lo, hi]) => prefix >= lo && prefix <= hi)
  return {
    state: match ? match[2] : null,
    city: ZIP_CITY[zip.slice(0, 5)] ?? null,
  }
}

interface ProfileData {
  country: string
  zip: string
  state: string
  city: string
  street: string
}

const STORAGE_KEY = 'wsp-profile'

function load(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { country: 'United States', zip: '', state: '', city: '', street: '', ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { country: 'United States', zip: '', state: '', city: '', street: '' }
}

// Green when we have the minimum needed for any representative lookup (state alone = senators)
function hasEnough(d: ProfileData): boolean {
  return d.state.trim() !== ''
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border-medium)',
  background: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: "'Nunito', sans-serif",
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Quicksand', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--page-subtitle)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '.5px',
}

export default function Profile() {
  const [data, setData] = useState<ProfileData>(load)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const theme = localStorage.getItem('wsp-theme') ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-page', 'content')
    return () => {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.removeAttribute('data-page')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSaved(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaved(false), 2000)
  }, [data])

  function set(field: keyof ProfileData, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleZipChange(raw: string) {
    const zip = raw.replace(/[^\d-]/g, '')
    setData(prev => {
      const next = { ...prev, zip }
      if (zip.length === 5) {
        const { state, city } = lookupZip(zip)
        if (state) next.state = state
        if (city && !prev.city) next.city = city
      }
      return next
    })
  }

  const enough = hasEnough(data)

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-secondary)',
      padding: '50px 28px 32px',
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <PageTopBar />

      <div style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            My Profile
          </h1>
          <span style={{
            fontSize: 12, fontFamily: "'Quicksand', sans-serif", fontWeight: 700,
            color: 'var(--color-text-success)',
            opacity: saved ? 1 : 0,
            transition: 'opacity .25s',
            paddingTop: 2,
          }}>
            Saved
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 32, lineHeight: 1.6 }}>
          Location information is used to populate Your Representatives on your dashboard. If the outline is green, we have what we need and you don't have to fill anything else out for the pipeline to do its job.
        </p>

        <div style={{
          background: 'var(--color-card, #fff)',
          border: enough ? '4px solid #00B050' : '1px solid var(--color-border-light)',
          borderRadius: 12,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          transition: 'border-color .2s',
        }}>
          <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Home Address
          </h2>

          <div>
            <label style={labelStyle} htmlFor="prof-country">Country</label>
            <input
              id="prof-country"
              style={inputStyle}
              type="text"
              autoComplete="country-name"
              value={data.country}
              onChange={e => set('country', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="prof-zip">ZIP code</label>
            <input
              id="prof-zip"
              style={inputStyle}
              type="text"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={10}
              value={data.zip}
              onChange={e => handleZipChange(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="prof-state">State</label>
            <select
              id="prof-state"
              style={{ ...inputStyle, cursor: 'pointer' }}
              autoComplete="address-level1"
              value={data.state}
              onChange={e => set('state', e.target.value)}
            >
              <option value="" />
              {US_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle} htmlFor="prof-city">City</label>
            <input
              id="prof-city"
              style={inputStyle}
              type="text"
              autoComplete="address-level2"
              value={data.city}
              onChange={e => set('city', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="prof-street">Street address</label>
            <input
              id="prof-street"
              style={inputStyle}
              type="text"
              autoComplete="street-address"
              value={data.street}
              onChange={e => set('street', e.target.value)}
            />
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'var(--page-title)', marginTop: 16, lineHeight: 1.6 }}>
          Your address is used for district lookups and is stored only on this device.
        </p>
      </div>
    </div>
  )
}
