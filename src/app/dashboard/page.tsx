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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [newsItems] = useState([
    {
      title: 'Market Update',
      date: '2024-01-20',
      time: '09:00'
    }
  ]);

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

  // Mock data for stock recommendations
  const stockRecommendations = [
    {
      code: 'THG',
      smartScore: 73,
      recommendation: 'NẮM GIỮ',
      currentPrice: 43.23,
      purchasePrice: 21.65,
      purchaseDate: '21/11/2024',
      percentChange: 43.7
    },
    {
      code: 'MBB',
      smartScore: 71,
      recommendation: 'NẮM GIỮ',
      currentPrice: 21.65,
      purchasePrice: 26.12,
      purchaseDate: '26/12/2024',
      percentChange: 6.5
    },
    {
      code: 'QNS',
      smartScore: 68,
      recommendation: 'NẮM GIỮ',
      currentPrice: 47.95,
      purchasePrice: 23.09,
      purchaseDate: '23/09/2024',
      percentChange: 5.5
    },
    {
      code: 'SIP',
      smartScore: 67,
      recommendation: 'NẮM GIỮ',
      currentPrice: 78.16,
      purchasePrice: 6.11,
      purchaseDate: '06/11/2024',
      percentChange: 13.4
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchData();
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
          <MarketIndices />
        </div>
        <StockTreeMap width={'100%'} height={800} />
        <MarketStatistics
          indexData={marketData.indexData}  
          volumeData={marketData.volumeData}
          statistics={marketData.statistics}
        />
        <SmartTradeRecommendations recommendations={stockRecommendations} />
        <div className="dashboard-bottom-section">
          <StockNews newsItems={newsItems} />
          <InvestmentPerformance />
        </div>
      </div>
      <Chatbot /> {/* Add the Chatbot component at the end of the dashboard container */}
    </div>
  );
}
