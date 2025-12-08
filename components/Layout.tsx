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
    { name: '学習', icon: Zap, path: '/' },
    { name: '文法', icon: BookOpen, path: '/grammar' },
    { name: '統計', icon: BarChart3, path: '/stats' },
    { name: '設定', icon: User, path: '/profile' },
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

          <div className="relative flex justify-around items-end pb-6 h-24 pointer-events-auto px-4 gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex-1 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:translate-y-[2px] active:shadow-none border-b-[3px] border-b-transparent",
                    isActive
                      ? "bg-white dark:bg-[#2a2a2a] shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#111] border-b-slate-200 dark:border-b-black translate-y-[-4px]"
                      : "hover:bg-white/50 dark:hover:bg-[#2a2a2a]/50"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={clsx(
                        "transition-colors",
                        isActive ? "text-rose-500" : "text-slate-400 dark:text-[#666]"
                      )}
                    />
                    <span className={clsx(
                      "text-[10px] font-bold tracking-wide transition-colors",
                      isActive ? "text-slate-700 dark:text-[#e5e5e0]" : "text-slate-400 dark:text-[#666]"
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
