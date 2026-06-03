import { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { TopBar } from '../../components/layout/TopBar';
import { useUserStore } from '../../store/useUserStore';
import { getPaymentHistory, rechargeAccount } from '../../services/payment.service';
import { Transaction } from '../../types/payment.types';
import { format } from 'date-fns';
import { Wallet, Plus, CreditCard as CardIcon, ArrowDownToLine, Smartphone } from 'lucide-react';

export const Payments = () => {
  const balance = useUserStore(state => state.balance);
  const setBalance = useUserStore(state => state.setBalance);
  const userId = useUserStore(state => state.userId);
  
  const [history, setHistory] = useState<Transaction[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState('10');
  const [isRecharging, setIsRecharging] = useState(false);

  useEffect(() => {
    getPaymentHistory(userId).then(res => setHistory(res.transactions));
  }, [userId, balance]); // reload on balance change to simulate state refresh

  const handleRecharge = async (method: string) => {
    setIsRecharging(true);
    const amountNum = parseFloat(rechargeAmount);
    if(isNaN(amountNum) || amountNum <= 0) {
      setIsRecharging(false);
      return;
    }
    const res = await rechargeAccount(userId, amountNum, method);
    if(res.success) {
      setBalance(res.new_balance);
      setRechargeAmount('10'); // reset
    }
    setIsRecharging(false);
  };

  return (
    <PageWrapper>
      <TopBar title="Pagos y Saldo" />
      
      <div className="p-4 md:p-8 overflow-y-auto w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
         {/* Balance Card */}
         <div className="flex-1">
            <div className="retro-card p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white overflow-hidden relative">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
               
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-12">
                   <h3 className="font-bold text-gray-300 tracking-wider uppercase text-sm">Tarjeta Ciudadano</h3>
                   <Wallet className="w-8 h-8 text-accent-amber" />
                 </div>
                 
                 <div>
                   <p className="text-gray-400 font-bold mb-1">Saldo Disponible</p>
                   <h2 className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white">
                     <span className="text-accent-green">$</span>{(balance ?? 0).toFixed(2)}
                   </h2>
                 </div>
               </div>
            </div>

            <div className="mt-8 retro-card p-6 bg-white">
              <h3 className="font-heading font-black text-xl mb-4">Recargar Saldo</h3>
              
              <div className="flex gap-1 md:gap-2 mb-6">
                {['5', '10', '20', '50'].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setRechargeAmount(amt)}
                    className={`flex-1 font-bold border-2 border-black rounded-lg py-2 ${rechargeAmount === amt ? 'bg-black text-white shadow-retro' : 'bg-transparent text-black hover:bg-gray-100'}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button onClick={() => handleRecharge('NFC')} disabled={isRecharging} className="retro-btn !bg-accent-blue/20 !border-accent-blue/50 flex flex-col items-center justify-center py-4 gap-2">
                    <Smartphone className="w-6 h-6" />
                    <span>Tap NFC</span>
                 </button>
                 <button onClick={() => handleRecharge('CARD')} disabled={isRecharging} className="retro-btn !bg-accent-amber/20 !border-accent-amber/50 flex flex-col items-center justify-center py-4 gap-2">
                    <CardIcon className="w-6 h-6" />
                    <span>Tarjeta de Crédito</span>
                 </button>
              </div>
            </div>
         </div>

         {/* History Card */}
         <div className="flex-[1.5]">
            <div className="retro-card p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-heading font-black text-xl">Historial de Transacciones</h3>
                 <span className="retro-badge bg-white">Últimos 30 días</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                 <div className="space-y-4">
                    {history.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg bg-canvas/50">
                         <div className="flex items-center gap-4">
                            <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
                               <ArrowDownToLine className="w-5 h-5" />
                            </div>
                            <div>
                               <h4 className="font-bold text-lg">Viaje en {tx.mode === 'APP' ? 'App' : tx.mode === 'BUS' ? 'Bus' : tx.mode === 'METRO' ? 'Metro' : tx.mode === 'WALK' ? 'Caminata' : 'Scooter'}</h4>
                               <p className="text-xs text-gray-500 font-bold font-mono">{format(new Date(tx.date), 'MMM dd, HH:mm')}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="font-mono font-black text-xl">${tx.amount.toFixed(2)}</div>
                            {tx.status === 'REJECTED' ? (
                               <span className="retro-badge bg-accent-red text-white uppercase mt-1">Fondos Insuficientes</span>
                            ) : (
                               <span className="text-xs font-bold text-accent-green uppercase tracking-wide mt-1 block">Completado</span>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
         </div>
      </div>
    </PageWrapper>
  );
};
