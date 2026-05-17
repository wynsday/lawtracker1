import { useEffect, useRef, useState } from 'react'
import PageTopBar from '../components/PageTopBar'
import FeedbackButton from '../components/FeedbackButton'
import { useAuth } from '../contexts/AuthContext'
import { userKey } from '../lib/userKey'

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
  // Legislative
  congressional_district:    string
  state_senate_district:     string
  state_house_district:      string
  county_commissioner:       string
  // Jurisdiction
  jurisdiction:              string
  ward:                      string
  precinct:                  string
  village:                   string
  metropolitan:              string
  authority:                 string
  // Courts
  court_of_appeals:          string
  circuit_court:             string
  probate_court:             string
  probate_district_court:    string
  district_court:            string
  municipal_court:           string
  // Education & local
  school_district:           string
  intermediate_school:       string
  community_college:         string
  library_district:          string
  // Meta
  confirmed: boolean
  city_link: string
}

const EMPTY: ProfileData = {
  country: 'United States', zip: '', state: '', county: '', city: '',
  congressional_district: '', state_senate_district: '', state_house_district: '',
  county_commissioner: '',
  jurisdiction: '', ward: '', precinct: '', village: '', metropolitan: '', authority: '',
  court_of_appeals: '', circuit_court: '', probate_court: '', probate_district_court: '',
  district_court: '', municipal_court: '',
  school_district: '', intermediate_school: '', community_college: '', library_district: '',
  confirmed: false, city_link: '',
}

function load(): ProfileData {
  try {
    const raw = localStorage.getItem(userKey('wsp-profile'))
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
  textTransform: 'uppercase',
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

const tealLabelStyle: React.CSSProperties = {
  ...labelStyle,
  color: 'var(--color-teal)',
}

const STATE_LEGISLATURE: Record<string, { senate: number; house: number; houseName: string }> = {
  AL: { senate: 35,  house: 105, houseName: 'House'      },
  AK: { senate: 20,  house: 40,  houseName: 'House'      },
  AZ: { senate: 30,  house: 60,  houseName: 'House'      },
  AR: { senate: 35,  house: 100, houseName: 'House'      },
  CA: { senate: 40,  house: 80,  houseName: 'Assembly'   },
  CO: { senate: 35,  house: 65,  houseName: 'House'      },
  CT: { senate: 36,  house: 151, houseName: 'House'      },
  DE: { senate: 21,  house: 41,  houseName: 'House'      },
  FL: { senate: 40,  house: 120, houseName: 'House'      },
  GA: { senate: 56,  house: 180, houseName: 'House'      },
  HI: { senate: 25,  house: 51,  houseName: 'House'      },
  ID: { senate: 35,  house: 70,  houseName: 'House'      },
  IL: { senate: 59,  house: 118, houseName: 'House'      },
  IN: { senate: 50,  house: 100, houseName: 'House'      },
  IA: { senate: 50,  house: 100, houseName: 'House'      },
  KS: { senate: 40,  house: 125, houseName: 'House'      },
  KY: { senate: 38,  house: 100, houseName: 'House'      },
  LA: { senate: 39,  house: 105, houseName: 'House'      },
  ME: { senate: 35,  house: 151, houseName: 'House'      },
  MD: { senate: 47,  house: 141, houseName: 'Delegates'  },
  MA: { senate: 40,  house: 160, houseName: 'House'      },
  MI: { senate: 38,  house: 110, houseName: 'House'      },
  MN: { senate: 67,  house: 134, houseName: 'House'      },
  MS: { senate: 52,  house: 122, houseName: 'House'      },
  MO: { senate: 34,  house: 163, houseName: 'House'      },
  MT: { senate: 50,  house: 100, houseName: 'House'      },
  NE: { senate: 49,  house: 0,   houseName: 'Unicameral' },
  NV: { senate: 21,  house: 42,  houseName: 'Assembly'   },
  NH: { senate: 24,  house: 400, houseName: 'House'      },
  NJ: { senate: 40,  house: 80,  houseName: 'Assembly'   },
  NM: { senate: 42,  house: 70,  houseName: 'House'      },
  NY: { senate: 63,  house: 150, houseName: 'Assembly'   },
  NC: { senate: 50,  house: 120, houseName: 'House'      },
  ND: { senate: 47,  house: 94,  houseName: 'House'      },
  OH: { senate: 33,  house: 99,  houseName: 'House'      },
  OK: { senate: 48,  house: 101, houseName: 'House'      },
  OR: { senate: 30,  house: 60,  houseName: 'House'      },
  PA: { senate: 50,  house: 203, houseName: 'House'      },
  RI: { senate: 38,  house: 75,  houseName: 'House'      },
  SC: { senate: 46,  house: 124, houseName: 'House'      },
  SD: { senate: 35,  house: 70,  houseName: 'House'      },
  TN: { senate: 33,  house: 99,  houseName: 'House'      },
  TX: { senate: 31,  house: 150, houseName: 'House'      },
  UT: { senate: 29,  house: 75,  houseName: 'House'      },
  VT: { senate: 30,  house: 150, houseName: 'House'      },
  VA: { senate: 40,  house: 100, houseName: 'Delegates'  },
  WA: { senate: 49,  house: 98,  houseName: 'House'      },
  WV: { senate: 34,  house: 100, houseName: 'Delegates'  },
  WI: { senate: 33,  house: 99,  houseName: 'Assembly'   },
  WY: { senate: 30,  house: 60,  houseName: 'House'      },
  DC: { senate: 0,   house: 13,  houseName: 'Council'    },
}

// U.S. House seats per state (post-2020 apportionment). DC has 1 non-voting delegate.
const STATE_FEDERAL_SEATS: Record<string, number> = {
  AL: 7,  AK: 1,  AZ: 9,  AR: 4,  CA: 52, CO: 8,  CT: 5,  DE: 1,  FL: 28, GA: 14,
  HI: 2,  ID: 2,  IL: 17, IN: 9,  IA: 4,  KS: 4,  KY: 6,  LA: 6,  ME: 2,  MD: 8,
  MA: 9,  MI: 13, MN: 8,  MS: 4,  MO: 8,  MT: 2,  NE: 3,  NV: 4,  NH: 2,  NJ: 12,
  NM: 3,  NY: 26, NC: 14, ND: 1,  OH: 15, OK: 5,  OR: 6,  PA: 17, RI: 2,  SC: 7,
  SD: 1,  TN: 9,  TX: 38, UT: 4,  VT: 1,  VA: 11, WA: 10, WV: 2,  WI: 8,  WY: 1,
  DC: 1,
}

// Cities with local bill tracking. Expand as jurisdictions are added.
const TRACKED_CITIES = new Set<string>([])

type GeoStatus = 'idle' | 'loading' | 'success' | 'error'

// ─── Geocoding helpers (module-level so they aren't recreated per render) ───

interface GeoFields {
  county?:                 string
  state?:                  string
  city?:                   string
  jurisdiction?:           string
  congressional_district?: string
  state_senate_district?:  string
  state_house_district?:   string
}

function cleanCounty(raw: string): string {
  return raw.replace(/\s+(county|parish|borough|municipality|census area)$/i, '').trim().toUpperCase()
}

const CENSUS_ADDR_URL  = 'https://geocoding.geo.census.gov/geocoder/geographies/address'
const CENSUS_COORD_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates'
const NOMINATIM_URL    = 'https://nominatim.openstreetmap.org/search'
const GEO_COMMON = { benchmark: 'Public_AR_Current', vintage: 'Current_Current', layers: 'all', format: 'json' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractGeoFields(geos: Record<string, any[]>, includeDistricts: boolean): GeoFields {
  const f: GeoFields = {}
  const county = geos['Counties']?.[0]?.NAME as string | undefined
  if (county) f.county = cleanCounty(county)
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
    const url = `${CENSUS_ADDR_URL}?${params}`
    console.log('[geo] Census address URL:', url)
    const res = await fetch(url, { signal })
    console.log('[geo] Census address status:', res.status, res.statusText)
    if (!res.ok) return null
    const json = await res.json()
    const matches = json?.result?.addressMatches
    console.log('[geo] Census address matches:', matches?.length ?? 0, matches?.[0]?.matchedAddress)
    if (!matches?.length) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geos = (matches[0] as any).geographies ?? {}
    console.log('[geo] Census address geo keys:', Object.keys(geos))
    const fields = extractGeoFields(geos, !!street.trim())
    console.log('[geo] Census address extracted:', fields)
    return fields
  } catch (e) {
    console.warn('[geo] Census address error:', e)
    return null
  }
}

async function tryCensusCoords(signal: AbortSignal, lat: string, lon: string): Promise<GeoFields | null> {
  try {
    const params = new URLSearchParams({ ...GEO_COMMON, x: lon, y: lat })
    const url = `${CENSUS_COORD_URL}?${params}`
    console.log('[geo] Census coords URL:', url)
    const res = await fetch(url, { signal })
    console.log('[geo] Census coords status:', res.status, res.statusText)
    if (!res.ok) return null
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geos: Record<string, any[]> = json?.result?.geographies ?? {}
    console.log('[geo] Census coords geo keys:', Object.keys(geos))
    const fields = extractGeoFields(geos, true)
    console.log('[geo] Census coords extracted:', fields)
    return fields
  } catch (e) {
    console.warn('[geo] Census coords error:', e)
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

    const url = `${NOMINATIM_URL}?${params}`
    console.log('[geo] Nominatim URL:', url)
    const res = await fetch(url, {
      signal,
      headers: { 'User-Agent': '3AMPipeline-LawTracker/1.0' },
    })
    console.log('[geo] Nominatim status:', res.status, res.statusText)
    if (!res.ok) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = await res.json()
    console.log('[geo] Nominatim results:', results?.length, results?.[0]?.display_name, 'lat:', results?.[0]?.lat, 'lon:', results?.[0]?.lon)
    if (!results?.length) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr: Record<string, any> = results[0].address ?? {}
    console.log('[geo] Nominatim address fields:', addr)
    const rawCounty  = addr.county as string | undefined
    const place      = (addr.city || addr.town || addr.village || addr.hamlet || addr.suburb) as string | undefined
    const township   = addr.township as string | undefined
    const fields: GeoFields = {
      county:       rawCounty ? cleanCounty(rawCounty) : undefined,
      state:        (addr.ISO3166_2_lvl4 as string | undefined)?.replace('US-', '') ?? undefined,
      // city: named settlement first; fall back to township for rural areas with no city/town
      city:         (place || township) ? (place || township)!.toUpperCase() : undefined,
      // jurisdiction: township takes priority; fall back to settlement name
      jurisdiction: township ? township.toUpperCase() : place ? place.toUpperCase() : undefined,
    }

    // Use Nominatim coordinates to ask Census for districts
    if (results[0].lat && results[0].lon) {
      const district = await tryCensusCoords(signal, results[0].lat as string, results[0].lon as string)
      console.log('[geo] Nominatim→Census district result:', district)
      if (district) {
        fields.congressional_district = district.congressional_district
        fields.state_senate_district  = district.state_senate_district
        fields.state_house_district   = district.state_house_district
        if (!fields.county && district.county) fields.county = district.county
        if (!fields.state  && district.state)  fields.state  = district.state
      }
    }

    console.log('[geo] Nominatim final fields:', fields)
    return (fields.county || fields.state) ? fields : null
  } catch (e) {
    console.warn('[geo] Nominatim error:', e)
    return null
  }
}

export default function Profile() {
  const { user } = useAuth()
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
    if (!user) return
    try {
      const raw = localStorage.getItem(`wsp-profile-${user.username}`)
      setData(raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY })
    } catch { setData({ ...EMPTY }) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username])

  useEffect(() => {
    localStorage.setItem(userKey('wsp-profile'), JSON.stringify(data))
    setSaved(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaved(false), 2000)
  }, [data])

  // If ZIP is saved but districts are missing, geocode on mount.
  useEffect(() => {
    const zip = data.zip.replace(/\D/g, '').slice(0, 5)
    if (zip.length === 5 && !data.congressional_district) {
      void runGeocode('', zip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set(field: keyof ProfileData, value: string) {
    const stored = field !== 'city_link' ? value.toUpperCase() : value
    setData(prev => {
      const next = { ...prev, [field]: stored }
      if (field !== 'city_link') next.confirmed = false
      return next
    })
    setAutoFilled(prev => { const n = new Set(prev); n.delete(field); return n })
  }

  async function runGeocode(street: string, zip: string, refreshDistricts = false) {
    if (geoCtrl.current) geoCtrl.current.abort()
    const ctrl = new AbortController()
    geoCtrl.current = ctrl
    // Snapshot which fields were auto-filled before the async work begins.
    // Only overwrite a field if it is empty OR was previously auto-filled (not user-typed).
    // refreshDistricts=true (explicit street update) always rewrites district fields since
    // users never type those manually — they only come from geocoding.
    const wasAutoFilled = new Set(autoFilled)

    setGeoStatus('loading')
    setGeoError('')

    try {
      console.log('[geo] runGeocode start — street:', JSON.stringify(street), 'zip:', zip, 'refreshDistricts:', refreshDistricts)
      // Try Census address geocoder first; fall back to Nominatim (OSM) + Census coords
      let fields = await tryCensusAddress(ctrl.signal, street, zip)
      console.log('[geo] after Census:', fields)
      if (!fields) {
        console.log('[geo] Census returned null, trying Nominatim…')
        fields = await tryNominatim(ctrl.signal, street, zip)
        console.log('[geo] after Nominatim:', fields)
      }

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
        const next = { ...prev, confirmed: false }
        if (fields!.county && (!prev.county || wasAutoFilled.has('county'))) {
          next.county = fields!.county; filled.add('county')
        }
        if (fields!.state && (!prev.state || wasAutoFilled.has('state'))) {
          next.state = fields!.state; filled.add('state')
        }
        if (fields!.city && (!prev.city || wasAutoFilled.has('city'))) {
          next.city = fields!.city; filled.add('city')
        }
        if (fields!.jurisdiction && (!prev.jurisdiction || wasAutoFilled.has('jurisdiction'))) {
          next.jurisdiction = fields!.jurisdiction; filled.add('jurisdiction')
        }
        if (fields!.congressional_district && (!prev.congressional_district || refreshDistricts || wasAutoFilled.has('congressional_district'))) {
          next.congressional_district = fields!.congressional_district; filled.add('congressional_district')
        }
        if (fields!.state_senate_district && (!prev.state_senate_district || refreshDistricts || wasAutoFilled.has('state_senate_district'))) {
          next.state_senate_district = fields!.state_senate_district; filled.add('state_senate_district')
        }
        if (fields!.state_house_district && (!prev.state_house_district || refreshDistricts || wasAutoFilled.has('state_house_district'))) {
          next.state_house_district = fields!.state_house_district; filled.add('state_house_district')
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
      const next = { ...prev, zip, confirmed: false }
      if (zip.length === 5) {
        const { state, city, county } = lookupZip(zip)
        if (state && !prev.state) next.state = state
        if (county && !prev.county) next.county = cleanCounty(county)
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
    if (zip.length === 5) {
      void runGeocode('', zip)
    } else if (zip.length < 5) {
      setGeoStatus('idle')
      setGeoError('')
    }
  }


  function ck(field: keyof ProfileData) {
    return autoFilled.has(field)
      ? <span style={{ color: '#00B050', fontSize: 15, lineHeight: 1 }}>✓</span>
      : null
  }

  const enough      = hasEnough(data)
  const leg         = data.state ? STATE_LEGISLATURE[data.state] : null
  const cityTracked = !!(data.city && TRACKED_CITIES.has(data.city.toLowerCase()))

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

            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: '12px 0', lineHeight: 1.6, fontFamily: "'Nunito', sans-serif" }}>
            Your address is used for district lookups and is stored only on this device.
          </p>

          {/* ── My District Information ── */}
          <div style={{ flex: '0 1 380px', minWidth: 260 }}>
            <div style={{
              background: 'var(--color-card, #fff)',
              border: data.confirmed ? '4px solid #00B050' : '1px solid var(--color-border-light)',
              borderRadius: 12,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              transition: 'border-color .2s',
            }}>
              <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                My District Information
              </h2>

              {/* Across from ZIP — confirm checkbox */}
              <div>
                <label style={labelStyle}>Verification</label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={data.confirmed}
                    onChange={e => setData(prev => ({ ...prev, confirmed: e.target.checked }))}
                    style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', accentColor: '#00B050', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-primary)', fontFamily: "'Nunito', sans-serif" }}>
                    Confirm this information is correct
                  </span>
                </label>
              </div>

              {/* National legislature */}
              <div>
                <label style={labelStyle}>National Legislature</label>
                <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.8, fontFamily: "'Nunito', sans-serif" }}>
                  <div>
                    U.S. Senate: 100 senators
                    {data.state ? ` — 2 from ${data.state}` : ''}
                  </div>
                  <div>
                    U.S. House: 435 members
                    {data.state && STATE_FEDERAL_SEATS[data.state] != null
                      ? ` — ${STATE_FEDERAL_SEATS[data.state]} from ${data.state}${data.state === 'DC' ? ' (non-voting)' : ''}`
                      : ''}
                  </div>
                </div>
              </div>

              {/* Across from State — state legislature size */}
              <div>
                <label style={labelStyle}>State Legislature</label>
                {leg ? (
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.8, fontFamily: "'Nunito', sans-serif" }}>
                    {leg.houseName === 'Unicameral' ? (
                      <div>Unicameral: {leg.senate} senators</div>
                    ) : (
                      <>
                        <div>Senate: {leg.senate} senators</div>
                        <div>{leg.houseName}: {leg.house} members</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontFamily: "'Nunito', sans-serif" }}>
                    Select your state to see legislature size
                  </div>
                )}
              </div>

              {/* Political District heading + Look up link */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  Political District {ck('congressional_district')}
                </label>
                {data.country === 'United States' && data.state === 'MI' && (
                  <a
                    href="https://mvic.sos.state.mi.us/Voter/Index"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11, fontFamily: "'Quicksand', sans-serif", fontWeight: 700,
                      padding: '4px 9px', borderRadius: 6,
                      border: '1px solid var(--color-border-medium)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-teal)',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Look up
                  </a>
                )}
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-cd">Congressional District</label>
                <input id="dist-cd" style={inputStyle} type="text" autoComplete="off"
                  value={data.congressional_district}
                  onChange={e => set('congressional_district', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-ss">State Senate District</label>
                <input id="dist-ss" style={inputStyle} type="text" autoComplete="off"
                  value={data.state_senate_district}
                  onChange={e => set('state_senate_district', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-sh">State House District</label>
                <input id="dist-sh" style={inputStyle} type="text" autoComplete="off"
                  value={data.state_house_district}
                  onChange={e => set('state_house_district', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-cc">County Commissioner District</label>
                <input id="dist-cc" style={inputStyle} type="text" autoComplete="off"
                  value={data.county_commissioner}
                  onChange={e => set('county_commissioner', e.target.value)} />
              </div>

              {/* Jurisdiction */}
              <label style={labelStyle}>Jurisdiction</label>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-jur">Township / City</label>
                <input id="dist-jur" style={inputStyle} type="text" autoComplete="off"
                  value={data.jurisdiction}
                  onChange={e => set('jurisdiction', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-ward">Ward</label>
                <input id="dist-ward" style={inputStyle} type="text" autoComplete="off"
                  value={data.ward}
                  onChange={e => set('ward', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-prec">Precinct</label>
                <input id="dist-prec" style={inputStyle} type="text" autoComplete="off"
                  value={data.precinct}
                  onChange={e => set('precinct', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-vil">Village</label>
                <input id="dist-vil" style={inputStyle} type="text" autoComplete="off"
                  value={data.village}
                  onChange={e => set('village', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-metro">Metropolitan</label>
                <input id="dist-metro" style={inputStyle} type="text" autoComplete="off"
                  value={data.metropolitan}
                  onChange={e => set('metropolitan', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-auth">Authority</label>
                <input id="dist-auth" style={inputStyle} type="text" autoComplete="off"
                  value={data.authority}
                  onChange={e => set('authority', e.target.value)} />
              </div>

              {/* Courts */}
              <label style={labelStyle}>Courts</label>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-coa">Court of Appeals</label>
                <input id="dist-coa" style={inputStyle} type="text" autoComplete="off"
                  value={data.court_of_appeals}
                  onChange={e => set('court_of_appeals', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-circ">Circuit Court</label>
                <input id="dist-circ" style={inputStyle} type="text" autoComplete="off"
                  value={data.circuit_court}
                  onChange={e => set('circuit_court', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-prob">Probate Court</label>
                <input id="dist-prob" style={inputStyle} type="text" autoComplete="off"
                  value={data.probate_court}
                  onChange={e => set('probate_court', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-probd">Probate District Court</label>
                <input id="dist-probd" style={inputStyle} type="text" autoComplete="off"
                  value={data.probate_district_court}
                  onChange={e => set('probate_district_court', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-dc">District Court</label>
                <input id="dist-dc" style={inputStyle} type="text" autoComplete="off"
                  value={data.district_court}
                  onChange={e => set('district_court', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-muni">Municipal Court</label>
                <input id="dist-muni" style={inputStyle} type="text" autoComplete="off"
                  value={data.municipal_court}
                  onChange={e => set('municipal_court', e.target.value)} />
              </div>

              {/* Education & Local */}
              <label style={labelStyle}>Education &amp; Local</label>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-sch">School District</label>
                <input id="dist-sch" style={inputStyle} type="text" autoComplete="off"
                  value={data.school_district}
                  onChange={e => set('school_district', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-isd">Intermediate School</label>
                <input id="dist-isd" style={inputStyle} type="text" autoComplete="off"
                  value={data.intermediate_school}
                  onChange={e => set('intermediate_school', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-cc2">Community College</label>
                <input id="dist-cc2" style={inputStyle} type="text" autoComplete="off"
                  value={data.community_college}
                  onChange={e => set('community_college', e.target.value)} />
              </div>

              <div>
                <label style={tealLabelStyle} htmlFor="dist-lib">Library District</label>
                <input id="dist-lib" style={inputStyle} type="text" autoComplete="off"
                  value={data.library_district}
                  onChange={e => set('library_district', e.target.value)} />
              </div>

              {/* Across from City — city tracking status */}
              <div>
                <label style={labelStyle}>City in LawTracker</label>
                {cityTracked ? (
                  <div style={{ fontSize: 14, color: '#00B050', fontFamily: "'Nunito', sans-serif" }}>
                    ✓ {data.city} is included in LawTracker
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontFamily: "'Nunito', sans-serif" }}>
                    {data.city ? `${data.city} is not yet tracked locally.` : 'No city on file.'}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>


      </div>
      <FeedbackButton />
    </div>
  )
}
