import { members, type Member, type UnitName } from './members'

export interface SubUnit {
  name: UnitName
  /** Design tokens approximating the official unit colors: orange / pink / purple. */
  color: string
  logo: string
  /** The unit's debut, from the 2016 Unit Single series (verified). */
  firstSingle: { no: number; title: string; date: string }
  members: Member[]
}

const META: Omit<SubUnit, 'members'>[] = [
  { name: 'CYaRon!', color: '#FF9547', logo: 'assets/logo/cyaron.webp', firstSingle: { no: 1, title: 'Genki Zenkai DAY! DAY! DAY!', date: '2016.05.11' } },
  { name: 'AZALEA', color: '#FF6F9F', logo: 'assets/logo/azalea.webp', firstSingle: { no: 2, title: 'Torikoriko PLEASE!!', date: '2016.05.25' } },
  { name: 'Guilty Kiss', color: '#9B4BD6', logo: 'assets/logo/guilty-kiss.png', firstSingle: { no: 3, title: 'Strawberry Trapper', date: '2016.06.08' } },
]

export const subunits: SubUnit[] = META.map((u) => ({
  ...u,
  members: members.filter((m) => m.unit === u.name),
}))
