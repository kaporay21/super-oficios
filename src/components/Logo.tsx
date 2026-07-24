import React from 'react';

interface LogoProps {
  /** 'light' = Oficios azul + Ya naranja (sobre fondos claros)
   *  'dark'  = Oficios blanco + Ya naranja (sobre fondos oscuros) */
  theme?: 'light' | 'dark';
  /** Tamaño del logo: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Clases extra para el contenedor */
  className?: string;
}

const sizes = {
  sm: { img: 'w-8 h-8',  text: 'text-lg'  },
  md: { img: 'w-10 h-10', text: 'text-xl'  },
  lg: { img: 'w-14 h-14', text: 'text-2xl' },
};

export default function Logo({ theme = 'light', size = 'md', className = '' }: LogoProps) {
  const { img, text } = sizes[size];
  const oficiosColor = theme === 'dark' ? 'text-white' : 'text-[#00355f]';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/mascot.png"
        alt="OficiosYa"
        className={`${img} object-contain`}
      />
      <span className={`font-extrabold ${text} ${oficiosColor} leading-none tracking-tight`}>
        Oficios<span className="text-[#fc8127]">Ya</span>
      </span>
    </div>
  );
}
