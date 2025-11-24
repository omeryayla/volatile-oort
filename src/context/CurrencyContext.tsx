'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'TRY' | 'USD';

interface CurrencyContextType {
    currency: Currency;
    toggleCurrency: () => void;
    exchangeRate: number; // USD to TRY
    convert: (amount: number, fromCurrency: string) => number;
    format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('TRY');
    const [exchangeRate, setExchangeRate] = useState<number>(30); // Default fallback

    useEffect(() => {
        // Fetch USD/TRY rate
        const fetchRate = async () => {
            try {
                const res = await fetch('/api/quote?symbol=USDTRY=X');
                const data = await res.json();
                if (data.price) {
                    setExchangeRate(data.price);
                }
            } catch (error) {
                console.error('Failed to fetch exchange rate:', error);
            }
        };
        fetchRate();
    }, []);

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
    };

    const convert = (amount: number, fromCurrency: string) => {
        // Normalize fromCurrency
        const from = fromCurrency.toUpperCase();

        // If same currency, return as is
        if (from === currency) return amount;

        // If source is USD and target is TRY
        if (from === 'USD' && currency === 'TRY') {
            return amount * exchangeRate;
        }

        // If source is TRY and target is USD
        if (from === 'TRY' && currency === 'USD') {
            return amount / exchangeRate;
        }

        // Fallback (e.g. if source is EUR - not handled yet, assume USD for now or 1:1)
        return amount;
    };

    const format = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, toggleCurrency, exchangeRate, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
