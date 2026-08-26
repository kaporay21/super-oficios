import React from 'react';

interface LogoProps {
  /** 'light' = Oficios azul + Ya naranja (sobre fondos claros)
   *  'dark'  = Oficios blanco + Ya naranja (sobre fondos oscuros) */
  theme?: 'light' | 'dark';
  /** Tamaño del logo: 'sm' | 'md' | 'lg' | 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Disposición del logo: 'horizontal' (mascota a la izquierda) o 'vertical' (mascota arriba, texto abajo) */
  layout?: 'horizontal' | 'vertical';
  /** Clases extra para el contenedor */
  className?: string;
}

const sizes = {
  sm: { img: 'w-7 h-7',   text: 'text-sm' },
  md: { img: 'w-10 h-10', text: 'text-xl'  },
  lg: { img: 'w-14 h-14', text: 'text-2xl' },
  xl: { img: 'w-20 h-20', text: 'text-3xl' },
};

export default function Logo({
  theme = 'light',
  size = 'md',
  layout = 'horizontal',
  className = ''
}: LogoProps) {
  const { img, text } = sizes[size];
  const oficiosColor = theme === 'dark' ? 'text-white' : 'text-[#00355f]';

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center gap-1 ${className}`}>
        <img
          src="/mascot.png"
          alt="OficiosYa"
          className={`${img} object-contain hover:scale-105 transition-transform`}
        />
        <span className={`font-extrabold ${text} ${oficiosColor} leading-none tracking-tight`}>
          Oficios<span className="text-[#fc8127]">Ya</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/mascot.png"
        alt="OficiosYa"
        className={`${img} object-contain hover:scale-105 transition-transform`}
      />
      <span className={`font-extrabold ${text} ${oficiosColor} leading-none tracking-tight`}>
        Oficios<span className="text-[#fc8127]">Ya</span>
      </span>
    </div>
  );
}

