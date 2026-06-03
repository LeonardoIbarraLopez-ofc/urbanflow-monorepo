import { create } from 'zustand';
import { Route } from '../types/route.types';

interface UserState {
  userId: string;
  balance: number;
  activeTrip: Route | null;
  setBalance: (balance: number) => void;
  setActiveTrip: (trip: Route | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: '11111111-1111-1111-1111-111111111111', // account_id real de Supabase (cuenta de prueba Dev 2)
  balance: 50.00, // Saldo inicial real de la cuenta
  activeTrip: null,
  setBalance: (balance) => set({ balance }),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
}));
