import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function Card({ children, className, hoverEffect = false, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'glass-panel p-6 transition-all duration-300',
                hoverEffect && 'hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-primary)]',
                className
            )}
            style={{
                padding: '1.5rem',
                // Inline styles for specific transitions if not covered by utility classes yet
                transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s',
            }}
            {...props}
        >
            {children}
        </div>
    );
}
