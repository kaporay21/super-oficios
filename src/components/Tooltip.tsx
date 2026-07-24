"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  title?: string;
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ title, text, children, position = 'top', className = '' }: TooltipProps) {
  const [disabled, setDisabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const isTooltipDisabled = localStorage.getItem('oficiosya_disable_tooltips') === 'true';
    setDisabled(isTooltipDisabled);

    const handleStorageChange = () => {
      setDisabled(localStorage.getItem('oficiosya_disable_tooltips') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('oficiosya_tooltips_changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('oficiosya_tooltips_changed', handleStorageChange);
    };
  }, []);

  const calculateCoords = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    
    if (position === 'right') {
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + 12
      };
    } else if (position === 'left') {
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - 12
      };
    } else if (position === 'bottom') {
      return {
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2
      };
    } else {
      // top
      return {
        top: rect.top - 12,
        left: rect.left + rect.width / 2
      };
    }
  };

  const handleMouseEnter = () => {
    const newCoords = calculateCoords();
    if (newCoords) {
      setCoords(newCoords);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords(null);
  };

  if (disabled) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{children}</div>;
  }

  const transformClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  };

  const tailClasses = {
    top: 'bottom-[-7px] left-1/2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#00355f]',
    bottom: 'top-[-7px] left-1/2 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-[#00355f]',
    left: 'right-[-7px] top-1/2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-[#00355f]',
    right: 'left-[-7px] top-1/2 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-[#00355f]',
  };

  const tooltipElement = isHovered && mounted && coords ? (
    <div
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      className={`
        fixed z-[999999] pointer-events-none
        p-4 rounded-2xl border-2 border-[#00355f]
        bg-white text-[#00355f]
        text-[11.5px] font-medium leading-relaxed
        shadow-[6px_6px_0px_rgba(0,53,95,0.2)]
        w-56 md:w-64 whitespace-normal
        animate-in fade-in zoom-in-95 duration-150 ease-out
        ${transformClasses[position]}
      `}
      role="tooltip"
    >
      {/* Title inside speech bubble */}
      {title && (
        <div className="font-extrabold text-sm mb-1 text-[#fc8127] flex items-center gap-1">
          <span>✨</span> {title}
        </div>
      )}
      
      {/* Main description text */}
      <p className="text-[#00355f] font-medium leading-relaxed">
        {text}
      </p>
      
      {/* Speech Bubble Arrow Indicator (Tail) */}
      <span className={`absolute w-3.5 h-3.5 bg-white ${tailClasses[position]}`} />
    </div>
  ) : null;

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
      {mounted && tooltipElement ? createPortal(tooltipElement, document.body) : null}
    </div>
  );
}
