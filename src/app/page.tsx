'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/layout/Navbar';
import { getPortfolioSummary, PortfolioSummary } from '@/lib/portfolio';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Loader2, TurkishLira } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { StockLogo } from '@/components/ui/StockLogo';

export default function Home() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, convert, format } = useCurrency();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getPortfolioSummary();
      setSummary(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
        <Navbar />
        <div className="flex-center" style={{ height: 'calc(100vh - 4rem)' }}>
          <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-primary)' }} />
        </div>
      </main>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
        <Navbar />
        <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Card style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>InvestTrack'e Hoşgeldiniz</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Portföyünüz şu anda boş. Yatırımlarınızı takip etmek için ilk işleminizi ekleyerek başlayın.
            </p>
            <Link href="/portfolio">
              <Button size="lg">Portföye Git</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  // Convert summary values based on currency
  let totalValue = 0;
  let totalCost = 0;

  const convertedHoldings = summary.holdings.map(h => {
    const isTry = h.symbol.endsWith('.IS');
    const stockCurrency = isTry ? 'TRY' : 'USD';

    const convertedCurrentValue = convert(h.currentValue, stockCurrency);
    const convertedCostBasis = convert(h.quantity * h.avgPrice, stockCurrency);

    totalValue += convertedCurrentValue;
    totalCost += convertedCostBasis;

    return {
      ...h,
      convertedCurrentValue,
      convertedGainLoss: convertedCurrentValue - convertedCostBasis
    };
  });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const chartData = convertedHoldings.map(h => ({
    name: h.symbol,
    value: h.convertedCurrentValue
  }));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <Navbar />

      <div className="container" style={{ marginTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Özet</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tekrar hoşgeldiniz, işte portföyünüzün {currency} cinsinden özeti.</p>
        </header>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Toplam Bakiye</p>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  {format(totalValue)}
                </h2>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                {currency === 'TRY' ? (
                  <TurkishLira size={24} />
                ) : (
                  <DollarSign size={24} />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                color: totalGainLoss >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)',
                fontWeight: 500
              }}>
                {totalGainLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(totalGainLossPercent).toFixed(2)}%
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tüm zamanlar</span>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Toplam Kâr/Zarar</p>
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  marginTop: '0.25rem',
                  color: totalGainLoss >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'
                }}>
                  {totalGainLoss >= 0 ? '+' : ''}{format(totalGainLoss)}
                </h2>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Toplam kazanç</p>
          </Card>
        </div>

        {/* Charts & Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Varlık Dağılımı</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    formatter={(value: number) => format(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              {chartData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>En İyi Performans</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {convertedHoldings
                .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                .slice(0, 4)
                .map((holding) => (
                  <div key={holding.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <StockLogo symbol={holding.symbol} />
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{holding.symbol}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{holding.quantity} adet</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>{format(holding.convertedCurrentValue)}</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: holding.gainLoss >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)'
                      }}>
                        {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
