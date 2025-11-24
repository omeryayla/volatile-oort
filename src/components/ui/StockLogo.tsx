import React, { useState } from 'react';

interface StockLogoProps {
    symbol: string;
    name?: string;
    size?: number;
}

// Map symbols to domains for Clearbit API
const DOMAIN_MAP: Record<string, string> = {
    'TUPRS.IS': 'tupras.com.tr',
    'THYAO.IS': 'turkishairlines.com',
    'GARAN.IS': 'garantibbva.com.tr',
    'AKBNK.IS': 'akbank.com',
    'ASELS.IS': 'aselsan.com.tr',
    'SAHOL.IS': 'sabanci.com',
    'KCHOL.IS': 'koc.com.tr',
    'SISE.IS': 'sisecam.com.tr',
    'BIMAS.IS': 'bim.com.tr',
    'EREGL.IS': 'erdemir.com.tr',
    'FROTO.IS': 'fordotosan.com.tr',
    'ISCTR.IS': 'isbank.com.tr',
    'YKBNK.IS': 'yapikredi.com.tr',
    'VAKBN.IS': 'vakifbank.com.tr',
    'PETKM.IS': 'petkim.com.tr',
    'TCELL.IS': 'turkcell.com.tr',
    'TTKOM.IS': 'turktelekom.com.tr',
    'ARCLK.IS': 'arcelik.com.tr',
    'ENJSA.IS': 'enerjisa.com.tr',
    // US Tech
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'GOOGL': 'google.com',
    'TSLA': 'tesla.com',
    'NVDA': 'nvidia.com',
    'AMZN': 'amazon.com',
    'META': 'meta.com',
    'NFLX': 'netflix.com',
};

export function StockLogo({ symbol, name, size = 40 }: StockLogoProps) {
    const [error, setError] = useState(false);

    const domain = DOMAIN_MAP[symbol] || DOMAIN_MAP[symbol.toUpperCase()];
    const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

    if (logoUrl && !error) {
        return (
            <div style={{
                width: size,
                height: size,
                borderRadius: '8px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '2px',
                flexShrink: 0
            }}>
                <img
                    src={logoUrl}
                    alt={symbol}
                    onError={() => setError(true)}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: size * 0.4,
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            flexShrink: 0
        }}>
            {symbol.substring(0, 2)}
        </div>
    );
}
