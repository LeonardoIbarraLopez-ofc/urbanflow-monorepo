import { Bell, Menu } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useUIStore } from '../../store/useUIStore';

export const TopBar = ({ title }: { title: string }) => {
  const balance = useUserStore((state) => state.balance);
  const notifications = useNotificationStore((state) => state.notifications);
  const unread = notifications.length;
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="h-16 md:h-20 bg-white border-b-4 border-black px-4 md:px-8 flex items-center justify-between z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — only on mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 border-2 border-black rounded-lg hover:bg-accent-amber transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <h2 className="text-xl md:text-3xl font-heading font-black tracking-tight uppercase leading-none">{title}</h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 bg-canvas border-2 border-black rounded-full px-3 md:px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="hidden sm:inline text-sm font-bold text-gray-500">Saldo</span>
          <span className="font-mono font-bold text-base md:text-lg">${balance.toFixed(2)}</span>
        </div>

        <button className="relative p-2 bg-white border-2 border-black rounded-full hover:bg-accent-amber hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
          <Bell className="w-5 h-5" strokeWidth={2.5} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-red border-2 border-black text-[10px] font-bold text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {unread}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-3 ml-2">
          <div className="w-10 h-10 bg-accent-blue border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};
