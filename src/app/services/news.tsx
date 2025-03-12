import axios from 'axios';

// API base URL - should match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const NEWS_API_URL = `${API_BASE_URL}/api/v1/news`;

// Types matching backend schemas
export interface NewsItem {
  title: string;
  publish_date: string;
  symbol?: string;
}

export interface NewsResponse {
  symbol: string;
  news: NewsItem[];
}

export interface TopNewsResponse {
  news: NewsItem[];
}

// News service class
class NewsService {
  /**
   * Fetch news for a specific stock symbol
   * @param symbol Stock ticker symbol
   * @returns NewsResponse containing array of news items
   */
  async getStockNews(symbol: string): Promise<NewsResponse> {
    try {
      console.log(`Making API request to: ${NEWS_API_URL}/${symbol}`);
      const response = await axios.get<NewsResponse>(`${NEWS_API_URL}/${symbol}`);
      console.log('API response for stock news:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching news for symbol ${symbol}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      // Return empty news array with the symbol
      return { symbol, news: [] };
    }
  }

  /**
   * Fetch latest news from top stocks
   * @returns TopNewsResponse containing array of latest news items
   */
  async getTopNews(): Promise<TopNewsResponse> {
    try {
      console.log(`Making API request to: ${NEWS_API_URL}/top/latest`);
      const response = await axios.get<TopNewsResponse>(`${NEWS_API_URL}/top/latest`);
      console.log('API response for top news:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching top news:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Return empty news array
      return { news: [] };
    }
  }
}

// Export a singleton instance of the service
export const newsService = new NewsService();