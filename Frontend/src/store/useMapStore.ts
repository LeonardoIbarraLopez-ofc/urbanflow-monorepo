import { create } from 'zustand';
import { BusTelemetryEvent } from '../types/telemetry.types';
import { Route } from '../types/route.types';
import { CongestionEvent } from '../types/analytics.types';
import { Scooter } from '../types/scooter.types';

interface MapState {
  buses: BusTelemetryEvent[];
  selectedRoute: Route | null;
  congestions: CongestionEvent[];
  scooters: Scooter[];
  updateBus: (bus: BusTelemetryEvent) => void;
  setSelectedRoute: (route: Route | null) => void;
  updateCongestion: (congestion: CongestionEvent) => void;
  setScooters: (scooters: Scooter[]) => void;
  setBuses: (buses: BusTelemetryEvent[]) => void;
}

export const useMapStore = create<MapState>((set) => ({
  buses: [],
  selectedRoute: null,
  congestions: [],
  scooters: [],
  setBuses: (buses) => set({ buses }),
  updateBus: (bus) => set((state) => {
    const existing = state.buses.findIndex(b => b.bus_id === bus.bus_id);
    if (existing >= 0) {
      const newBuses = [...state.buses];
      newBuses[existing] = bus;
      return { buses: newBuses };
    }
    return { buses: [...state.buses, bus] };
  }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  updateCongestion: (congestion) => set((state) => {
    const existing = state.congestions.findIndex(c => c.corridor_id === congestion.corridor_id);
    if (existing >= 0) {
      const newCong = [...state.congestions];
      newCong[existing] = congestion;
      return { congestions: newCong };
    }
    return { congestions: [...state.congestions, congestion] };
  }),
  setScooters: (scooters) => set({ scooters }),
}));
