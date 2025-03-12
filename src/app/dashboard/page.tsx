'use client';

import { useState, useEffect } from 'react';
import { showNotFoundPage } from '@/utils/notFoundHelper';
import MarketIndices from '@/components/market-watch/MarketIndices';
import StockTreeMap from '@/components/StockTreeMap/StockTreeMap';
import MarketStatistics from '@/components/market-watch/MarketStatistics';
import SmartTradeRecommendations from '@/components/smart-trade/SmartTradeRecommendations';
import StockNews from '@/components/stock-news/StockNews';
import InvestmentPerformance from '@/components/investment-performance/InvestmentPerformance';
import Chatbot from '@/components/chatbot/chatbot'; // Import the Chatbot component
import './dashboard.css';

// Define interfaces for market data
interface IndexData {
  name: string;
  value: number | null;
  change: number | null;
  changePercent: number | null;
  data: ChartDataPoint[];
}

interface ChartDataPoint {
  time: string | number;
  open: number;
}

// Define interface for StockRecommendation
interface StockRecommendation {
  code: string;
  smartScore: number;
  recommendation: string;
  currentPrice: number;
  purchasePrice: number;
  purchaseDate: string;
  percentChange: number;
}

// Mapping giữa tên chỉ số và mã chỉ số
const INDEX_CODE_MAP: Record<string, string> = {
  'VN-Index': 'VNINDEX',
  'HNX': 'HNXINDEX',   // Changed from 'HNX' to 'HNXINDEX'
  'UPCOM': 'UPCOMINDEX', // Changed from 'UPCOM' to 'UPCOMINDEX'
  'VN30': 'VN30',
  'HNX30': 'HNX30'
};

// Mapping ngược lại từ mã chỉ số sang tên chỉ số
const INDEX_NAME_MAP: Record<string, string> = {
  'VNINDEX': 'VN-Index',
  'HNXINDEX': 'HNX',   // Changed key from 'HNX' to 'HNXINDEX'
  'UPCOMINDEX': 'UPCOM', // Changed key from 'UPCOM' to 'UPCOMINDEX'
  'VN30': 'VN30',
  'HNX30': 'HNX30'
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<string>('VN-Index');
  const [selectedIndexCode, setSelectedIndexCode] = useState<string>('VNINDEX');
  
  // State for market data
  const [marketData, setMarketData] = useState({
    indexData: {
      value: 1310,
      data: Array.from({ length: 100 }, (_, i) => ({
        time: `${Math.floor(i / 60)}:${i % 60}`,
        value: 1300 + Math.random() * 20
      }))
    },
    volumeData: {
      current: 814810599,
      previous: 800000000,
      data: Array.from({ length: 100 }, (_, i) => ({
        time: `${Math.floor(i / 60)}:${i % 60}`,
        value: 700000000 + Math.random() * 200000000
      }))
    },
    statistics: {
      pe: 13.1,
      marketCap: 5475997,
      tradingValue: 18661,
      tradingVolume: 814810599,
      high52w: 1307.8,
      low52w: 1174.8,
      ytdReturn: '3%',
      yearReturn: '4%'
    }
  });

  // Mock recommendations data
  const [stockRecommendations] = useState<StockRecommendation[]>([
    { 
      code: 'HPG', 
      smartScore: 85,
      recommendation: 'MUA', 
      currentPrice: 29800,
      purchasePrice: 27500,
      purchaseDate: '10/01/2024',
      percentChange: 8.4
    },
    { 
      code: 'VHM', 
      smartScore: 72,
      recommendation: 'NẮM GIỮ', 
      currentPrice: 41200,
      purchasePrice: 42000,
      purchaseDate: '15/12/2023',
      percentChange: -1.9
    },
    { 
      code: 'ACB', 
      smartScore: 78,
      recommendation: 'MUA', 
      currentPrice: 25100,
      purchasePrice: 23000,
      purchaseDate: '05/02/2024',
      percentChange: 9.1
    }
  ]);

  // Handle index selection from MarketIndices component
  const handleIndexSelect = (indexName: string, indexData: IndexData) => {
    setSelectedIndex(indexName);
    const indexCode = INDEX_CODE_MAP[indexName] || 'VNINDEX';
    setSelectedIndexCode(indexCode);
    
    // Update market data based on selected index
    const updatedMarketData = {
      ...marketData,
      indexData: {
        value: indexData.value || 0,
        data: indexData.data.map(point => ({
          time: String(point.time),
          value: point.open
        }))
      }
    };
    
    // Update statistics based on the selected index
    updateMarketStatistics(indexName, updatedMarketData);
    setMarketData(updatedMarketData);
  };
  
  // Handle index selection from StockTreeMap component
  const handleTreemapIndexChange = (indexCode: string) => {
    const indexName = INDEX_NAME_MAP[indexCode] || 'VN-Index';
    setSelectedIndex(indexName);
    setSelectedIndexCode(indexCode);
    
    // Update market data based on selected index
    const updatedMarketData = { ...marketData };
    updateMarketStatistics(indexName, updatedMarketData);
    setMarketData(updatedMarketData);
  };
  
  // Helper function to update market statistics based on selected index
  const updateMarketStatistics = (indexName: string, data: any) => {
    // In a real app, you would fetch this data from an API based on the selected index
    // For now, we're just updating with mock data
    switch(indexName) {
      case 'VN-Index':
        data.statistics = {
          pe: 13.1,
          marketCap: 5475997,
          tradingValue: 18661,
          tradingVolume: 814810599,
          high52w: 1307.8,
          low52w: 1174.8,
          ytdReturn: '3%',
          yearReturn: '4%'
        };
        break;
      case 'HNX':
        data.statistics = {
          pe: 12.3,
          marketCap: 1285635,
          tradingValue: 5132,
          tradingVolume: 224315689,
          high52w: 247.3,
          low52w: 208.9,
          ytdReturn: '2.5%',
          yearReturn: '3.2%'
        };
        break;
      case 'UPCOM':
        data.statistics = {
          pe: 10.8,
          marketCap: 875432,
          tradingValue: 3245,
          tradingVolume: 156248912,
          high52w: 102.4,
          low52w: 89.6,
          ytdReturn: '1.8%',
          yearReturn: '2.5%'
        };
        break;
      case 'VN30':
        data.statistics = {
          pe: 14.2,
          marketCap: 4125698,
          tradingValue: 12589,
          tradingVolume: 562489123,
          high52w: 1289.6,
          low52w: 1125.4,
          ytdReturn: '3.8%',
          yearReturn: '4.5%'
        };
        break;
      case 'HNX30':
        data.statistics = {
          pe: 11.5,
          marketCap: 956324,
          tradingValue: 4125,
          tradingVolume: 189456321,
          high52w: 512.4,
          low52w: 478.9,
          ytdReturn: '2.2%',
          yearReturn: '2.9%'
        };
        break;
      default:
        // Keep existing statistics
        break;
    }
    
    // Also update volume data for demonstration
    data.volumeData = {
      current: data.statistics.tradingVolume,
      previous: data.statistics.tradingVolume * 0.9, // Just an example
      data: Array.from({ length: 100 }, (_, i) => ({
        time: `${Math.floor(i / 60)}:${i % 60}`,
        value: data.statistics.tradingVolume * 0.7 + (Math.random() * 0.6 * data.statistics.tradingVolume)
      }))
    };
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    showNotFoundPage('Dashboard data not available');
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thị Trường</h1>
      <div className="dashboard-content">
        <div className="market-indices-wrapper">
          <MarketIndices onIndexSelect={handleIndexSelect} />
        </div>
        <StockTreeMap 
          width={'100%'} 
          height={500} 
          selectedIndex={selectedIndexCode}
          onIndexChange={handleTreemapIndexChange}
        />
        <MarketStatistics
          indexData={marketData.indexData}  
          volumeData={marketData.volumeData}
          statistics={marketData.statistics}
          currentSymbol={selectedIndexCode} // Pass the selected index code
        />
        <SmartTradeRecommendations recommendations={stockRecommendations} />
        <div className="dashboard-bottom-section">
          <StockNews />
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
