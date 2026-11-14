import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  badge,
  defaultOpen = false,
  children,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-sand-300 rounded-lg overflow-hidden bg-white/70 transition-colors">
      <button
        type="button"
        id={id ? `${id}-header` : undefined}
        aria-controls={id ? `${id}-content` : undefined}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left font-medium text-charcoal-900 hover:bg-forest-50/50 transition-colors focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:outline-none"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm md:text-base font-semibold text-charcoal-900">{title}</span>
          {badge && (
            <span className="text-xs bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-charcoal-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-forest-700' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          id={id ? `${id}-content` : undefined}
          role="region"
          aria-labelledby={id ? `${id}-header` : undefined}
          className="p-4 pt-1 text-sm text-charcoal-700 border-t border-sand-200 bg-sand-50/40"
        >
          {children}
        </div>
      )}
    </div>
  );
};
