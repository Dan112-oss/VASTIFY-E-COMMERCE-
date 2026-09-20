'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MovingLinesBackgroundProps {
  speed?: string;
  opacity?: number;
  direction?: 'left' | 'right';
  blur?: string;
  className?: string;
  lineClassName?: string;
  children?: React.ReactNode;
}

// Gold-tinted diagonal lines that follow the theme's --primary color
const LINES =
  'linear-gradient(45deg, transparent 45%, color-mix(in oklab, var(--primary) 14%, transparent) 45%, color-mix(in oklab, var(--primary) 14%, transparent) 55%, transparent 0)';

export function MovingLinesBackground({
  speed = '20s',
  opacity = 0.8,
  direction = 'right',
  blur = '0px',
  className,
  lineClassName,
  children,
}: MovingLinesBackgroundProps) {
  const move = direction === 'right' ? '200%' : '-200%';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <style>{`@keyframes vastify-lines-move { from { background-position: 0 0; } to { background-position: var(--line-move) var(--line-move); } }`}</style>

      <div
        aria-hidden='true'
        style={
          {
            '--line-move': move,
            filter: `blur(${blur})`,
            opacity,
            backgroundSize: '0.6em 0.6em',
            backgroundImage: LINES,
            animation: `vastify-lines-move ${speed} linear infinite`,
          } as React.CSSProperties
        }
        className={cn('pointer-events-none absolute inset-0 z-0', lineClassName)}
      />

      {children && <div className='relative z-10'>{children}</div>}
    </div>
  );
}
