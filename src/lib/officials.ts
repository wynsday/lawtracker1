export type OfficialParty = 'democrat' | 'republican' | 'independent' | 'green' | 'libertarian' | 'other' | 'brown'

export interface Official {
  level: 'local' | 'state' | 'national'
  role: string
  name: string
  party: OfficialParty
  city?: string           // for local officials — uppercase, matches profileAddr.city
  district?: string       // district number string, matches Census API BASENAME output
  since?: string
  termEnds?: string
  phone?: string
  email?: string
  contact_url?: string
  source?: string         // 'manual' | 'api' | 'user'
  verified?: boolean      // false = needs human review
  id?: string             // only set for user-added reps
}

const BY_STATE: Record<string, Official[]> = {
  MI: [

    // ── U.S. Senate ──────────────────────────────────────────────────────────
    // Source: manual | Verified: false — needs human review against senate.gov
    {
      level: 'national', role: 'U.S. Senator', name: 'Gary Peters', party: 'democrat',
      since: '2015-01-03', termEnds: '2027-01-03',
      phone: '(202) 224-6221',
      contact_url: 'https://www.peters.senate.gov/contact',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Senator', name: 'Elissa Slotkin', party: 'democrat',
      since: '2025-01-03', termEnds: '2031-01-03',
      phone: '(202) 224-4822',
      contact_url: 'https://www.slotkin.senate.gov/contact',
      source: 'manual', verified: false,
    },

    // ── U.S. House — Michigan (119th Congress, 2025–2027) ────────────────────
    // Source: manual | Verified: false — needs human review against clerk.house.gov
    {
      level: 'national', role: 'U.S. Representative', name: 'Jack Bergman', party: 'republican',
      district: '1', since: '2017-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-4735',
      contact_url: 'https://bergman.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'John Moolenaar', party: 'republican',
      district: '2', since: '2015-01-06', termEnds: '2027-01-03',
      phone: '(202) 225-3561',
      contact_url: 'https://moolenaar.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Hillary Scholten', party: 'democrat',
      district: '3', since: '2023-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-3831',
      contact_url: 'https://scholten.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Bill Huizenga', party: 'republican',
      district: '4', since: '2011-01-05', termEnds: '2027-01-03',
      phone: '(202) 225-4401',
      contact_url: 'https://huizenga.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Tim Walberg', party: 'republican',
      district: '5', since: '2011-01-05', termEnds: '2027-01-03',
      phone: '(202) 225-6276',
      contact_url: 'https://walberg.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Debbie Dingell', party: 'democrat',
      district: '6', since: '2015-01-06', termEnds: '2027-01-03',
      phone: '(202) 225-4071',
      contact_url: 'https://debbiedingell.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Tom Barrett', party: 'republican',
      district: '7', since: '2023-03-09', termEnds: '2027-01-03',
      phone: '(202) 225-4872',
      contact_url: 'https://barrett.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Kristen McDonald Rivet', party: 'democrat',
      district: '8', since: '2024-05-21', termEnds: '2027-01-03',
      phone: '(202) 225-3611',
      contact_url: 'https://mcdonaldrivet.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Lisa McClain', party: 'republican',
      district: '9', since: '2021-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-2106',
      contact_url: 'https://mcclain.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'John James', party: 'republican',
      district: '10', since: '2023-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-4961',
      contact_url: 'https://johnjames.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Haley Stevens', party: 'democrat',
      district: '11', since: '2019-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-8171',
      contact_url: 'https://haleystevens.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Rashida Tlaib', party: 'democrat',
      district: '12', since: '2019-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-5126',
      contact_url: 'https://tlaib.house.gov/contact/',
      source: 'manual', verified: false,
    },
    {
      level: 'national', role: 'U.S. Representative', name: 'Shri Thanedar', party: 'democrat',
      district: '13', since: '2023-01-03', termEnds: '2027-01-03',
      phone: '(202) 225-5802',
      contact_url: 'https://thanedar.house.gov/contact/',
      source: 'manual', verified: false,
    },

    // ── State Executive ───────────────────────────────────────────────────────
    // Source: manual | Verified: false — needs human review against michigan.gov
    {
      level: 'state', role: 'Governor', name: 'Gretchen Whitmer', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01',
      phone: '(517) 373-3400',
      email: 'governor@michigan.gov',
      source: 'manual', verified: false,
    },
    {
      level: 'state', role: 'Lieutenant Governor', name: 'Garlin Gilchrist II', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01',
      email: 'ltgovernor@michigan.gov',
      source: 'manual', verified: false,
    },
    {
      level: 'state', role: 'Attorney General', name: 'Dana Nessel', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01',
      phone: '(517) 373-1110',
      email: 'miag@michigan.gov',
      source: 'manual', verified: false,
    },
    {
      level: 'state', role: 'Secretary of State', name: 'Jocelyn Benson', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01',
      phone: '(888) 767-6424',
      email: 'sos@michigan.gov',
      source: 'manual', verified: false,
    },
  ],
}

export function getOfficialsByState(state: string): Official[] {
  return BY_STATE[state.toUpperCase()] ?? []
}
