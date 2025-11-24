import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API responded with ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart.result[0];

        if (!result) {
            return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
        }

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return NextResponse.json({
            symbol: meta.symbol,
            name: meta.longName || meta.shortName || meta.symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            currency: meta.currency
        });
    } catch (error: any) {
        console.error('Error fetching quote:', error);
        return NextResponse.json({ error: 'Failed to fetch quote', details: error.message }, { status: 500 });
    }
}
