import React from 'react';

interface IllustrationProps {
  className?: string;
}

// ─────────────────────────────────────────────────────────────
// Tool Card Header Illustrations (64x64)
// ─────────────────────────────────────────────────────────────

export const FieldIllustration: React.FC<IllustrationProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#e1ede6" />
    {/* Horizon line */}
    <path d="M4 36C20 34 44 38 60 36" stroke="#28453a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Furrow lines */}
    <path d="M12 40L6 58" stroke="#4d856f" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 39L20 58" stroke="#2f5546" strokeWidth="3" strokeLinecap="round" />
    <path d="M38 39L44 58" stroke="#2f5546" strokeWidth="3" strokeLinecap="round" />
    <path d="M52 40L58 58" stroke="#4d856f" strokeWidth="2.5" strokeLinecap="round" />
    {/* Sun in sky */}
    <circle cx="48" cy="18" r="7" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
    {/* Sprout on horizon */}
    <path d="M32 36V26" stroke="#1d352c" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 28C28 26 26 21 31 19C33 21 33 25 32 28Z" fill="#3a6b57" stroke="#1d352c" strokeWidth="1.5" />
    <path d="M32 30C36 28 38 23 33 21C31 23 31 27 32 30Z" fill="#4d856f" stroke="#1d352c" strokeWidth="1.5" />
  </svg>
);

export const ObservationIllustration: React.FC<IllustrationProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#fef3c7" />
    {/* Plant leaf in background */}
    <path d="M16 48C18 32 30 20 46 16C46 32 34 44 16 48Z" fill="#86efac" stroke="#15803d" strokeWidth="2" />
    <path d="M16 48C26 38 36 28 46 16" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
    {/* Magnifying glass */}
    <circle cx="34" cy="30" r="14" fill="#ffffff" fillOpacity="0.85" stroke="#b45309" strokeWidth="3" />
    <circle cx="34" cy="30" r="11" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
    <line x1="44" y1="40" x2="56" y2="52" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
    {/* Detail star inside lens */}
    <path d="M34 24V36M28 30H40" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const WeatherIllustration: React.FC<IllustrationProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#e0f2fe" />
    {/* Sun */}
    <circle cx="42" cy="22" r="9" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
    {/* Cloud */}
    <path
      d="M16 38C13 38 10 35 10 32C10 29 12 26 15 26C16 21 21 18 26 18C30 18 34 20 35 24C37 23 40 24 41 26C43 28 43 31 41 33C43 34 44 36 43 38H16Z"
      fill="#ffffff"
      stroke="#0284c7"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Rain drops */}
    <line x1="18" y1="44" x2="16" y2="52" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="44" x2="26" y2="54" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="44" x2="36" y2="52" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const CropPlanIllustration: React.FC<IllustrationProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#f2f7f4" />
    {/* Circular sequence arrows */}
    <path d="M48 24C48 16 38 12 28 14" stroke="#28453a" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M44 20L49 25L54 20" stroke="#28453a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 40C16 48 26 52 36 50" stroke="#28453a" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 44L15 39L10 44" stroke="#28453a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Center plant seedling */}
    <path d="M32 42V28" stroke="#1d352c" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 30C26 28 22 22 28 20C32 22 32 27 32 30Z" fill="#4d856f" stroke="#1d352c" strokeWidth="1.5" />
    <path d="M32 34C38 32 42 26 36 24C32 26 32 31 32 34Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Water Choice Illustrations (48x48)
// ─────────────────────────────────────────────────────────────

export const RainOnlyIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
    <path
      d="M14 26C12 26 10 24 10 22C10 20 12 18 14 18C15 14 19 12 23 12C26 12 29 14 30 17C31 16 33 17 34 18C36 19 36 21 35 23C37 24 37 26 35 26H14Z"
      fill="#60a5fa"
      stroke="#1d4ed8"
      strokeWidth="2"
    />
    <line x1="16" y1="31" x2="14" y2="37" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="31" x2="22" y2="38" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="31" x2="30" y2="37" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IrrigationIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
    {/* Sprinkler head / pipe */}
    <path d="M24 40V24" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="24" cy="22" r="4" fill="#059669" stroke="#065f46" strokeWidth="2" />
    {/* Sprayed water droplets */}
    <path d="M16 16C18 13 21 12 24 12C27 12 30 13 32 16" stroke="#0284c7" strokeWidth="2" strokeDasharray="2 3" strokeLinecap="round" />
    <circle cx="12" cy="18" r="2" fill="#0284c7" />
    <circle cx="24" cy="8" r="2.2" fill="#0284c7" />
    <circle cx="36" cy="18" r="2" fill="#0284c7" />
  </svg>
);

export const NotSureWaterIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1.5" />
    {/* Water drop shape */}
    <path d="M24 12C24 12 16 23 16 28C16 32.4 19.6 36 24 36C28.4 36 32 32.4 32 28C32 23 24 12 24 12Z" fill="#e7e5e4" stroke="#78716c" strokeWidth="2" />
    {/* Question mark */}
    <text x="24" y="32" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#44403c">?</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Soil Choice Illustrations (48x48)
// ─────────────────────────────────────────────────────────────

export const LoamIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fefce8" stroke="#fde047" strokeWidth="1.5" />
    {/* Crumbly rich soil heap */}
    <path d="M8 38C12 28 36 28 40 38H8Z" fill="#854d0e" stroke="#713f12" strokeWidth="2" />
    {/* Crumb granules */}
    <circle cx="20" cy="33" r="1.5" fill="#ca8a04" />
    <circle cx="28" cy="32" r="2" fill="#ca8a04" />
    <circle cx="16" cy="35" r="1.5" fill="#ca8a04" />
    {/* Fresh green sprout */}
    <path d="M24 28V18" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 20C20 18 18 14 22 13C25 14 25 18 24 20Z" fill="#22c55e" />
  </svg>
);

export const ClayIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fef2f2" stroke="#fecaca" strokeWidth="1.5" />
    {/* Dense heavy clay block */}
    <rect x="10" y="18" width="28" height="20" rx="4" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
    {/* Surface fissures / sticky clay texture */}
    <path d="M16 24L20 28L18 34" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 22L32 27L29 34" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SandIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.5" />
    {/* Sand mound */}
    <path d="M10 38C14 26 34 26 38 38H10Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
    {/* Sand dots */}
    <circle cx="16" cy="32" r="1.2" fill="#fef3c7" />
    <circle cx="22" cy="28" r="1.2" fill="#fef3c7" />
    <circle cx="26" cy="32" r="1.2" fill="#fef3c7" />
    <circle cx="32" cy="34" r="1.2" fill="#fef3c7" />
    <circle cx="20" cy="35" r="1.2" fill="#fef3c7" />
  </svg>
);

export const NotSureSoilIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1.5" />
    <path d="M12 36C16 28 32 28 36 36H12Z" fill="#a8a29e" stroke="#78716c" strokeWidth="2" />
    <text x="24" y="24" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#44403c">?</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Observation Choice Illustrations (48x48)
// ─────────────────────────────────────────────────────────────

export const YellowingLeafIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fef9c3" stroke="#facc15" strokeWidth="1.5" />
    {/* Yellowed leaf */}
    <path d="M12 38C14 24 24 14 36 10C36 24 26 34 12 38Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
    <path d="M12 38C20 30 28 22 36 10" stroke="#a16207" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const WiltingPlantIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
    {/* Drooping plant stem */}
    <path d="M24 38V30C24 24 32 22 32 16" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
    {/* Drooping leaf */}
    <path d="M32 18C34 22 36 26 32 28C30 26 30 22 32 18Z" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
    {/* Cracked dry soil line */}
    <path d="M10 38L18 36L26 38L34 36L40 38" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const LeafSpotsIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
    {/* Green leaf with dark spots */}
    <path d="M12 38C14 24 24 14 36 10C36 24 26 34 12 38Z" fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
    <path d="M12 38C20 30 28 22 36 10" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
    {/* Visible spots */}
    <circle cx="22" cy="22" r="2.5" fill="#7f1d1d" />
    <circle cx="28" cy="18" r="2" fill="#7f1d1d" />
    <circle cx="26" cy="28" r="2" fill="#7f1d1d" />
  </svg>
);

export const StandingWaterIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
    {/* Water pool */}
    <ellipse cx="24" cy="34" rx="16" ry="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
    {/* Plant sitting in pool */}
    <path d="M24 34V18" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 24C20 22 18 18 22 16C24 18 24 22 24 24Z" fill="#10b981" />
    <path d="M24 26C28 24 30 20 26 18C24 20 24 24 24 26Z" fill="#10b981" />
  </svg>
);

export const StuntedGrowthIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fdf4ff" stroke="#f0abfc" strokeWidth="1.5" />
    {/* Small stunted plant */}
    <path d="M20 38V30" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 30C17 28 16 25 19 24C21 25 21 28 20 30Z" fill="#10b981" />
    {/* Height ruler beside it */}
    <line x1="32" y1="12" x2="32" y2="38" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="16" x2="34" y2="16" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="24" x2="34" y2="24" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="32" x2="34" y2="32" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const HealthyGrowthIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
    {/* Tall healthy plant */}
    <path d="M24 38V12" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 24C16 22 14 14 22 12C26 14 26 21 24 24Z" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <path d="M24 28C32 26 34 18 26 16C22 18 22 25 24 28Z" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <circle cx="24" cy="11" r="2" fill="#facc15" />
  </svg>
);

export const NotSureObservationIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1.5" />
    <rect x="14" y="12" width="20" height="24" rx="3" fill="#ffffff" stroke="#78716c" strokeWidth="2" />
    <text x="24" y="29" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#44403c">?</text>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Crop Choice Illustrations (48x48)
// ─────────────────────────────────────────────────────────────

export const WheatIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fefce8" stroke="#fef08a" strokeWidth="1.5" />
    {/* Wheat ear */}
    <path d="M24 38V16" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
    {/* Grains */}
    <ellipse cx="22" cy="18" rx="2.5" ry="4" transform="rotate(-25 22 18)" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
    <ellipse cx="26" cy="18" rx="2.5" ry="4" transform="rotate(25 26 18)" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
    <ellipse cx="22" cy="24" rx="2.5" ry="4" transform="rotate(-25 22 24)" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
    <ellipse cx="26" cy="24" rx="2.5" ry="4" transform="rotate(25 26 24)" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
    {/* Awns */}
    <line x1="20" y1="16" x2="16" y2="10" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="28" y1="16" x2="32" y2="10" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BarleyIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.5" />
    {/* Curved barley stalk */}
    <path d="M20 38C22 28 26 22 30 16" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
    {/* Long bristling awns */}
    <line x1="26" y1="20" x2="36" y2="10" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="28" y1="24" x2="38" y2="14" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="24" y1="26" x2="34" y2="16" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const ChickpeaIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
    {/* Swollen chickpea pod */}
    <ellipse cx="24" cy="24" rx="8" ry="11" fill="#86efac" stroke="#16a34a" strokeWidth="2" />
    <path d="M24 13V9" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
    {/* Small beak tip */}
    <path d="M24 35L26 38" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FieldPeaIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
    {/* Curved pea pod */}
    <path d="M14 18C16 12 30 14 36 26C38 32 32 36 24 36C18 36 12 28 14 18Z" fill="#4ade80" stroke="#15803d" strokeWidth="2" />
    {/* Round peas visible */}
    <circle cx="20" cy="26" r="2.8" fill="#15803d" />
    <circle cx="27" cy="28" r="2.8" fill="#15803d" />
  </svg>
);

export const CanolaIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fefce8" stroke="#fef08a" strokeWidth="1.5" />
    {/* 4 crucifer petals */}
    <circle cx="24" cy="16" r="4.5" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
    <circle cx="24" cy="32" r="4.5" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
    <circle cx="16" cy="24" r="4.5" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
    <circle cx="32" cy="24" r="4.5" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="3" fill="#ca8a04" />
  </svg>
);

export const SorghumIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="1.5" />
    {/* Upright sorghum head */}
    <ellipse cx="24" cy="20" rx="6" ry="11" fill="#be185d" stroke="#9d174d" strokeWidth="2" />
    <path d="M24 38V31" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
    {/* Dense seed texture dots */}
    <circle cx="22" cy="16" r="1.2" fill="#fbcfe8" />
    <circle cx="26" cy="18" r="1.2" fill="#fbcfe8" />
    <circle cx="23" cy="22" r="1.2" fill="#fbcfe8" />
  </svg>
);

export const CoverMixIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
    {/* Clover / vetch leaflet + grass */}
    <path d="M18 36V22" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="18" r="3.5" fill="#22c55e" />
    <circle cx="14" cy="22" r="3.5" fill="#22c55e" />
    <circle cx="22" cy="22" r="3.5" fill="#22c55e" />
    {/* Oat blade */}
    <path d="M28 36C28 26 32 18 36 12" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const OtherCropIllustration: React.FC<IllustrationProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1.5" />
    <path d="M24 36V26" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" />
    <text x="24" y="24" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#44403c">?</text>
  </svg>
);
