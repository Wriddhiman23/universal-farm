import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'sand' | 'charcoal' | 'blue' | 'amber' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    forest: 'bg-forest-100 text-forest-900 border-forest-300',
    sand: 'bg-sand-200 text-charcoal-800 border-sand-300',
    charcoal: 'bg-charcoal-100 text-charcoal-900 border-charcoal-300',
    blue: 'bg-accent-blue-100 text-accent-blue-800 border-accent-blue-200',
    amber: 'bg-accent-amber-100 text-accent-amber-800 border-accent-amber-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs md:text-sm px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
