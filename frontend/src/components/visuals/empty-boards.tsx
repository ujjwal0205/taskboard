export function EmptyBoardsArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="empty-a" x1="0" y1="0" x2="240" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="160" rx="86" ry="10" fill="#8b5cf6" fillOpacity="0.15" />
      <rect x="34" y="30" width="172" height="112" rx="16" fill="#12122a" stroke="url(#empty-a)" strokeOpacity="0.6" />
      <rect x="48" y="46" width="44" height="82" rx="8" fill="white" fillOpacity="0.05" />
      <rect x="98" y="46" width="44" height="82" rx="8" fill="white" fillOpacity="0.05" />
      <rect x="148" y="46" width="44" height="82" rx="8" fill="white" fillOpacity="0.05" strokeDasharray="4 4" stroke="white" strokeOpacity="0.25" />
      <rect x="54" y="54" width="32" height="18" rx="5" fill="#8b5cf6" fillOpacity="0.55" />
      <rect x="54" y="78" width="32" height="18" rx="5" fill="white" fillOpacity="0.12" />
      <rect x="104" y="54" width="32" height="18" rx="5" fill="#d946ef" fillOpacity="0.5" />
      <path d="M170 79v16M162 87h16" stroke="url(#empty-a)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="206" cy="30" r="5" fill="#67e8f9" />
      <circle cx="30" cy="96" r="3" fill="#c4b5fd" />
      <path d="M212 108l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f0abfc" fillOpacity="0.8" />
    </svg>
  );
}
