import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        // Direct fetch to Yahoo Finance public API (unofficial but often works)
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API responded with ${response.status}`);
        }

        const data = await response.json();

        const cleanResults = data.quotes
            .filter((quote: any) => quote.isYahooFinance)
            .map((quote: any) => ({
                symbol: quote.symbol,
                name: quote.longname || quote.shortname || quote.symbol,
                exchange: quote.exchange,
                type: quote.quoteType
            }));

        return NextResponse.json({ results: cleanResults });
    } catch (error: any) {
        console.error('Error searching stocks:', error);
        return NextResponse.json({ error: 'Failed to search stocks', details: error.message }, { status: 500 });
    }
}
