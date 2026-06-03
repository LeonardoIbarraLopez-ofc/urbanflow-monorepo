import { create } from 'zustand';

interface SimulatorLog {
  timestamp: string;
  message: string;
}

interface SimulatorState {
  logs: SimulatorLog[];
  routingTimerStart: number | null;
  routingTimerEnd: number | null;
  addLog: (message: string) => void;
  startRoutingTimer: () => void;
  endRoutingTimer: () => void;
  resetTimer: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  logs: [],
  routingTimerStart: null,
  routingTimerEnd: null,
  addLog: (message) => set((state) => {
    const time = new Date().toISOString().split('T')[1].substring(0,8);
    return {
      logs: [{ timestamp: time, message }, ...state.logs].slice(0, 50)
    };
  }),
  startRoutingTimer: () => set({ routingTimerStart: Date.now(), routingTimerEnd: null }),
  endRoutingTimer: () => set({ routingTimerEnd: Date.now() }),
  resetTimer: () => set({ routingTimerStart: null, routingTimerEnd: null })
}));
