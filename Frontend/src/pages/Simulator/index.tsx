import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { TopBar } from '../../components/layout/TopBar';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { useUserStore } from '../../store/useUserStore';
import { injectGps } from '../../services/telemetry.service';
import { simulateCongestion } from '../../services/analytics.service';
import { reserveScooter } from '../../services/scooter.service';
import { chargeTrip } from '../../services/payment.service';
import { Activity, MapPin, Zap, AlertTriangle, Banknote } from 'lucide-react';
import { CityMap } from '../../components/map/CityMap';

export const Simulator = () => {
  const { logs, routingTimerStart, routingTimerEnd, startRoutingTimer } = useSimulatorStore();
  const setBalance = useUserStore(state => state.setBalance);

  const [gpsBusId, setGpsBusId] = useState('B-101');
  const [gpsLat, setGpsLat] = useState('-33.4480');
  const [gpsLng, setGpsLng] = useState('-70.6690');

  const [congCorridor, setCongCorridor] = useState('C-NORTH');
  const [congDensity, setCongDensity] = useState(90);

  const [scooterToken1, setScooterToken1] = useState<string | null>(null);
  const [scooterToken2, setScooterToken2] = useState<string | null>(null);

  const elapsed = (routingTimerEnd && routingTimerStart) ? (routingTimerEnd - routingTimerStart) / 1000 : null;

  const handleInjectGps = async () => {
    await injectGps({
      bus_id: gpsBusId,
      lat: parseFloat(gpsLat),
      lng: parseFloat(gpsLng),
      speed_kmh: 40
    });
  };

  const handleSimulateCongestion = async () => {
    startRoutingTimer();
    await simulateCongestion(congCorridor, congDensity);
  };

  const handleConcurrentReserve = async () => {
    setScooterToken1('Loading...');
    setScooterToken2('Loading...');

    const [res1, res2] = await Promise.all([
      reserveScooter({ scooter_id: 'S-777', user_id: 'U-1' }),
      reserveScooter({ scooter_id: 'S-777', user_id: 'U-2' })
    ]);

    setScooterToken1(res1.success ? '✅ OK' : `❌ ${res1.error}`);
    setScooterToken2(res2.success ? '✅ OK' : `❌ ${res2.error}`);
  };

  const handleMockCharge = async () => {
    setBalance(10.50);
    await chargeTrip({
      user_id: 'USR-1',
      route_id: 'R-TEST',
      segments: [],
      total_amount: 50.0
    });
  };

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col h-full relative min-h-0">
        <TopBar title="Demo Simulador" />

        {/* Main layout: stack vertically on narrow screens, side-by-side on xl+ */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-0">

          {/* Controls Panel */}
          <div className="w-full xl:w-[420px] xl:max-w-[420px] shrink-0 bg-white border-b-4 xl:border-b-0 xl:border-r-4 border-black overflow-y-auto p-4 md:p-6 z-10 flex flex-col gap-4 md:gap-6">

            {/* MVP 1.2 — GPS Inject */}
            <div className="retro-card p-4">
              <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
                <MapPin className="text-accent-blue shrink-0" />
                <h3 className="font-bold text-base md:text-lg leading-none">1. Inyectar GPS (SSE)</h3>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-bold mb-1 text-gray-500">Bus ID</label>
                <input className="retro-input !py-1 text-sm w-full" value={gpsBusId} onChange={e => setGpsBusId(e.target.value)} />
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1 text-gray-500">Lat</label>
                  <input className="retro-input !py-1 text-sm w-full" value={gpsLat} onChange={e => setGpsLat(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1 text-gray-500">Lng</label>
                  <input className="retro-input !py-1 text-sm w-full" value={gpsLng} onChange={e => setGpsLng(e.target.value)} />
                </div>
              </div>
              <button onClick={handleInjectGps} className="retro-btn !py-1 w-full flex justify-center text-sm">Enviar</button>
            </div>

            {/* MVP 3.2 — Congestion */}
            <div className="retro-card p-4">
              <div className="flex flex-col gap-1 border-b-2 border-black pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-accent-red shrink-0" />
                  <h3 className="font-bold text-base md:text-lg leading-none">2. Simular Congestión</h3>
                </div>
                <span className="text-xs text-gray-500 font-bold">Triggers E2E Reroute Event via WS</span>
              </div>
              <div className="mb-3">
                <input
                  type="range" min="0" max="100" value={congDensity}
                  onChange={e => setCongDensity(parseInt(e.target.value))}
                  className="w-full accent-black"
                />
                <div className="text-sm font-mono text-center font-bold mt-1">{congDensity}% Densidad</div>
              </div>
              <button onClick={handleSimulateCongestion} className="retro-btn !bg-accent-red !text-white !py-1 w-full text-sm">Activar</button>
            </div>

            {/* MVP 2.2 — Scooter concurrency */}
            <div className="retro-card p-4">
              <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
                <Zap className="text-accent-amber shrink-0" />
                <h3 className="font-bold text-base md:text-lg leading-none">3. Reservar Scooter</h3>
              </div>
              <button onClick={handleConcurrentReserve} className="retro-btn !px-2 !py-1 w-full mb-3 text-sm">Enviar 2x Peticiones (Promise.all)</button>
              <div className="flex gap-2 text-sm font-mono font-bold">
                <div className="flex-1 bg-gray-100 border border-black rounded p-2 text-center break-all">{scooterToken1 || '-'}</div>
                <div className="flex-1 bg-gray-100 border border-black rounded p-2 text-center break-all">{scooterToken2 || '-'}</div>
              </div>
            </div>

            {/* MVP 1.3 — Payment */}
            <div className="retro-card p-4">
              <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
                <Banknote className="text-accent-green shrink-0" />
                <h3 className="font-bold text-base md:text-lg leading-none">4. Reembolso de Pago</h3>
              </div>
              <button onClick={handleMockCharge} className="retro-btn !py-1 w-full text-sm">Simular Cobro ($50.00)</button>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="flex-1 flex flex-col bg-canvas p-4 md:p-6 gap-4 md:gap-6 overflow-hidden min-h-0">

            {/* Map */}
            <div className="flex-1 border-4 border-black rounded-xl overflow-hidden shadow-retro relative min-h-[200px]">
              <CityMap />
              {routingTimerStart && !routingTimerEnd && (
                <div className="absolute inset-0 bg-red-500/10 z-50 flex items-center justify-center animate-pulse pointer-events-none">
                  <div className="bg-white border-4 border-black p-4 font-black text-lg md:text-2xl shadow-retro text-center">
                    ESPERANDO SSE → WS REROUTE
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row: timer + kafka logs */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 h-auto sm:h-48 shrink-0">
              {/* Timer */}
              <div className="w-full sm:w-1/3 retro-card p-4 bg-yellow-300 flex flex-col justify-center items-center text-center min-h-[120px] sm:min-h-0">
                <h4 className="font-black tracking-widest uppercase mb-2 text-xs md:text-sm">Cronómetro Re-enrutamiento</h4>
                <div className="font-mono text-4xl md:text-5xl font-black">{elapsed !== null ? `${elapsed.toFixed(2)}s` : '--'}</div>
                {elapsed !== null && (
                  <span className={`retro-badge mt-2 ${elapsed < 10 ? 'bg-accent-green' : 'bg-accent-red'} text-white`}>
                    Meta &lt; 10s
                  </span>
                )}
              </div>

              {/* Kafka Logs */}
              <div className="flex-1 bg-black border-4 border-gray-800 rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-green-400 font-bold shadow-retro flex flex-col min-h-[120px] sm:min-h-0">
                {logs.length > 0 ? logs.map((l, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-gray-500">[{l.timestamp}]</span> {l.message}
                  </div>
                )) : (
                  <div className="text-gray-600 self-center m-auto animate-pulse flex items-center justify-center h-full w-full">
                    Esperando Eventos...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
