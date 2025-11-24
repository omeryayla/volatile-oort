export interface StockQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
}

export interface Holding {
    id: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
}

export interface PortfolioSummary {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    holdings: (Holding & {
        currentPrice: number;
        currentValue: number;
        gainLoss: number;
        gainLossPercent: number;
        name: string;
    })[];
}

const STORAGE_KEY = 'investtrack_holdings';

export function getStoredHoldings(): Holding[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveHoldings(holdings: Holding[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
    try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
    const holdings = getStoredHoldings();
    let totalValue = 0;
    let totalCost = 0;

    const enrichedHoldings = await Promise.all(holdings.map(async (holding) => {
        const quote = await fetchQuote(holding.symbol);
        const currentPrice = quote?.price || holding.avgPrice; // Fallback to avgPrice if fetch fails
        const name = quote?.name || holding.symbol;

        const currentValue = holding.quantity * currentPrice;
        const costBasis = holding.quantity * holding.avgPrice;

        totalValue += currentValue;
        totalCost += costBasis;

        return {
            ...holding,
            name,
            currentPrice,
            currentValue,
            gainLoss: currentValue - costBasis,
            gainLossPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0
        };
    }));

    return {
        totalValue,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        holdings: enrichedHoldings
    };
}
