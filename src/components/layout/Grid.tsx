import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { className, cols = 1, gap = 'md', responsive = true, children, ...props },
    ref
  ) => {
    const gaps = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const getColsClass = () => {
      if (!responsive) return `grid-cols-${cols}`;

      // Responsive grid (mobile first)
      switch (cols) {
        case 1:
          return 'grid-cols-1';
        case 2:
          return 'grid-cols-1 sm:grid-cols-2';
        case 3:
          return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        case 4:
          return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        case 6:
          return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
        case 12:
          return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12';
        default:
          return 'grid-cols-1';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('grid', getColsClass(), gaps[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
