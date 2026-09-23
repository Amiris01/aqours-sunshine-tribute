import { members, type Member, type UnitName } from './members'

export interface SubUnit {
  name: UnitName
  /** Design tokens approximating the official unit colors: orange / pink / purple. */
  color: string
  logo: string
  members: Member[]
}

const META: Omit<SubUnit, 'members'>[] = [
  { name: 'CYaRon!', color: '#FF9547', logo: 'assets/logo/cyaron.webp' },
  { name: 'AZALEA', color: '#FF6F9F', logo: 'assets/logo/azalea.webp' },
  { name: 'Guilty Kiss', color: '#9B4BD6', logo: 'assets/logo/guilty-kiss.png' },
]

export const subunits: SubUnit[] = META.map((u) => ({
  ...u,
  members: members.filter((m) => m.unit === u.name),
}))
