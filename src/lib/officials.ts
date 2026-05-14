export type OfficialParty = 'democrat' | 'republican' | 'independent' | 'green' | 'libertarian' | 'other' | 'brown'

export interface Official {
  level: 'local' | 'state' | 'national'
  role: string
  name: string
  party: OfficialParty
  since?: string
  termEnds?: string
  phone?: string
  email?: string
}

const BY_STATE: Record<string, Official[]> = {
  MI: [
    {
      level: 'national', role: 'U.S. Senator', name: 'Gary Peters', party: 'democrat',
      since: '2015-01-03', termEnds: '2027-01-03', phone: '(202) 224-6221',
    },
    {
      level: 'national', role: 'U.S. Senator', name: 'Elissa Slotkin', party: 'democrat',
      since: '2025-01-03', termEnds: '2031-01-03', phone: '(202) 224-4822',
    },
    {
      level: 'state', role: 'Governor', name: 'Gretchen Whitmer', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01', phone: '(517) 373-3400',
    },
    {
      level: 'state', role: 'Lieutenant Governor', name: 'Garlin Gilchrist II', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01',
    },
    {
      level: 'state', role: 'Attorney General', name: 'Dana Nessel', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01', phone: '(517) 373-1110',
    },
    {
      level: 'state', role: 'Secretary of State', name: 'Jocelyn Benson', party: 'democrat',
      since: '2019-01-01', termEnds: '2027-01-01', phone: '(888) 767-6424',
    },
  ],
}

export function getOfficialsByState(state: string): Official[] {
  return BY_STATE[state.toUpperCase()] ?? []
}
