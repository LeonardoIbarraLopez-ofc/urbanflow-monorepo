import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CityMap } from '../../components/map/CityMap';
import { NotificationPanel } from '../../components/alerts/NotificationPanel';
import { useBusSSE } from '../../hooks/useBusSSE';
import { useNotificationWS } from '../../hooks/useNotificationWS';
import { useCongestionsSSE } from '../../hooks/useCongestionsSSE';
import { useMapStore } from '../../store/useMapStore';
import { manualReroute } from '../../services/routing.service';
import { TopBar } from '../../components/layout/TopBar';
import { API_CONFIG } from '../../config/api.config';
import { TrafficCone, Zap } from 'lucide-react';

// NTCIP intersection mock data — replaced by real SSE from traffic-light-bridge-ms
const MOCK_INTERSECTIONS = [
  { id: 'INT-001', name: 'Av. Libertador / O\'Higgins', status: 'green' as const },
  { id: 'INT-002', name: 'Av. Alameda / Brasil',       status: 'amber' as const },
  { id: 'INT-003', name: 'Costanera / Kennedy',        status: 'red'   as const },
  { id: 'INT-004', name: 'Blanco Encalada / Bulnes',   status: 'green' as const },
  { id: 'INT-005', name: 'Vicuña Mackenna / Irarrázaval', status: 'green' as const },
  { id: 'INT-006', name: 'Santa Rosa / Av. Matta',     status: 'amber' as const },
];

type IntersectionStatus = 'green' | 'amber' | 'red';

const STATUS_STYLES: Record<IntersectionStatus, string> = {
  green: 'bg-accent-green text-white',
  amber: 'bg-accent-amber text-black',
  red:   'bg-accent-red text-white',
};

const STATUS_LABELS: Record<IntersectionStatus, string> = {
  green: 'Normal',
  amber: 'Prioridad',
  red:   'Bloqueado',
};

export const ControlCenter = () => {
  useBusSSE();
  useNotificationWS('operator');
  useCongestionsSSE();

  const buses = useMapStore(state => state.buses);
  const [intersections, setIntersections] = useState(MOCK_INTERSECTIONS);
  const [sendingPriority, setSendingPriority] = useState<string | null>(null);

  const handleReroute = async (busId: string) => {
    if (confirm(`¿Forzar re-enrutamiento para el Bus ${busId}?`)) {
      await manualReroute(busId);
      alert(`Señal de re-enrutamiento enviada para ${busId}`);
    }
  };

  // POST /traffic-lights/priority — Dev 5 traffic-light-bridge-ms endpoint
  const handleTrafficPriority = async (intersectionId: string) => {
    setSendingPriority(intersectionId);
    try {
      await fetch(`${API_CONFIG.TRAFFIC_LIGHT}/traffic-lights/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intersection_id: intersectionId, priority_type: 'BUS', duration_seconds: 60 }),
      });
      setIntersections(prev =>
        prev.map(i => i.id === intersectionId ? { ...i, status: 'amber' as const } : i)
      );
    } catch {
      // mock: optimistic update regardless
      setIntersections(prev =>
        prev.map(i => i.id === intersectionId ? { ...i, status: 'amber' as const } : i)
      );
    } finally {
      setSendingPriority(null);
    }
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col h-full bg-canvas relative overflow-hidden min-h-0">
        <TopBar title="Centro de Control" />

        {/* Main layout: stacks on mobile, side-by-side on lg+ */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

          {/* Map */}
          <div className="flex-[7_7_0%] min-h-[280px] lg:min-h-0 relative">
            <CityMap mode="operator" />
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-auto lg:flex-[3_3_0%] lg:min-w-[320px] flex flex-col bg-canvas z-10 border-t-4 lg:border-t-0 lg:border-l-4 border-black overflow-hidden">

            {/* Alerts Section */}
            <div className="flex-1 overflow-hidden border-b-4 border-black min-h-[180px] lg:min-h-0">
              <NotificationPanel />
            </div>

            {/* Fleet Status */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-[180px] lg:min-h-0">
              <div className="p-3 border-b-4 border-black bg-accent-blue shrink-0">
                <h2 className="text-lg md:text-xl font-heading font-black text-white tracking-tight uppercase">Estado de la Flota</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-canvas">
                <div className="space-y-3">
                  {buses.map((bus) => (
                    <div key={bus.bus_id} className="retro-card p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-base leading-none truncate">{bus.bus_id}</h4>
                        <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded border border-gray-400 mt-1 inline-block">
                          Ruta {bus.route_id}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm">{bus.speed_kmh} km/h</div>
                        <button
                          onClick={() => handleReroute(bus.bus_id)}
                          className="text-xs retro-btn !px-2 !py-1 mt-1 !bg-accent-amber"
                        >
                          Re-enrutar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Light Bridge — Req #4 (NTCIP) */}
            <div className="flex flex-col bg-white border-t-4 border-black overflow-hidden min-h-[200px] lg:min-h-[240px]">
              <div className="p-3 border-b-4 border-black bg-black shrink-0 flex items-center gap-2">
                <TrafficCone className="w-5 h-5 text-accent-amber shrink-0" />
                <h2 className="text-lg font-heading font-black text-white tracking-tight uppercase">Semáforos NTCIP</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-canvas">
                <div className="space-y-2">
                  {intersections.map((intersection) => (
                    <div key={intersection.id} className="retro-card p-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs leading-tight truncate">{intersection.name}</p>
                        <span className={`retro-badge text-[10px] mt-0.5 ${STATUS_STYLES[intersection.status]}`}>
                          {STATUS_LABELS[intersection.status]}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTrafficPriority(intersection.id)}
                        disabled={sendingPriority === intersection.id || intersection.status === 'amber'}
                        className="retro-btn !px-2 !py-1 text-[11px] shrink-0 flex items-center gap-1 disabled:opacity-50"
                      >
                        <Zap className="w-3 h-3" />
                        {sendingPriority === intersection.id ? '...' : 'Prioridad Bus'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
