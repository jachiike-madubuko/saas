"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", emoji: "⬡" },
  { href: "/duck", label: "Duck", emoji: "🦆" },
  { href: "/habits", label: "Habits", emoji: "◈" },
  { href: "/shop", label: "Shop", emoji: "◉" },
  { href: "/progress", label: "Log", emoji: "▣" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cyber-surface/95 backdrop-blur-md border-t border-cyber-border">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]
                ${isActive ? "text-cyber-cyan" : "text-cyber-dim hover:text-cyber-text"}`}
            >
              <span className={`text-xl transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                {item.emoji}
              </span>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-cyber-cyan" : "text-cyber-dim"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyber-cyan shadow-neon-cyan" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
