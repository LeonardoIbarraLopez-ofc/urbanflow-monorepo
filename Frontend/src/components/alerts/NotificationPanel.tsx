import { useNotificationStore } from '../../store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Info, Navigation, ShieldAlert } from 'lucide-react';

export const NotificationPanel = () => {
  const notifications = useNotificationStore(state => state.notifications);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ROUTE_DISRUPTION': return <ShieldAlert className="w-5 h-5 text-black" />;
      case 'BUS_REROUTED': return <Navigation className="w-5 h-5 text-black" />;
      case 'CONGESTION_ALERT': return <AlertTriangle className="w-5 h-5 text-black" />;
      default: return <Info className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l-4 border-black">
      <div className="p-4 border-b-4 border-black bg-accent-amber">
        <h2 className="text-xl font-heading font-black uppercase tracking-tight">Alertas Activas</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas">
        {notifications.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-black rounded-xl">
             <p className="font-bold text-gray-500">Sin alertas activas</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="retro-card p-4 relative overflow-visible">
              {/* Retro decorative pin */}
              <div className="absolute -top-3 left-4 w-4 h-6 border-2 border-black bg-red-500 rotate-12 z-10 rounded-sm"></div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-300 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {getIcon(n.type)}
                </div>
                <div>
                  <h4 className="font-bold text-black leading-tight mb-1">{n.title}</h4>
                  <p className="text-sm font-medium text-gray-700">{n.message}</p>
                  <span className="text-xs font-bold text-gray-400 mt-2 block uppercase tracking-wider">
                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
