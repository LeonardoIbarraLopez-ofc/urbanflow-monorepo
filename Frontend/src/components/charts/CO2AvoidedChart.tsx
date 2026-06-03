import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CO2AvoidedChart = () => {
  const data = [
    { time: '06:00', value: 100 },
    { time: '08:00', value: 450 },
    { time: '10:00', value: 800 },
    { time: '12:00', value: 1100 },
    { time: '14:00', value: 1400 },
    { time: '16:00', value: 1800 },
    { time: '18:00', value: 2600 },
    { time: '20:00', value: 2800 },
  ];

  return (
    <div className="retro-card p-6 h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-black text-xl tracking-tight">Emisiones de CO₂ Evitadas</h3>
        <span className="retro-badge bg-accent-green text-white">vs Línea Base</span>
      </div>
      <div className="flex-1 w-full relative">
         <div className="absolute top-2 left-4 z-10">
            <span className="text-3xl font-black font-mono">2.8t</span>
            <span className="text-sm font-bold text-gray-500 ml-1">acumulado</span>
         </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 40, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
            <Tooltip 
              contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="value" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
