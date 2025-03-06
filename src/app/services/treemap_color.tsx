import axios, { AxiosError } from 'axios';

// Sử dụng API route của Next.js thay vì gọi trực tiếp đến backend
const API_BASE_URL = '/api/v1';

interface TreemapColorResponse {
  symbol: string;
  difference: number;
  percentage_change: number;
  status: string;
}

export const getTreemapColor = async (symbol: string): Promise<TreemapColorResponse> => {
  try {
    const response = await axios.get<TreemapColorResponse>(`${API_BASE_URL}/treemap-color/stock-change/${symbol}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Error fetching treemap color for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch treemap color: ${error.message}`);
    }
    throw error;
  }
};

