'use client';

import { useState, useEffect } from 'react';
import { showNotFoundPage } from '@/utils/notFoundHelper';
import MarketIndices from '@/components/market-watch/MarketIndices';
import StockTreeMap from '@/components/StockTreeMap/StockTreeMap';
import './dashboard.css';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thị Trường</h1>
      <div className="dashboard-content">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <MarketIndices />
            <StockTreeMap width={'100%'} height={800} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Các thành phần khác của dashboard sẽ được thêm vào đây */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
