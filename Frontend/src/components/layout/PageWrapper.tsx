import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationToast } from '../alerts/NotificationToast';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden">
      <Sidebar />
      {/* On desktop the sidebar is static (in-flow), so this div is flex-1.
          On mobile the sidebar is fixed/overlay, so this div fills the full width. */}
      <div className="flex-1 flex flex-col h-full bg-canvas relative overflow-hidden min-w-0">
        {children}

        <div className="absolute top-20 right-4 md:top-24 md:right-8 z-50 flex flex-col gap-2 pointer-events-none">
          <NotificationToast />
        </div>
      </div>
    </div>
  );
};
