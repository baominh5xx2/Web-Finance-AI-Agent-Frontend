'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  ReferenceLine, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Dot,
  ReferenceDot
} from 'recharts';
import { fetchMarketIndex, fetchMarketIndexChart } from '@/app/services/marketindices';

// Define interfaces for API data
interface ApiDataPoint {
  time: string;
  open: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiDataPoint[];
}

// Define interface for index data
interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  data: { time: number; value: number; }[];
}

// Initial data
const initialIndices: IndexData[] = [
  {
    name: 'VN-Index',
    value: 1314.12,
    change: 0.6,
    changePercent: 0.05,
    data: []
  },
  {
    name: 'HNX',
    value: 239.2,
    change: -0.2,
    changePercent: -0.08,
    data: []
  },
  {
    name: 'UPCOM',
    value: 99.4,
    change: -0.24,
    changePercent: -0.24,
    data: []
  },
  {
    name: 'VN30',
    value: 1256.4,
    change: -7.19,
    changePercent: -0.54,
    data: []
  },
  {
    name: 'HNX30',
    value: 501.2,
    change: 1.19,
    changePercent: 0.22,
    data: []
  },
];

// Function để tạo điểm custom cho biểu đồ
const CustomizedDot = (props: any) => {
  const { cx, cy, stroke, dataKey, index, payload } = props;
  
  if (cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={3}
      fill="white"
      stroke={stroke}
      strokeWidth={2}
    />
  );
};

export default function MarketIndices() {
  // State to store the market data
  const [indices, setIndices] = useState<IndexData[]>(initialIndices);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  // Tạo ref để tham chiếu đến container scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to format chart data from API response
  const formatChartData = (apiData: ApiDataPoint[] | null): { time: number; value: number; }[] => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      // If no data, create some dummy data for testing
      return Array.from({ length: 30 }, (_, index) => ({
        time: index,
        value: 1200 + Math.random() * 20
      }));
    }
    
    // Format data with incremental time indices (0, 1, 2...) and price values
    return apiData.map((point, index) => ({
      time: index,
      value: point.open
    }));
  };

  // Fetch data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        let apiDataLoaded = false;
        
        // Define index codes and their corresponding names in the UI
        const indexMapping = [
          { code: 'VNINDEX', name: 'VN-Index' },
          { code: 'HNX', name: 'HNX' },
          { code: 'UPCOM', name: 'UPCOM' },
          { code: 'VN30', name: 'VN30' },
          { code: 'HNX30', name: 'HNX30' }
        ];
        
        // Process each index
        const updatedIndices = [...initialIndices];
        
        // Use hard-coded test data for charts
        for (let i = 0; i < updatedIndices.length; i++) {
          const mockData = Array.from({ length: 30 }, (_, index) => ({
            time: index,
            value: 1200 + (Math.random() - 0.5) * 30
          }));
          
          updatedIndices[i] = {
            ...updatedIndices[i],
            data: mockData
          };
        }
        
        // Set indices with test data immediately
        setIndices(updatedIndices);
        
        // Then try to get real data from API if available
        for (const index of indexMapping) {
          try {
            // Fetch basic index data
            const indexData = await fetchMarketIndex(index.code);
            
            if (indexData) {
              apiDataLoaded = true;
              console.log(`✓ API data loaded successfully for ${index.name}`);
              
              // Update basic index information
              setIndices(prevIndices => {
                const updatedIndices = [...prevIndices];
                const indexPosition = updatedIndices.findIndex(item => item.name === index.name);
                
                if (indexPosition !== -1) {
                  updatedIndices[indexPosition] = {
                    ...updatedIndices[indexPosition],
                    value: indexData.current_price,
                    change: indexData.price_change,
                    changePercent: indexData.price_change_percent
                  };
                }
                
                return updatedIndices;
              });
              
              // Fetch and format chart data
              const chartData = await fetchMarketIndexChart(index.code);
              console.log(`Chart data for ${index.name}:`, chartData); // Debug log
              
              if (chartData && chartData.length > 0) {
                console.log(`✓ Chart data loaded successfully for ${index.name} (${chartData.length} points)`);
                const formattedChartData = formatChartData(chartData);
                
                // Update chart data if we got something
                if (formattedChartData.length > 0) {
                  setIndices(prevIndices => {
                    const updatedIndices = [...prevIndices];
                    const indexPosition = updatedIndices.findIndex(item => item.name === index.name);
                    
                    if (indexPosition !== -1) {
                      updatedIndices[indexPosition] = {
                        ...updatedIndices[indexPosition],
                        data: formattedChartData
                      };
                    }
                    
                    return updatedIndices;
                  });
                }
              }
            }
          } catch (err) {
            console.error(`Error loading data for ${index.name}:`, err);
            // Continue with next index instead of failing completely
          }
        }
        
        setIsLoading(false);
        
        // Show final success status
        if (apiDataLoaded) {
          console.log('✅ Successfully loaded market data from API!');
          setApiSuccess(true);
          // You could also show a UI notification here if desired
        } else {
          console.warn('⚠️ Using fallback mock data as API data could not be loaded.');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Tính giá trị baseline cho mỗi chỉ số và xác định các điểm cao/thấp
  const indicesWithBaseline = indices.map(index => {
    // Nếu không có dữ liệu, trả về index ban đầu
    if (!index.data || index.data.length === 0) {
      return {
        ...index,
        baseline: 0,
        highPoint: 0,
        lowPoint: 0,
        highPointIndex: 0,
        lowPointIndex: 0
      };
    }
    
    const avgValue = index.data.reduce((sum, point) => sum + point.value, 0) / index.data.length;
    
    // Tìm giá trị cao nhất và thấp nhất
    const highPoint = Math.max(...index.data.map(point => point.value));
    const lowPoint = Math.min(...index.data.map(point => point.value));
    
    // Tìm vị trí (index) của các điểm này
    const highPointIndex = index.data.findIndex(point => point.value === highPoint);
    const lowPointIndex = index.data.findIndex(point => point.value === lowPoint);
    
    return {
      ...index,
      baseline: avgValue,
      highPoint,
      lowPoint,
      highPointIndex,
      lowPointIndex
    };
  });

  // Hàm xử lý sự kiện cuộn sang trái
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -240, // Cuộn sang trái 240px (khoảng 1 thẻ + margin)
        behavior: 'smooth'
      });
    }
  };

  // Hàm xử lý sự kiện cuộn sang phải
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 240, // Cuộn sang phải 240px (khoảng 1 thẻ + margin)
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="market-indices-container">
        <div className="flex justify-center items-center p-4">
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-indices-container">
        <div className="flex justify-center items-center p-4 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-indices-container">
      <button className="scroll-button left" onClick={handleScrollLeft}>
        <i className="arrow left"></i>
      </button>

      <div className="market-indices-scroll" ref={scrollContainerRef}>
        {indicesWithBaseline.map((index, i) => (
          <div key={index.name} className="market-index-card">
            <div className="market-index-content">
              <div className="market-index-info">
                <h3 className="market-index-name">{index.name}</h3>
                <div className={`market-index-value ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  {index.value !== undefined ? index.value.toFixed(1) : 'N/A'}
                </div>
                <div className={`market-index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change-arrow">{index.change >= 0 ? '▲' : '▼'}</span>
                  {index.change !== undefined ? Math.abs(index.change).toFixed(1) : 'N/A'} 
                  {index.changePercent !== undefined ? `(${Math.abs(index.changePercent).toFixed(2)}%)` : ''}
                </div>
              </div>
              <div 
                className="market-index-chart" 
                style={{ 
                  width: '120px', 
                  height: '80px',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {/* Debug info */}
                {index.data.length === 0 && <div style={{fontSize: '10px', color: 'red'}}>No data</div>}
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={index.data.length > 0 ? index.data : [
                      {time: 0, value: 1200},
                      {time: 1, value: 1210},
                      {time: 2, value: 1205}
                    ]} 
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id={`colorUv${i}`} x1="0" y1="0" x2="0" y2="1"> 
                        <stop offset="5%" stopColor={index.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={index.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    {/* Simplified chart for testing */}
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={index.change >= 0 ? "#22C55E" : "#EF4444"} 
                      fillOpacity={1}
                      fill={`url(#colorUv${i})`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="scroll-button right" onClick={handleScrollRight}>
        <i className="arrow right"></i>
      </button>
    </div>
  );
}