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

const ZIP_COUNTY: Record<string, string> = {
  // Michigan
  '48821': 'Eaton County',
  '49036': 'Branch County',       '49601': 'Wexford County',
  '49770': 'Emmet County',        '49783': 'Chippewa County',
  '49855': 'Marquette County',    '49883': 'Luce County',
  '49931': 'Houghton County',     '49935': 'Dickinson County',
  '49946': 'Baraga County',       '48858': 'Isabella County',
  // New England
  '04609': 'Hancock County',      '04976': 'Somerset County',
  '03301': 'Merrimack County',    '05401': 'Chittenden County',
  // Mid-Atlantic
  '13326': 'Otsego County',       '17325': 'Adams County',
  // South / Appalachia
  '25425': 'Jefferson County',    '33040': 'Monroe County',
  // Mountain West
  '80517': 'Larimer County',      '82001': 'Laramie County',
  // Great Plains
  '57501': 'Hughes County',       '57785': 'Meade County',
  '58501': 'Burleigh County',
  // Pacific / Alaska
  '99901': 'Ketchikan Gateway Borough',
  // Famous
  '90210': 'Los Angeles County',
}

function lookupZip(zip: string): { state: string | null; city: string | null; county: string | null } {
  if (zip.length < 5) return { state: null, city: null, county: null }
  const prefix = parseInt(zip.slice(0, 3), 10)
  const match = ZIP_STATE_RANGES.find(([lo, hi]) => prefix >= lo && prefix <= hi)
  const key = zip.slice(0, 5)
  return {
    state:  match ? match[2] : null,
    city:   ZIP_CITY[key] ?? null,
    county: ZIP_COUNTY[key] ?? null,
  }
}

interface ProfileData {
  country: string
  zip: string
  state: string
  county: string
  city: string
  street: string
  congressional_district: string
  state_senate_district:  string
  state_house_district:   string
}

const EMPTY: ProfileData = {
  country: 'United States', zip: '', state: '', county: '', city: '', street: '',
  congressional_district: '', state_senate_district: '', state_house_district: '',
}

const STORAGE_KEY = 'wsp-profile'

function load(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...EMPTY }
}

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
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: "'Quicksand', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: '#1a7a72',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '.5px',
}

type GeoStatus = 'idle' | 'loading' | 'success' | 'error'

// ─── Geocoding helpers (module-level so they aren't recreated per render) ───

interface GeoFields {
  county?:                 string
  state?:                  string
  congressional_district?: string
  state_senate_district?:  string
  state_house_district?:   string
}

const CENSUS_ADDR_URL  = 'https://geocoding.geo.census.gov/geocoder/geographies/address'
const CENSUS_COORD_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates'
const NOMINATIM_URL    = 'https://nominatim.openstreetmap.org/search'
const GEO_COMMON = { benchmark: 'Public_AR_Current', vintage: 'Current_Current', format: 'json' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractGeoFields(geos: Record<string, any[]>, includeDistricts: boolean): GeoFields {
  const f: GeoFields = {}
  const county = geos['Counties']?.[0]?.NAME as string | undefined
  if (county) f.county = county
  const state = geos['States']?.[0]?.STUSAB as string | undefined
  if (state) f.state = state
  if (includeDistricts) {
    const cd = geos['Congressional Districts']?.[0]?.BASENAME as string | undefined
    if (cd) f.congressional_district = cd
    const ss = geos['State Legislative Districts (Upper Chamber)']?.[0]?.BASENAME as string | undefined
    if (ss) f.state_senate_district = ss
    const sh = geos['State Legislative Districts (Lower Chamber)']?.[0]?.BASENAME as string | undefined
    if (sh) f.state_house_district = sh
  }
  return f
}

async function tryCensusAddress(signal: AbortSignal, street: string, zip: string): Promise<GeoFields | null> {
  try {
    const params = new URLSearchParams({ ...GEO_COMMON, zip })
    if (street.trim()) params.set('street', street.trim())
    const res = await fetch(`${CENSUS_ADDR_URL}?${params}`, { signal })
    if (!res.ok) return null
    const json = await res.json()
    const matches = json?.result?.addressMatches
    if (!matches?.length) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geos = (matches[0] as any).geographies ?? {}
    return extractGeoFields(geos, !!street.trim())
  } catch {
    return null
  }
}

async function tryCensusCoords(signal: AbortSignal, lat: string, lon: string): Promise<GeoFields | null> {
  try {
    const params = new URLSearchParams({ ...GEO_COMMON, x: lon, y: lat })
    const res = await fetch(`${CENSUS_COORD_URL}?${params}`, { signal })
    if (!res.ok) return null
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geos: Record<string, any[]> = json?.result?.geographies ?? {}
    return extractGeoFields(geos, true)
  } catch {
    return null
  }
}

async function tryNominatim(signal: AbortSignal, street: string, zip: string): Promise<GeoFields | null> {
  try {
    const params = new URLSearchParams({
      format: 'json', addressdetails: '1', limit: '1', countrycodes: 'US',
    })
    if (street.trim()) { params.set('q', `${street.trim()} ${zip}`) }
    else               { params.set('postalcode', zip) }

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      signal,
      headers: { 'User-Agent': '3AMPipeline-LawTracker/1.0' },
    })
    if (!res.ok) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = await res.json()
    if (!results?.length) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr: Record<string, any> = results[0].address ?? {}
    const fields: GeoFields = {
      county: addr.county as string | undefined,
      state:  (addr.ISO3166_2_lvl4 as string | undefined)?.replace('US-', '') ?? undefined,
    }

    // Use Nominatim coordinates to ask Census for districts
    if (street.trim() && results[0].lat && results[0].lon) {
      const district = await tryCensusCoords(signal, results[0].lat as string, results[0].lon as string)
      if (district) {
        fields.congressional_district = district.congressional_district
        fields.state_senate_district  = district.state_senate_district
        fields.state_house_district   = district.state_house_district
        if (!fields.county && district.county) fields.county = district.county
        if (!fields.state  && district.state)  fields.state  = district.state
      }
    }

    return (fields.county || fields.state) ? fields : null
  } catch {
    return null
  }
}

export default function Profile() {
  const [data, setData]           = useState<ProfileData>(load)
  const [saved, setSaved]         = useState(false)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [geoError, setGeoError]   = useState('')
  const [autoFilled, setAutoFilled] = useState<Set<keyof ProfileData>>(new Set())
  const [cityMismatch, setCityMismatch] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const geoCtrl   = useRef<AbortController | null>(null)

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
    setAutoFilled(prev => { const n = new Set(prev); n.delete(field); return n })
  }

  async function runGeocode(street: string, zip: string) {
    if (geoCtrl.current) geoCtrl.current.abort()
    const ctrl = new AbortController()
    geoCtrl.current = ctrl

    setGeoStatus('loading')
    setGeoError('')

    try {
      // Try Census address geocoder first; fall back to Nominatim (OSM) + Census coords
      let fields = await tryCensusAddress(ctrl.signal, street, zip)
      if (!fields) fields = await tryNominatim(ctrl.signal, street, zip)

      if (!fields || (!fields.county && !fields.state && !fields.congressional_district)) {
        setGeoStatus('error')
        setGeoError(
          street.trim()
            ? 'Address not found — check your street address and ZIP.'
            : 'ZIP not recognized — try entering your street address too.'
        )
        return
      }

      const filled = new Set<keyof ProfileData>()
      setData(prev => {
        const next = { ...prev }
        if (fields!.county)               { next.county = fields!.county;  filled.add('county')  }
        if (fields!.state && !prev.state) { next.state  = fields!.state;   filled.add('state')   }
        if (street.trim()) {
          if (fields!.congressional_district) { next.congressional_district = fields!.congressional_district; filled.add('congressional_district') }
          if (fields!.state_senate_district)  { next.state_senate_district  = fields!.state_senate_district;  filled.add('state_senate_district')  }
          if (fields!.state_house_district)   { next.state_house_district   = fields!.state_house_district;   filled.add('state_house_district')   }
        }
        return next
      })
      setAutoFilled(filled)
      setGeoStatus('success')

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setGeoStatus('error')
      setGeoError('Could not reach address services — check your connection.')
    }
  }

  function handleZipChange(raw: string) {
    const zip = raw.replace(/[^\d-]/g, '')
    setData(prev => {
      const next = { ...prev, zip }
      if (zip.length === 5) {
        const { state, city, county } = lookupZip(zip)
        if (state && !prev.state) next.state = state
        if (county && !prev.county) next.county = county
        if (city) {
          if (!prev.city || prev.city.toLowerCase() === city.toLowerCase()) {
            next.city = city
          }
          // mismatch: keep existing city — note shown separately
        }
      }
      return next
    })
    if (zip.length === 5) {
      const { city } = lookupZip(zip)
      if (city && data.city && data.city.toLowerCase() !== city.toLowerCase()) {
        setCityMismatch(city)
      } else {
        setCityMismatch(null)
      }
    } else {
      setCityMismatch(null)
    }
    // Census geographies endpoint requires a street — skip API for ZIP-only
    if (zip.length === 5 && data.street.trim()) {
      void runGeocode(data.street, zip)
    } else if (zip.length < 5) {
      setGeoStatus('idle')
      setGeoError('')
    }
  }

  function handleStreetBlur() {
    const zip = data.zip.replace(/\D/g, '').slice(0, 5)
    if (zip.length === 5 && data.street.trim()) {
      void runGeocode(data.street, zip)
    }
  }

  function ck(field: keyof ProfileData) {
    return autoFilled.has(field)
      ? <span style={{ color: '#00B050', fontSize: 15, lineHeight: 1 }}>✓</span>
      : null
  }

  const enough      = hasEnough(data)
  const hasDistricts = data.congressional_district || data.state_senate_district || data.state_house_district

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-secondary)',
      padding: '50px 28px 32px',
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <PageTopBar />

      <div>

        {/* title + description constrained to narrow width */}
        <div style={{ maxWidth: 480, marginBottom: 28 }}>
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
          <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>
            Location information is used to populate Your Representatives on your dashboard. If the outline is green, we have what we need and you don't have to fill anything else out for the pipeline to do its job.
          </p>
        </div>

        {/* cards row — address left, districts right */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Home Address ── */}
          <div style={{ flex: '0 1 380px', minWidth: 260 }}>
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
                <label style={labelStyle} htmlFor="prof-country">Country {ck('country')}</label>
                <input id="prof-country" style={inputStyle} type="text" autoComplete="country-name"
                  value={data.country} onChange={e => set('country', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-zip">ZIP code</label>
                <input id="prof-zip" style={inputStyle} type="text" autoComplete="postal-code"
                  inputMode="numeric" maxLength={10} value={data.zip}
                  onChange={e => handleZipChange(e.target.value)} />
                {geoStatus === 'loading' && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 5 }}>
                    Looking up your address…
                  </div>
                )}
                {geoStatus === 'success' && (
                  <div style={{ fontSize: 12, color: '#00B050', marginTop: 5 }}>✓ Address verified</div>
                )}
                {geoStatus === 'error' && geoError && (
                  <div style={{ fontSize: 12, color: '#C00000', marginTop: 5 }}>{geoError}</div>
                )}
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-state">State {ck('state')}</label>
                <select id="prof-state" style={{ ...inputStyle, cursor: 'pointer' }} autoComplete="address-level1"
                  value={data.state} onChange={e => set('state', e.target.value)}>
                  <option value="" />
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-county">County {ck('county')}</label>
                <input id="prof-county" style={inputStyle} type="text" autoComplete="off"
                  value={data.county} onChange={e => set('county', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-city">City {ck('city')}</label>
                <input id="prof-city" style={inputStyle} type="text" autoComplete="address-level2"
                  value={data.city} onChange={e => { set('city', e.target.value); setCityMismatch(null) }} />
                {cityMismatch && (
                  <div style={{ fontSize: 12, color: '#b8860b', marginTop: 4 }}>
                    ZIP suggests {cityMismatch}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle} htmlFor="prof-street">Street address</label>
                <input id="prof-street" style={inputStyle} type="text" autoComplete="street-address"
                  value={data.street} onChange={e => set('street', e.target.value)}
                  onBlur={handleStreetBlur} />
              </div>
            </div>
          </div>

          {/* ── District Information — appears to the right once known ── */}
          {hasDistricts && (
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              <div style={{
                background: 'var(--color-card, #fff)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 12,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}>
                <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  District Information
                </h2>

                {data.congressional_district && (
                  <div>
                    <label style={labelStyle} htmlFor="prof-cd">
                      Congressional District {ck('congressional_district')}
                    </label>
                    <input id="prof-cd" style={inputStyle} type="text" autoComplete="off"
                      value={data.congressional_district}
                      onChange={e => set('congressional_district', e.target.value)} />
                  </div>
                )}

                {data.state_senate_district && (
                  <div>
                    <label style={labelStyle} htmlFor="prof-ss">
                      State Senate District {ck('state_senate_district')}
                    </label>
                    <input id="prof-ss" style={inputStyle} type="text" autoComplete="off"
                      value={data.state_senate_district}
                      onChange={e => set('state_senate_district', e.target.value)} />
                  </div>
                )}

                {data.state_house_district && (
                  <div>
                    <label style={labelStyle} htmlFor="prof-sh">
                      State House District {ck('state_house_district')}
                    </label>
                    <input id="prof-sh" style={inputStyle} type="text" autoComplete="off"
                      value={data.state_house_district}
                      onChange={e => set('state_house_district', e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <p style={{ fontSize: 14, color: 'var(--page-title)', marginTop: 16, lineHeight: 1.6, maxWidth: 480 }}>
          Your address is used for district lookups and is stored only on this device.
        </p>

      </div>
    </div>
  )
}
