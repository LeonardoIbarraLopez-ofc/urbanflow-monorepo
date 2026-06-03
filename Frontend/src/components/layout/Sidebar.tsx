import { NavLink } from 'react-router-dom';
import { Compass, Activity, CreditCard, LayoutDashboard, Home, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../store/useUIStore';

export const Sidebar = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  const navItems = [
    { name: 'App Ciudadano', path: '/citizen', icon: Compass },
    { name: 'Centro de Control', path: '/control', icon: Activity },
    { name: 'Analítica', path: '/analytics', icon: LayoutDashboard },
    { name: 'Pagos', path: '/payments', icon: CreditCard },
    { name: 'Simulador', path: '/simulator', icon: Home },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r-4 border-black flex flex-col pt-6 pb-6 shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] z-40',
          'transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-amber border-2 border-black rounded-sm flex items-center justify-center font-bold text-xl transform -rotate-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">U</div>
            <h1 className="text-2xl font-heading font-black tracking-tighter uppercase leading-none">UrbanFlow</h1>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md border-2 border-black hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg border-2 font-bold transition-all',
                isActive
                  ? 'bg-accent-blue/10 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-1'
                  : 'border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx('w-5 h-5', isActive ? 'text-accent-blue' : 'text-gray-600')} strokeWidth={2.5} />
                  <span className={clsx(isActive ? 'text-black' : 'text-gray-600')}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 mt-auto">
          <div className="bg-canvas border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">ESTADO</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-green border border-black animate-pulse" />
              <span className="font-bold text-sm">Sistema en Línea</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
