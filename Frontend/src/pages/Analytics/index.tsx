import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { TopBar } from '../../components/layout/TopBar';
import { FlowByCorridorChart } from '../../components/charts/FlowByCorridorChart';
import { CO2AvoidedChart } from '../../components/charts/CO2AvoidedChart';
import { getRealtimeKPIs } from '../../services/analytics.service';
import { useDuckDB } from '../../hooks/useDuckDB';
import { AnalyticsKPIs } from '../../types/analytics.types';
import { Download, Database, Zap } from 'lucide-react';

export const Analytics = () => {
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const { isReady, executeQuery } = useDuckDB();
  const [queryObj, setQueryObj] = useState("SELECT corridor, avg(flow) FROM mobility WHERE date BETWEEN '2024-01-01' AND '2024-12-31';");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  useEffect(() => {
    getRealtimeKPIs().then(setKpis);
  }, []);

  const handleQuery = async () => {
    setIsQuerying(true);
    const start = performance.now();
    const result = await executeQuery(queryObj);
    const end = performance.now();
    setQueryResult(result as any[]);
    setQueryTime(Math.round(end - start));
    setIsQuerying(false);
  };

  return (
    <PageWrapper>
       <TopBar title="Analítica de Movilidad" />
       
       <div className="p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6 md:space-y-8">

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white border-4 border-black p-4 rounded-xl shadow-retro">
             <div className="flex items-center gap-3">
               <div className="bg-accent-purple p-2 border-2 border-black rounded-lg text-white">
                 <Zap size={24} />
               </div>
               <div>
                  <h3 className="font-heading font-black text-xl leading-none">Telemetría de Red en Vivo</h3>
                  <p className="text-sm font-bold text-gray-500">Tasas de ingesta del sistema en tiempo real</p>
               </div>
             </div>
             <button className="retro-btn flex items-center gap-2 !bg-white">
               <Download size={16} /> Exportar PDF
             </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
             <div className="retro-card p-4 md:p-6 bg-accent-blue/10">
               <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight mb-2">Flujo de Ingesta</p>
               <h2 className="text-3xl md:text-4xl font-black font-mono">{kpis ? `${(kpis.events_per_second / 1000).toFixed(1)}k` : '...'}</h2>
               <p className="text-xs font-bold text-gray-500 mt-1">eventos/seg</p>
             </div>
             <div className="retro-card p-4 md:p-6 bg-accent-green/10">
               <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight mb-2">Puntualidad</p>
               <h2 className="text-3xl md:text-4xl font-black font-mono">{kpis?.punctuality_index_percent || '...'}%</h2>
               <p className="text-xs font-bold text-gray-500 mt-1">índice a tiempo</p>
             </div>
             <div className="retro-card p-4 md:p-6 bg-accent-amber/10">
               <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight mb-2">CO₂ Evitado</p>
               <h2 className="text-3xl md:text-4xl font-black font-mono">-{(kpis?.co2_avoided_kg_today || 0) / 1000}t</h2>
               <p className="text-xs font-bold text-gray-500 mt-1">vs estimado de hoy</p>
             </div>
             <div className="retro-card p-4 md:p-6 bg-white">
               <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight mb-2">Ocupación Promedio</p>
               <h2 className="text-3xl md:text-4xl font-black font-mono">{kpis?.avg_occupancy_percent || '...'}%</h2>
               <p className="text-xs font-bold text-gray-500 mt-1">capacidad de red</p>
             </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <FlowByCorridorChart />
             <CO2AvoidedChart />
          </div>

          {/* DuckDB Historical Query System */}
          <div className="retro-card p-6 border-blue-900 border-4">
             <div className="flex items-center gap-2 mb-4">
                <Database className="w-6 h-6 text-accent-blue" />
                <h3 className="font-heading font-black text-2xl tracking-tight">Consultas Históricas OLAP (DuckDB-Wasm)</h3>
             </div>
             <p className="font-bold text-sm text-gray-600 mb-4 max-w-3xl">
               Consultando directamente 10 años de datos Parquet almacenados en Supabase desde el hilo del navegador sin sobrecarga del backend.
             </p>
             
             <div className="bg-canvas border-2 border-black rounded-lg overflow-hidden flex flex-col mb-4">
                <textarea 
                  className="w-full bg-transparent p-4 font-mono text-sm focus:outline-none focus:bg-white resize-none h-24"
                  value={queryObj}
                  onChange={(e) => setQueryObj(e.target.value)}
                />
                <div className="bg-gray-100 border-t-2 border-black p-3 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <span className={`w-3 h-3 rounded-full border border-black ${isReady ? 'bg-accent-green' : 'bg-accent-red'} animate-pulse`}></span>
                     <span className="font-bold text-xs uppercase text-gray-600">{isReady ? 'WASM Listo' : 'Iniciando WASM...'}</span>
                   </div>
                   <button 
                     onClick={handleQuery} 
                     disabled={!isReady || isQuerying}
                     className="retro-btn !py-1 flex items-center gap-2 text-sm"
                   >
                     {isQuerying ? 'Ejecutando...' : 'Ejecutar Consulta'}
                   </button>
                </div>
             </div>

             {/* Results */}
             {queryResult && (
               <div className="bg-white border-2 border-black rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold">Tabla de Resultados</h4>
                   {queryTime !== null && (
                      <span className={`retro-badge ${queryTime < 2000 ? 'bg-accent-green text-white' : 'bg-accent-amber text-black'}`}>
                        {queryTime}ms {queryTime < 2000 ? '✅' : '⚠️'}
                      </span>
                   )}
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                      <thead>
                        <tr className="border-b-2 border-black">
                          {Object.keys(queryResult[0] || {}).map(k => (
                             <th key={k} className="pb-2">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.map((row, i) => (
                           <tr key={i} className="border-b border-gray-200">
                              {Object.values(row).map((val: any, j) => (
                                <td key={j} className="py-2">{val.toString()}</td>
                              ))}
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
             )}
          </div>
       </div>
    </PageWrapper>
  );
};
