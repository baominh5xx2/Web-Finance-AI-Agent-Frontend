import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interface for price-date pair from API
export interface PriceDatePair {
  price: number;
  date: string;
}

// Interface for API response
export interface MarketIndicesResponse {
  symbol: string;
  time: string;
  data: PriceDatePair[];
}

// Function to get adjusted market indices data
export const getMarketIndicesAdjustedData = async (
  symbol: string, 
  period: string
): Promise<MarketIndicesResponse> => {
  const url = `${API_BASE_URL}/api/v1/market-adjust-indices/adjust-day/${symbol}/${period}`;
  console.log(`Calling API: ${url}`);
  
  try {
    const response = await axios.get<MarketIndicesResponse>(url);
    console.log("API Response:", response.status, response.statusText);
    
    // Log data summary (not the entire data to avoid console flooding)
    const dataLength = response.data?.data?.length || 0;
    console.log(`Received ${dataLength} data points for ${symbol}, period ${period}`);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
    } else {
      console.error("Unknown error fetching market indices data:", error);
    }
    
    // Return empty data structure on error
    return {
      symbol,
      time: period,
      data: []
    };
  }
};


