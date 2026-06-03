import { create } from 'zustand';
import { NotificationEvent } from '../types/notification.types';

interface NotificationState {
  notifications: NotificationEvent[];
  addNotification: (notification: NotificationEvent) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter(n => n.id !== id) 
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
