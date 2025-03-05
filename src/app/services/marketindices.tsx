import axios from 'axios';

// Thêm interfaces cho chart data
export interface ChartDataPoint {
  time: string;
  open: number;
}

export interface ChartDataResponse {
  success: boolean;
  message: string;
  data: ChartDataPoint[];
}

interface MarketIndex {
  id: string;
  name: string;
  current_price: number;
  price_change: number;
  price_change_percent: number;
  last_updated: string;
}

interface MarketIndexResponse {
  success: boolean;
  data: MarketIndex;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetches data for a specific market index by its code
 * @param indexCode - The code of the index (e.g., "VNINDEX", "HNX", "UPCOM")
 * @returns The market index data or null if the request fails
 */
export const fetchMarketIndex = async (indexCode: string): Promise<MarketIndex | null> => {
  try {
    const response = await axios.get<MarketIndexResponse>(
      `${API_BASE_URL}/api/v1/market/indices/${indexCode}`
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      console.error(`Error fetching ${indexCode} data:`, response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch ${indexCode} data:`, error);
    return null;
  }
};

/**
 * Convenience function to fetch VNINDEX data specifically
 * @returns The VNINDEX market data or null if the request fails
 */
export const fetchVNINDEX = async (): Promise<MarketIndex | null> => {
  return fetchMarketIndex('VNINDEX');
};

/**
 * Fetches data for multiple market indices
 * @param indexCodes - Array of index codes to fetch
 * @returns Object mapping index codes to their data
 */
export const fetchMultipleIndices = async (
  indexCodes: string[] = ['VNINDEX', 'HNX', 'UPCOM']
): Promise<Record<string, MarketIndex | null>> => {
  const results: Record<string, MarketIndex | null> = {};
  
  await Promise.all(
    indexCodes.map(async (code) => {
      results[code] = await fetchMarketIndex(code);
    })
  );
  
  return results;
};

// Helper function to generate mock chart data
const generateMockChartData = (baseValue: number): ChartDataPoint[] => {
  const points: ChartDataPoint[] = [];
  const intervals = 30; // 30 data points
  
  for (let i = 0; i < intervals; i++) {
    // Add some random variation to create realistic-looking data
    const randomChange = (Math.random() - 0.5) * 5;
    const open = baseValue + randomChange;
    
    points.push({
      time: `${Math.floor(i / 60)}:${String(i % 60).padStart(2, '0')}`,
      open: Number(open.toFixed(2))
    });
  }
  
  return points;
};

// Define base values for different market indices
const baseValues: Record<string, number> = {
  'VNINDEX': 1200,
  'HNX': 240,
  'UPCOM': 90,
};

/**
 * Mock chart data fetching function
 */
export const fetchMarketIndexChart = async (indexCode: string): Promise<ChartDataPoint[] | null> => {
  // This always returns mock data, not real API data
  const baseValue = baseValues[indexCode] || 1000;
  const mockData = generateMockChartData(baseValue);
  return mockData;
}