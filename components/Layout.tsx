import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, BarChart3, User, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useStudyStore } from '../store/useStudyStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionType = useStudyStore((state) => state.sessionType);
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Apply dark mode to document element
  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  const navItems = [
    { name: '学习', icon: Zap, path: '/' },
    { name: '语法', icon: BookOpen, path: '/grammar' },
    { name: '统计', icon: BarChart3, path: '/stats' },
    { name: '我的', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7F6F2] dark:bg-[#1a1a1a] text-slate-800 dark:text-[#f5f5f0] font-sans flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Main Content */}
      <main className={clsx("flex-1 overflow-y-auto overflow-x-hidden relative h-full safe-bottom", !sessionType && "pb-28")}>
        {children}
      </main>

      {/* Mobile Bottom Nav - Hidden during active session */}
      {!sessionType && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-transparent z-50 pointer-events-none">
          {/* Glass Gradient Background */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F7F6F2] dark:from-[#1a1a1a] via-[#F7F6F2]/95 dark:via-[#1a1a1a]/95 to-transparent pointer-events-none transition-colors duration-300" />

          <div className="relative flex justify-around items-end pb-6 h-24 pointer-events-auto px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-all duration-300",
                    isActive ? "translate-y-[-4px]" : ""
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={clsx(
                      "transition-all duration-300 relative",
                      isActive ? "text-[#D45D5D]" : "text-slate-300 dark:text-[#555]"
                    )}>
                      {isActive && (
                        <div className="absolute inset-0 bg-[#D45D5D] blur-xl opacity-20 rounded-full" />
                      )}
                      <item.icon
                        size={isActive ? 28 : 24}
                        strokeWidth={isActive ? 3 : 2}
                        fill={isActive ? "currentColor" : "none"}
                        className={isActive ? "icon-3d-nav" : ""}
                      />
                    </div>
                    <span className={clsx(
                      "text-[10px] font-bold tracking-wide transition-all duration-300",
                      isActive ? "text-[#D45D5D] opacity-100" : "text-slate-300 dark:text-[#555] opacity-80"
                    )}>
                      {item.name}
                    </span>
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
