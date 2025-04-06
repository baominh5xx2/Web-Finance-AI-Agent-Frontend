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

// Định nghĩa cho Market Index
export interface MarketIndex {
  time: string;
  open: number;
  id?: string;
  name?: string;
  current_price?: number;
  price_change?: number;
  price_change_percent?: number;
  last_updated?: string;
}

export interface MarketIndexResponse {
  data: any;
  is_na?: boolean | Record<string, boolean>;
  error?: string;
}

export type MarketIndexData = MarketIndex[];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetches data for a specific market index by its code
 * @param indexCode - The code of the index (e.g., "VNINDEX", "HNXINDEX", "UPCOMINDEX")
 * @param top - Number of data points to fetch, default is 90
 * @returns The market index data or null if the request fails
 */
export const fetchMarketIndex = async (indexCode: string, top: number = 90): Promise<MarketIndexData | null> => {
  try {
    const response = await axios.get<MarketIndexResponse>(
      `${API_BASE_URL}/api/v1/market/indices/${indexCode}?top=${top}`
    );
    
    // Kiểm tra xem có flag is_na không
    if (response.data.is_na === true) {
      console.log(`${indexCode} data is not available (N/A)`);
      return null;
    }
    
    // Kiểm tra dữ liệu có tồn tại không
    if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data as MarketIndexData;
    } else {
      console.error(`Error fetching ${indexCode} data: Empty or invalid data`);
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
export const fetchVNINDEX = async (): Promise<MarketIndexData | null> => {
  return fetchMarketIndex('VNINDEX');
};

/**
 * Fetches data for multiple market indices
 * @param indexCodes - Array of index codes to fetch
 * @returns Object mapping index codes to their data
 */
export const fetchMultipleIndices = async (
  indexCodes: string[] = ['VNINDEX', 'HNXINDEX', 'UPCOMINDEX', 'VN30', 'HNX30'],
  top: number = 90
): Promise<Record<string, MarketIndexData | null>> => {
  try {
    const response = await axios.get<MarketIndexResponse>(
      `${API_BASE_URL}/api/v2/market/indices?top=${top}`
    );
    
    const results: Record<string, MarketIndexData | null> = {};
    
    // Kiểm tra is_na cho từng chỉ số
    if (response.data.data && response.data.is_na) {
      const isNaData = response.data.is_na as Record<string, boolean>;
      
      // Log để debug
      console.log('API Response Data:', response.data.data);
      console.log('API is_na flags:', isNaData);
      
      // Duyệt qua từng mã chỉ số
      for (const code of indexCodes) {
        if (isNaData[code] === true) {
          // Chỉ số này không có dữ liệu (N/A)
          console.log(`${code} is marked as N/A`);
          results[code] = null;
        } else if (response.data.data[code] && Array.isArray(response.data.data[code]) && response.data.data[code].length > 0) {
          // Chỉ số này có dữ liệu
          console.log(`${code} has ${response.data.data[code].length} data points`);
          results[code] = response.data.data[code] as MarketIndexData;
        } else {
          // Không có dữ liệu hoặc dữ liệu không hợp lệ
          console.log(`${code} has no valid data`);
          results[code] = null;
        }
      }
      
      return results;
    }
    
    // Phương pháp cũ nếu không có is_na
    return await Promise.all(
      indexCodes.map(async (code) => {
        results[code] = await fetchMarketIndex(code);
      })
    ).then(() => results);
    
  } catch (error) {
    console.error(`Failed to fetch multiple indices:`, error);
    
    // Trả về null cho tất cả các chỉ số khi có lỗi
    const results: Record<string, MarketIndexData | null> = {};
    for (const code of indexCodes) {
      results[code] = null;
    }
    return results;
  }
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