import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Layers, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudyStore } from '../store/useStudyStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionType = useStudyStore((state) => state.sessionType);

  const navItems = [
    { name: '学习', icon: Zap, path: '/' },
    { name: '语境', icon: Layers, path: '/context' },
    { name: '我的', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Main Content */}
      <main className={clsx("flex-1 overflow-hidden relative h-full", !sessionType && "pb-20")}>
        {children}
      </main>

      {/* Mobile Bottom Nav - Hidden when sessionType is active */}
      {!sessionType && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                    isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] font-medium tracking-wide">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};