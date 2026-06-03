import { Route } from './route.types';

export interface NotificationEvent {
  type: 'ROUTE_DISRUPTION' | 'ALTERNATIVE_SUGGESTED' | 'BUS_REROUTED' | 'CONGESTION_ALERT' | 'SCOOTER_UNLOCKED';
  title: string;
  message: string;
  payload: {
    affected_route_id?: string;
    new_route?: Route;
    corridor_id?: string;
  };
  timestamp: string;
  id: string; // Client-side generated for keying
}
