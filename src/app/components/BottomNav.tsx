import type { Platform } from '@/lib/database.types';
import type { Tab } from '../types';
import { brand } from '../theme/brand';

interface BottomNavProps {
  platforms: Platform[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ platforms, activeTab, onTabChange }: BottomNavProps) {
  const items: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Home' },
    ...platforms.map((p) => ({ id: p.slug, label: p.name })),
  ];

  const itemCount = items.length;
  const fontSize =
    itemCount <= 3 ? '13px' : itemCount === 4 ? '12px' : '11px';

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
      aria-label="Main navigation"
    >
      <div
        className="pointer-events-auto flex w-full min-w-0 items-stretch gap-0.5 rounded-full px-2.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: brand.navBg }}
      >
        {items.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={isActive ? 'page' : undefined}
              title={label}
              className="flex min-w-0 flex-1 items-center justify-center rounded-full transition-all duration-200 active:scale-95"
              style={
                isActive
                  ? {
                      backgroundColor: brand.navActive,
                      color: brand.navActiveFg,
                      padding: '10px 8px',
                    }
                  : {
                      color: brand.navInactive,
                      padding: '10px 6px',
                    }
              }
            >
              <span
                className="block w-full px-0.5 text-center font-semibold leading-[1.15] line-clamp-2 break-words"
                style={{ fontSize }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
