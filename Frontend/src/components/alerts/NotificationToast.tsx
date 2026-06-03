import { useEffect } from 'react';
import { AlertTriangle, Info, Navigation, ShieldAlert, X } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

export const NotificationToast = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const removeNotification = useNotificationStore(state => state.removeNotification);

  // Show only the most recent notification for the toast
  const latest = notifications[0];

  useEffect(() => {
    if (latest) {
      const timer = setTimeout(() => {
        removeNotification(latest.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latest, removeNotification]);

  if (!latest) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case 'ROUTE_DISRUPTION': return 'bg-accent-red';
      case 'BUS_REROUTED': return 'bg-accent-blue';
      case 'CONGESTION_ALERT': return 'bg-accent-amber';
      default: return 'bg-accent-green';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ROUTE_DISRUPTION': return <ShieldAlert className="w-6 h-6 text-black" />;
      case 'BUS_REROUTED': return <Navigation className="w-6 h-6 text-black" />;
      case 'CONGESTION_ALERT': return <AlertTriangle className="w-6 h-6 text-black" />;
      default: return <Info className="w-6 h-6 text-black" />;
    }
  };

  return (
    <div className={`pointer-events-auto flex w-96 overflow-hidden rounded-xl border-4 border-black ${getStyle(latest.type)} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-8 duration-300`}>
      <div className="flex w-full items-start p-4">
        <div className="mr-4 mt-1 bg-white border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {getIcon(latest.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black uppercase text-black leading-tight mb-1">{latest.title}</h3>
          <p className="text-sm font-semibold text-black/90">{latest.message}</p>
        </div>
        <button 
          onClick={() => removeNotification(latest.id)}
          className="ml-4 p-1 hover:bg-black/10 rounded-lg transition-colors border-2 border-transparent hover:border-black"
        >
          <X className="w-5 h-5 text-black" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
