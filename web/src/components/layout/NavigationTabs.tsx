import React from 'react';
import { MapPin, Compass, ShieldAlert } from 'lucide-react';

export type TabId = 'my-farm' | 'explorer' | 'evidence';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'my-farm' as TabId,
      label: '1. Your Farm',
      description: 'Location, crops & water',
      icon: MapPin,
    },
    {
      id: 'explorer' as TabId,
      label: '2. Explore Crop Plans',
      description: 'Compare options & trade-offs',
      icon: Compass,
    },
    {
      id: 'evidence' as TabId,
      label: '3. Data Status & Evidence',
      description: 'How this works & limitations',
      icon: ShieldAlert,
    },
  ];

  return (
    <nav
      aria-label="Workspace Sections"
      className="border-b border-sand-300 bg-sand-50/90 sticky top-0 z-20 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label="Application sections"
          className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`tabpanel-${tab.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:outline-none ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-sm ring-1 ring-forest-900 font-semibold'
                    : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-sand-200/80'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-forest-200' : 'text-charcoal-600'
                  }`}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <div className="leading-snug">{tab.label}</div>
                  <div
                    className={`text-xs leading-snug hidden md:block ${
                      isActive ? 'text-forest-200' : 'text-charcoal-600'
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
