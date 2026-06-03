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
  userId: 'USR-1337', // Default user id for the hackathon
  balance: 10.50, // Starting balance
  activeTrip: null,
  setBalance: (balance) => set({ balance }),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
}));
