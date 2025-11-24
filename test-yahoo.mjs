import yahooFinance from 'yahoo-finance2';

async function test() {
    try {
        console.log('Testing search for "TUP"...');
        const searchResults = await yahooFinance.search('TUP');
        console.log('Search Results:', JSON.stringify(searchResults, null, 2));

        console.log('\nTesting quote for "TUPRS.IS"...');
        const quote = await yahooFinance.quote('TUPRS.IS');
        console.log('Quote:', JSON.stringify(quote, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
