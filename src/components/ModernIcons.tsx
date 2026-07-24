import React from 'react';

interface IconProps {
  className?: string;
  active?: boolean;
}

export const PanelIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="panelG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="panelG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00355f" />
          <stop offset="100%" stopColor="#0f4c81" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="7" height="10" rx="2.5" fill="url(#panelG1)" />
      <rect x="14" y="3" width="7" height="6" rx="2.5" fill="url(#panelG2)" />
      <rect x="3" y="15" width="7" height="6" rx="2.5" fill="url(#panelG2)" />
      <rect x="14" y="11" width="7" height="10" rx="2.5" fill="url(#panelG1)" />
    </svg>
  );
};

export const MuroIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="muroG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="muroG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      {/* Board backdrop */}
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" className={active ? "text-[#00355f]" : "text-[#00355f]/40"} />
      {/* Mini post-it notes */}
      <rect x="6" y="6" width="5" height="5" rx="1.5" fill="url(#muroG1)" />
      <rect x="13" y="6" width="5" height="7" rx="1.5" fill="url(#muroG2)" />
      <rect x="6" y="13" width="5" height="5" rx="1.5" fill="url(#muroG2)" />
      <rect x="13" y="15" width="5" height="3" rx="1.5" fill="url(#muroG1)" />
    </svg>
  );
};

export const TrabajosIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trabajosG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
        <linearGradient id="trabajosG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Briefcase body */}
      <rect x="3" y="7" width="18" height="13" rx="3.5" fill="url(#trabajosG1)" />
      {/* Latch */}
      <rect x="10" y="7" width="4" height="3.5" rx="1" fill="url(#trabajosG2)" />
      {/* Handle */}
      <path d="M8 7V4.5C8 3.67157 8.67157 3 9.5 3H14.5C15.3284 3 16 3.67157 16 4.5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={active ? "text-[#00355f]" : "text-[#00355f]/50"} />
    </svg>
  );
};

export const MensajesIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msgG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="msgG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ff7e1d" />
        </linearGradient>
      </defs>
      {/* Back bubble */}
      <path d="M18 13C18 15.7614 15.5376 18 12.5 18C11.3963 18 10.3752 17.697 9.5 17.172L6 18.5L7 15.5C6.37256 14.8119 6 13.9452 6 13C6 10.2386 8.46243 8 11.5 8C14.5376 8 17 10.2386 17 13" fill="url(#msgG2)" className="opacity-75" />
      {/* Front bubble */}
      <path d="M18.5 10.5C18.5 13.5376 15.8137 16 12.5 16C11.3061 16 10.2012 15.6321 9.25 14.9926L5.5 16.5L6.5 12.9559C5.87256 12.1218 5.5 11.0722 5.5 10.5C5.5 7.46243 8.18629 5 11.5 5C14.8137 5 17.5 7.46243 17.5 10.5Z" fill="url(#msgG1)" />
      {/* Typing dots */}
      <circle cx="9.5" cy="10.5" r="1" fill="white" />
      <circle cx="12.5" cy="10.5" r="1" fill="white" />
      <circle cx="15.5" cy="10.5" r="1" fill="white" />
    </svg>
  );
};

export const SoporteIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sopG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="sopG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Shoulders / Suit */}
      <path d="M4 20C4 16.8 7 14.5 12 14.5C17 14.5 20 16.8 20 20V21.5H4V20Z" fill="url(#sopG1)" />
      {/* Collar & Tie */}
      <path d="M10 14.5L12 17L14 14.5H10Z" fill="white" />
      <path d="M11.5 17H12.5L13 21H11L11.5 17Z" fill="url(#sopG2)" />
      {/* Head */}
      <path d="M12 5.5C9.8 5.5 8 7.3 8 9.5C8 11.7 9.8 13.5 12 13.5C14.2 13.5 16 11.7 16 9.5C16 7.3 14.2 5.5 12 5.5Z" fill="url(#sopG1)" />
      {/* Headset headband */}
      <path d="M6.5 10C6.5 6.8 9 4.2 12 4.2C15 4.2 17.5 6.8 17.5 10" stroke="url(#sopG2)" strokeWidth="1.8" strokeLinecap="round" />
      {/* Ear muffs */}
      <rect x="5.2" y="8" width="1.8" height="4.5" rx="0.8" fill="url(#sopG2)" />
      <rect x="17" y="8" width="1.8" height="4.5" rx="0.8" fill="url(#sopG2)" />
      {/* Mic boom and tip */}
      <path d="M6.5 11.5C6.5 14.5 9 15 10 15" stroke="url(#sopG2)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="10" cy="15" r="1.2" fill="url(#sopG2)" />
    </svg>
  );
};

export const ConfiguracionIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="configG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="configG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Cogwheel body (Google gear shape) */}
      <path 
        d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81C14.36,2.58,14.17,2,13.92,2h-3.84 c-0.24,0-0.43,0.58-0.47,0.81L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58C4.84,11.36,4.8,11.68,4.8,12c0,0.32,0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 C9.64,21.42,9.83,22,10.08,22h3.84c0.24,0,0.43-0.58,0.47-0.81l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.11-0.2,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.99,0-3.6-1.61-3.6-3.6 c0-1.99,1.61-3.6,3.6-3.6s3.6,1.61,3.6,3.6C15.6,13.99,13.99,15.6,12,15.6z" 
        fill="url(#configG2)" 
      />
      <circle cx="12" cy="12" r="2.5" fill="url(#configG1)" />
    </svg>
  );
};

export const HomeIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="homeG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="homeG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00355f" />
          <stop offset="100%" stopColor="#0f4c81" />
        </linearGradient>
      </defs>
      {/* Roof */}
      <path d="M12 3L3 10H6V21H18V10H21L12 3Z" fill="url(#homeG2)" />
      {/* Door */}
      <path d="M10 14H14V21H10V14Z" fill="url(#homeG1)" />
    </svg>
  );
};

export const PublicarIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pubG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={active ? "#10b981" : "#cbd5e1"} />
          <stop offset="100%" stopColor={active ? "#059669" : "#94a3b8"} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="url(#pubG1)" />
      <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const CrecimientoIcon = ({ className = 'w-6 h-6', active = true }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crecG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="crecG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Bars chart */}
      <rect x="3" y="14" width="3" height="7" rx="1" fill="#94a3b8" className="opacity-50" />
      <rect x="8" y="10" width="3" height="11" rx="1" fill="url(#crecG2)" />
      <rect x="13" y="6" width="3" height="15" rx="1" fill="url(#crecG2)" />
      <rect x="18" y="2" width="3" height="19" rx="1" fill="url(#crecG1)" />
      {/* Arrow line */}
      <path d="M4 17L9 12L14 15L20 8" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8H20V12" stroke="#fc8127" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DolarIcon = ({ className = 'w-6 h-6', active = true }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dolG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#dolG1)" />
      {/* Dollar symbol inside */}
      <path d="M12 6V18M14.5 9H10.75C9.7835 9 9 9.7835 9 10.75C9 11.7165 9.7835 12.5 10.75 12.5H13.25C14.2165 12.5 15 13.2835 15 14.25C15 15.2165 14.2165 16 13.25 16H9.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const HerramientasIcon = ({ className = 'w-6 h-6', active = false }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="toolG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fc8127" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="toolG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00355f" />
          <stop offset="100%" stopColor="#0f4c81" />
        </linearGradient>
      </defs>
      <path d="M14.7 15.3L20.6 9.4C21.1 8.9 21.1 8.1 20.6 7.6L18.4 5.4C17.9 4.9 17.1 4.9 16.6 5.4L10.7 11.3L14.7 15.3Z" fill="url(#toolG2)" />
      <path d="M8.5 13.5C7.2 12.2 5.5 11.5 3.5 11.5L5.5 13.5L3.5 15.5L7.5 19.5L9.5 17.5L11.5 19.5C11.5 17.5 10.8 15.8 9.5 14.5L8.5 13.5Z" fill="url(#toolG1)" />
      <circle cx="12" cy="12" r="1.5" fill="white" />
    </svg>
  );
};
