import { create } from 'zustand'

// Which member profile is open. Shared so the hero penlights and the member
// tickets open the same view; `opener` is where focus returns on close.
interface MemberViewState {
  openNum: string | null
  opener: HTMLElement | null
  open(num: string, opener?: HTMLElement | null): void
  navigate(num: string): void
  close(): void
}

export const useMemberView = create<MemberViewState>()((set) => ({
  openNum: null,
  opener: null,
  open: (num, opener = null) => set({ openNum: num, opener }),
  navigate: (num) => set({ openNum: num }),
  close: () => set({ openNum: null }),
}))
