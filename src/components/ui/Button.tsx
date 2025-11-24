import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]",
        secondary: "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]",
        danger: "bg-[var(--accent-danger)] text-white hover:opacity-90",
        ghost: "bg-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    };

    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg"
    };

    // Since we are using vanilla CSS variables but might not have a full utility class system like Tailwind,
    // we can use style objects for dynamic values if needed, or rely on the globals.css classes we might add.
    // For now, I'll assume we can use standard style attributes for the specific colors if the classes aren't enough.
    // However, to keep it clean, I will rely on the `style` prop for the specific colors mapped from the variant.

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary': return { backgroundColor: 'var(--accent-primary)', color: '#fff' };
            case 'secondary': return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' };
            case 'danger': return { backgroundColor: 'var(--accent-danger)', color: '#fff' };
            case 'ghost': return { backgroundColor: 'transparent', color: 'var(--text-secondary)' };
        }
    };

    return (
        <button
            className={clsx(baseStyles, className)}
            style={{
                ...getVariantStyle(),
                padding: size === 'sm' ? '0.5rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem',
                fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                border: variant === 'secondary' ? '1px solid var(--border-color)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
            {...props}
        >
            {children}
        </button>
    );
}
