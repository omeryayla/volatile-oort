'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Modal } from '@/components/ui/Modal';
import { getPortfolioSummary, saveHoldings, getStoredHoldings, fetchQuote, PortfolioSummary, Holding } from '@/lib/portfolio';
import { Plus, Search, Filter, MoreHorizontal, Loader2, X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { StockLogo } from '@/components/ui/StockLogo';

interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export default function PortfolioPage() {
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currency, convert, format } = useCurrency();

    // Form State
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [adding, setAdding] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getPortfolioSummary();
        setSummary(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Search Stocks Effect
    useEffect(() => {
        if (symbol.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/search?query=${encodeURIComponent(symbol)}`);
                const data = await res.json();
                setSuggestions(data.results || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setSearching(false);
            }
        }, 300); // Debounce 300ms

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [symbol]);

    const selectSymbol = async (s: SearchResult) => {
        setSymbol(s.symbol);
        setShowSuggestions(false);

        // Fetch current price
        try {
            const quote = await fetchQuote(s.symbol);
            if (quote) {
                setAvgPrice(quote.price.toString());
            }
        } catch (error) {
            console.error('Failed to fetch price:', error);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            // Validate symbol
            const quote = await fetchQuote(symbol);
            if (!quote) {
                alert('Geçersiz sembol veya veri alınamadı');
                setAdding(false);
                return;
            }

            const newHolding: Holding = {
                id: Date.now().toString(),
                symbol: quote.symbol,
                quantity: Number(quantity),
                avgPrice: Number(avgPrice)
            };

            const currentHoldings = getStoredHoldings();
            saveHoldings([...currentHoldings, newHolding]);

            await loadData();
            setIsModalOpen(false);
            setSymbol('');
            setQuantity('');
            setAvgPrice('');
        } catch (error) {
            console.error(error);
            alert('İşlem eklenemedi');
        } finally {
            setAdding(false);
        }
    };

    const filteredHoldings = summary?.holdings.filter(h =>
        h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalValue = (Number(quantity) || 0) * (Number(avgPrice) || 0);

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Portföy</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Varlıklarınızı ve işlemlerinizi yönetin.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        İşlem Ekle
                    </Button>
                </header>

                <Card className="p-0" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            position: 'relative',
                            flex: 1,
                            maxWidth: '300px'
                        }}>
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Varlık ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div className="flex-center" style={{ padding: '3rem' }}>
                                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-primary)' }} />
                            </div>
                        ) : filteredHoldings.length === 0 ? (
                            <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                                <p>Varlık bulunamadı.</p>
                                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>İlk hissenizi ekleyin</Button>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                        <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Varlık</th>
                                        <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Fiyat</th>
                                        <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Bakiye</th>
                                        <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Ort. Maliyet</th>
                                        <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Getiri</th>
                                        <th style={{ padding: '1rem', width: '48px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHoldings.map((holding) => {
                                        const isTry = holding.symbol.endsWith('.IS');
                                        const stockCurrency = isTry ? 'TRY' : 'USD';

                                        const convertedPrice = convert(holding.currentPrice, stockCurrency);
                                        const convertedValue = convert(holding.currentValue, stockCurrency);
                                        const convertedAvgPrice = convert(holding.avgPrice, stockCurrency);
                                        const convertedGainLoss = convert(holding.gainLoss, stockCurrency);

                                        return (
                                            <tr key={holding.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover:bg-[var(--bg-secondary)]">
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <StockLogo symbol={holding.symbol} />
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{holding.symbol}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{holding.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 500 }}>{format(convertedPrice)}</div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 500 }}>{format(convertedValue)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{holding.quantity} adet</div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ color: 'var(--text-secondary)' }}>{format(convertedAvgPrice)}</div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{
                                                        fontWeight: 500,
                                                        color: holding.gainLoss >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'
                                                    }}>
                                                        {holding.gainLoss >= 0 ? '+' : ''}{format(convertedGainLoss)}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: holding.gainLoss >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'
                                                    }}>
                                                        {holding.gainLossPercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <button style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                        borderRadius: '4px'
                                                    }} className="hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="İşlem Ekle">
                <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sembol</label>
                        <input
                            type="text"
                            placeholder="Aramak için yazın (örn. TUP)"
                            value={symbol}
                            onChange={(e) => {
                                setSymbol(e.target.value.toUpperCase());
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            required
                            autoComplete="off"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                marginTop: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 50,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                                {suggestions.map((s) => (
                                    <div
                                        key={s.symbol}
                                        onClick={() => selectSymbol(s)}
                                        style={{
                                            padding: '0.75rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border-color)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        className="hover:bg-[var(--bg-secondary)]"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <StockLogo symbol={s.symbol} size={32} />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{s.symbol}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.exchange}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Adet</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                min="0.0001"
                                step="any"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ort. Maliyet</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={avgPrice}
                                onChange={(e) => setAvgPrice(e.target.value)}
                                required
                                min="0"
                                step="any"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toplam Değer</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.125rem' }}>
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit" disabled={adding}>
                            {adding ? <Loader2 className="animate-spin" size={18} /> : 'Ekle'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}
