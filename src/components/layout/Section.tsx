import React from 'react';
import { cn } from '../../utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'secondary' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { className, variant = 'default', padding = 'lg', children, ...props },
    ref
  ) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      dark: 'bg-gray-900 dark:bg-black',
    };

    const paddings = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
    };

    return (
      <section
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';
