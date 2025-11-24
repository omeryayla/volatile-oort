import { supabase } from './supabase';

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

export interface Transaction {
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
    date: string;
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

// Fetch all transactions from Supabase
export async function getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return data || [];
}

// Calculate holdings from transactions
export async function getHoldings(): Promise<Holding[]> {
    const transactions = await getTransactions();
    const holdingsMap = new Map<string, { quantity: number; totalCost: number }>();

    transactions.forEach(tx => {
        const current = holdingsMap.get(tx.symbol) || { quantity: 0, totalCost: 0 };

        if (tx.type === 'BUY') {
            current.quantity += Number(tx.quantity);
            current.totalCost += Number(tx.quantity) * Number(tx.price);
        } else {
            // FIFO or Weighted Average logic could be complex, 
            // for simplicity here we reduce quantity and proportional cost
            const avgPrice = current.quantity > 0 ? current.totalCost / current.quantity : 0;
            current.quantity -= Number(tx.quantity);
            current.totalCost -= Number(tx.quantity) * avgPrice;
        }

        holdingsMap.set(tx.symbol, current);
    });

    const holdings: Holding[] = [];
    holdingsMap.forEach((value, symbol) => {
        if (value.quantity > 0) {
            holdings.push({
                id: symbol, // Use symbol as ID for aggregation
                symbol: symbol,
                quantity: value.quantity,
                avgPrice: value.totalCost / value.quantity
            });
        }
    });

    return holdings;
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const { error } = await supabase
        .from('transactions')
        .insert([{
            ...transaction,
            date: new Date().toISOString()
        }]);

    if (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
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
    const holdings = await getHoldings();
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
