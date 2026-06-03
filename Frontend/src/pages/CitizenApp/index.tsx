import { useState } from 'react';
import { Compass, Bus, Navigation, Flame, MoveRight, Receipt, Loader2 } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CityMap } from '../../components/map/CityMap';
import { useBusSSE } from '../../hooks/useBusSSE';
import { useNotificationWS } from '../../hooks/useNotificationWS';
import { useCongestionsSSE } from '../../hooks/useCongestionsSSE';
import { calculateRoute } from '../../services/routing.service';
import { chargeTrip } from '../../services/payment.service';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Route } from '../../types/route.types';

export const CitizenApp = () => {
  useBusSSE();
  useNotificationWS('citizen');
  useCongestionsSSE();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);

  const activeTrip = useUserStore(state => state.activeTrip);
  const setActiveTrip = useUserStore(state => state.setActiveTrip);
  const userId = useUserStore(state => state.userId);
  const setBalance = useUserStore(state => state.setBalance);
  const addNotification = useNotificationStore(state => state.addNotification);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const req = {
      origin: { lat: -33.45, lng: -70.66 },
      destination: { lat: -33.42, lng: -70.61 },
      preferences: { optimize: 'time' as const }
    };
    const res = await calculateRoute(req);
    setRoutes(res.routes);
    setIsLoading(false);
  };

  const handleStartTrip = async (route: Route) => {
    setIsLoading(true);
    const res = await chargeTrip({
      user_id: userId,
      route_id: route.route_id,
      segments: route.segments,
      total_amount: route.total_cost_usd
    });
    setIsLoading(false);

    if (res.success && res.new_balance !== undefined) {
      setBalance(res.new_balance);
      setActiveTrip(route);
    } else if (res.error === 'INSUFFICIENT_FUNDS') {
      addNotification({
        id: Math.random().toString(),
        type: 'ROUTE_DISRUPTION',
        title: 'Pago Fallido',
        message: 'Saldo insuficiente para iniciar este viaje.',
        payload: {},
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col relative h-full min-h-0">
        {/* Map — at least 240px tall, grows to ~60% on larger screens */}
        <div className="min-h-[240px] md:flex-[3_3_0%] relative border-b-4 border-black">
          <CityMap mode="citizen" />

          {activeTrip && (
            <div className="absolute top-4 left-4 z-[400] retro-card p-4 !bg-accent-green max-w-[calc(100%-2rem)] sm:max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 shrink-0" />
                <h3 className="font-heading font-black text-lg leading-none">Viaje Activo</h3>
              </div>
              <p className="font-bold text-sm">En dirección al destino.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setActiveTrip(null)} className="retro-btn !bg-white !px-3 !py-1 text-xs">
                  Finalizar Viaje
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel — at least 200px tall, grows to ~40% on larger screens */}
        <div className="flex-[2_2_0%] min-h-[200px] bg-canvas p-4 md:p-6 overflow-y-auto">
          {!activeTrip ? (
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Search Form */}
              <div className="flex-1">
                <div className="retro-card p-4 md:p-6">
                  <h3 className="font-heading font-black text-lg md:text-xl mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 md:w-6 md:h-6 text-accent-blue shrink-0" strokeWidth={3} />
                    Planificar Ruta
                  </h3>
                  <form onSubmit={handleSearch} className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Origen</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        placeholder="Ubicación Actual"
                        className="retro-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Destino</label>
                      <input
                        type="text"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        placeholder="¿A dónde vas?"
                        className="retro-input"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="retro-btn w-full flex justify-center items-center gap-2 mt-2">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar Rutas'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Results */}
              <div className="flex-[2_2_0%] min-w-0">
                {routes.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {routes.map((r, i) => (
                      <div key={i} className="retro-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {r.segments.map((seg, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="retro-badge bg-accent-amber">{seg.mode}</span>
                                {idx < r.segments.length - 1 && <MoveRight className="w-4 h-4 text-gray-500" />}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-gray-600">
                            <span>{r.total_time_minutes} min</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                              {r.total_co2_grams}g CO₂
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <span className="font-mono text-xl md:text-2xl font-black">${r.total_cost_usd.toFixed(2)}</span>
                          <button
                            onClick={() => handleStartTrip(r)}
                            disabled={isLoading}
                            className="retro-btn !bg-accent-green text-sm whitespace-nowrap"
                          >
                            Iniciar vía App
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-4 border-dashed border-black/20 rounded-xl p-6">
                    <div className="text-center">
                      <Navigation className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-bold text-gray-500 text-sm md:text-base">Ingresa un destino para ver rutas multimodales.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full flex items-center justify-center py-8">
              <div className="text-center">
                <Receipt className="w-14 h-14 md:w-16 md:h-16 text-black mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl md:text-3xl font-heading font-black uppercase tracking-tight">Viaje en Progreso</h2>
                <p className="font-bold text-gray-600 mt-2">Que tengas un viaje seguro.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
