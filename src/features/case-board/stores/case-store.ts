// src/stores/counter-store.ts
import { createStore } from 'zustand/vanilla'

export type CaseState = {
    count: number
    elements: Record<string,unknown>[]
}

export type CounterActions = {
    decrementCount: () => void
    incrementCount: () => void
}

export type CaseStore = CaseState & CounterActions

export const defaultInitState: CaseState = {
    count: 0,
    elements: []
}

export const createCaseStore = (
    initState: CaseState = defaultInitState,
) => {
    return createStore<CaseStore>()((set, get) => ({
        ...initState,
        setState: setInterval(() => {
            const newState = { x: Math.random() * 1200, y: Math.random() * 1200 };
            set({elements:[...get().elements.concat(newState)]})
        }, 1000),
        decrementCount: () => set((state) => ({ count: state.count - 1 })),
        incrementCount: () => set((state) => ({ count: state.count + 1 })),
    }))
}
