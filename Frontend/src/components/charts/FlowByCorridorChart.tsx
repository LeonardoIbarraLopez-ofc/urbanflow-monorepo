import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const FlowByCorridorChart = () => {
  const data = [
    { name: 'Norte', flow_am: 4000, flow_pm: 5200 },
    { name: 'Sur', flow_am: 3000, flow_pm: 4800 },
    { name: 'Este', flow_am: 2000, flow_pm: 2500 },
    { name: 'Oeste', flow_am: 2780, flow_pm: 3908 },
    { name: 'Centro', flow_am: 8900, flow_pm: 9800 },
  ];

  return (
    <div className="retro-card p-6 h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-black text-xl tracking-tight">Flujo por Corredor</h3>
        <span className="retro-badge bg-white">Últimas 24h</span>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
            <Tooltip 
              cursor={{fill: '#f3f4f6'}}
              contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '10px' }} iconType="circle"/>
            <Bar dataKey="flow_am" name="Pico AM" fill="#3B82F6" stroke="black" strokeWidth={2} radius={[4, 4, 0, 0]} />
            <Bar dataKey="flow_pm" name="Pico PM" fill="#F59E0B" stroke="black" strokeWidth={2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
