export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface Holding {
    id: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
}

export const MOCK_STOCKS: Record<string, Stock> = {
    AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
    MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 324.56, change: -1.20, changePercent: -0.37 },
    GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 134.12, change: 0.85, changePercent: 0.64 },
    TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: 5.43, changePercent: 2.26 },
    AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 128.90, change: 1.10, changePercent: 0.86 },
    NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 460.18, change: 8.90, changePercent: 1.97 },
};

export const MOCK_HOLDINGS: Holding[] = [
    { id: '1', symbol: 'AAPL', quantity: 10, avgPrice: 150.00 },
    { id: '2', symbol: 'MSFT', quantity: 5, avgPrice: 300.00 },
    { id: '3', symbol: 'NVDA', quantity: 2, avgPrice: 400.00 },
    { id: '4', symbol: 'TSLA', quantity: 8, avgPrice: 220.00 },
];

export function getPortfolioSummary() {
    let totalValue = 0;
    let totalCost = 0;

    const holdings = MOCK_HOLDINGS.map(holding => {
        const stock = MOCK_STOCKS[holding.symbol];
        const currentValue = holding.quantity * stock.price;
        const costBasis = holding.quantity * holding.avgPrice;

        totalValue += currentValue;
        totalCost += costBasis;

        return {
            ...holding,
            currentPrice: stock.price,
            currentValue,
            gainLoss: currentValue - costBasis,
            gainLossPercent: ((currentValue - costBasis) / costBasis) * 100
        };
    });

    return {
        totalValue,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: ((totalValue - totalCost) / totalCost) * 100,
        holdings
    };
}
