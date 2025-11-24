'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Settings, Wallet, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/Button';

const navItems = [
    { name: 'Özet', href: '/', icon: LayoutDashboard },
    { name: 'Portföy', href: '/portfolio', icon: Wallet },
    { name: 'Analiz', href: '/analysis', icon: PieChart },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function Navbar() {
    const pathname = usePathname();
    const { currency, toggleCurrency } = useCurrency();

    return (
        <nav style={{
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px' }}></div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>InvestTrack</span>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 500 : 400,
                                    transition: 'color 0.2s'
                                }}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleCurrency}
                        style={{ minWidth: '80px' }}
                    >
                        <RefreshCw size={14} />
                        {currency}
                    </Button>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)' }}></div>
                </div>
            </div>
        </nav>
    );
}
