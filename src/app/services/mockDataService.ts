interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockInfo {
  name: string;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

interface StockResponse {
  candleData: CandleData[];
  stockInfo: StockInfo;
}

// Function to get a random number between min and max
const getRandomNumber = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Function to get a random date within the last 100 days
const getRandomDate = (index: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - (100 - index));
  return date.toISOString().split('T')[0];
};

// Generate mock candle data
export const generateMockCandleData = (symbol: string, days: number = 100): StockResponse => {
  const candleData: CandleData[] = [];
  
  // Base price that will be used to generate series
  let basePrice = getRandomNumber(20, 200);
  const volatility = getRandomNumber(0.01, 0.05);
  
  for (let i = 0; i < days; i++) {
    // Random movement for this day
    const change = basePrice * volatility * (Math.random() - 0.5) * 2;
    
    // Calculate OHLC values
    const open = basePrice;
    const close = parseFloat((basePrice + change).toFixed(2));
    const high = parseFloat((Math.max(open, close) + Math.abs(change) * getRandomNumber(0.1, 0.5)).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.abs(change) * getRandomNumber(0.1, 0.5)).toFixed(2));
    
    // Create candle data
    candleData.push({
      time: getRandomDate(i),
      open,
      high,
      low,
      close
    });
    
    // Set base price for next iteration
    basePrice = close;
  }

  // Sort by date
  candleData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  // Create stock info
  const lastCandle = candleData[candleData.length - 1];
  const prevCandle = candleData[candleData.length - 2] || { close: lastCandle.open };
  const change = parseFloat((lastCandle.close - prevCandle.close).toFixed(2));
  const changePercent = parseFloat(((change / prevCandle.close) * 100).toFixed(2));
  
  const stockInfo: StockInfo = {
    name: getCompanyName(symbol),
    symbol: symbol,
    currentPrice: lastCandle.close,
    change,
    changePercent,
    marketCap: parseFloat((lastCandle.close * getRandomNumber(1000000, 10000000000)).toFixed(2))
  };
  
  return {
    candleData,
    stockInfo
  };
};

// Mock company names
const getCompanyName = (symbol: string): string => {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOG': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'FB': 'Meta Platforms, Inc.',
    'TSLA': 'Tesla, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'PYPL': 'PayPal Holdings, Inc.',
    'NFLX': 'Netflix, Inc.',
    'INTC': 'Intel Corporation',
    'CSCO': 'Cisco Systems, Inc.',
    'ADBE': 'Adobe Inc.',
    'PEP': 'PepsiCo, Inc.',
    'CMCSA': 'Comcast Corporation',
    'COST': 'Costco Wholesale Corporation',
    'TMUS': 'T-Mobile US, Inc.',
    'AVGO': 'Broadcom Inc.',
    'TXN': 'Texas Instruments Incorporated',
    'QCOM': 'QUALCOMM Incorporated',
    'HOSE': 'Ngân hàng Thương mại cổ phần Phát triển Thành phố Hồ Chí Minh',
    'HDB': 'Ngân hàng Thương mại cổ phần Phát triển Thành phố Hồ Chí Minh'
  };
  
  return companies[symbol] || `${symbol} Corporation`;
};

// Generate mock data for Vietnamese stocks
export const generateVietnameseStockData = (symbol: string): StockResponse => {
  const mockData = generateMockCandleData(symbol);
  
  // Adjust price range to be more realistic for Vietnamese stocks
  mockData.candleData = mockData.candleData.map(candle => ({
    ...candle,
    open: parseFloat((candle.open / 10).toFixed(3)),
    high: parseFloat((candle.high / 10).toFixed(3)),
    low: parseFloat((candle.low / 10).toFixed(3)),
    close: parseFloat((candle.close / 10).toFixed(3))
  }));
  
  // Update stock info with adjusted price
  const lastCandle = mockData.candleData[mockData.candleData.length - 1];
  mockData.stockInfo.currentPrice = lastCandle.close;
  mockData.stockInfo.change = parseFloat((mockData.stockInfo.change / 10).toFixed(3));
  mockData.stockInfo.marketCap = parseFloat((mockData.stockInfo.marketCap / 10).toFixed(2));
  
  return mockData;
}; 