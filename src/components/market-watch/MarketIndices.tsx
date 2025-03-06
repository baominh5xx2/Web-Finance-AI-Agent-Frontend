'use client';

import React, { useRef, useState, useEffect } from 'react';
import { fetchMarketIndex, fetchMarketIndexChart, fetchMultipleIndices } from '@/app/services/marketindices';
import D3AreaChart from './D3AreaChart';
import './MarketIndices.css';

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
  value: number | null;
  change: number | null;
  changePercent: number | null;
  data: ChartDataPoint[];
}

interface ChartDataPoint {
  time: string | number;
  open: number;
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

// Tìm đoạn code render giá trị của các chỉ số
const formatValue = (value: number | null): string => {
  if (value === null) return 'N/A';
  return value.toFixed(2);
};

const formatChange = (change: number | null): string => {
  if (change === null) return 'N/A';
  return change.toFixed(2);
};

const formatChangePercent = (percent: number | null): string => {
  if (percent === null) return 'N/A';
  return `${percent.toFixed(2)}%`;
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
      time: i,
      open: Number(open.toFixed(2))
    });
  }
  
  return points;
};

export default function MarketIndices() {
  // State to store the market data
  const [indices, setIndices] = useState<IndexData[]>(initialIndices);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0);

  // Tạo ref để tham chiếu đến container scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to format chart data from API response
  const formatChartData = (apiData: ApiDataPoint[] | null): { time: number; open: number; }[] => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      // If no data, create some dummy data for testing
      return Array.from({ length: 30 }, (_, index) => ({
        time: index,
        open: 1200 + Math.random() * 20
      }));
    }
    
    // Format data with incremental time indices (0, 1, 2...) and price values
    return apiData.map((point, index) => ({
      time: index,
      open: point.open
    }));
  };

  // Fetch data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Ghi nhận thời điểm bắt đầu tải
        const startTime = performance.now();
        setLoadingStartTime(startTime);
        setIsLoading(true);
        
        // Đảm bảo thông báo "Loading market data..." hiển thị ít nhất 1 giây
        // để tránh hiện tượng nhấp nháy nếu dữ liệu tải quá nhanh
        const loadingPromise = new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load initial data immediately for a responsive UI
        let apiDataLoaded = false;
        const updatedIndices = [...indices];
        
        // Generate mock chart data for immediate display
        for (let i = 0; i < updatedIndices.length; i++) {
          const mockData = generateMockChartData(updatedIndices[i].value || 100);
          
          updatedIndices[i] = {
            ...updatedIndices[i],
            data: mockData
          };
        }
        
        // Set indices with test data immediately
        setIndices(updatedIndices);
        
        // Fetch data from API using the fetchMultipleIndices function
        try {
          console.log("Fetching market indices data...");
          const fetchStartTime = performance.now();
          
          // Gọi API với đúng mã chỉ số
          const allIndices = await fetchMultipleIndices(['VNINDEX', 'HNXINDEX', 'UPCOMINDEX', 'VN30', 'HNX30'], 90);
          
          const fetchEndTime = performance.now();
          console.log(`API fetch completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
          
          // Debug log chi tiết về dữ liệu
          console.log('API returned data:', allIndices);
          
          apiDataLoaded = true;
          console.log('✅ Successfully loaded market data from API!');
          
          // Update with real data
          setIndices(prevIndices => {
            const newIndices = [...prevIndices];
            
            // Debug log trạng thái indices trước khi cập nhật
            console.log('Previous indices:', prevIndices);
            
            // Update each index
            const indexMap: Record<string, string> = {
              'VNINDEX': 'VN-Index',
              'HNXINDEX': 'HNX',
              'UPCOMINDEX': 'UPCOM',
              'VN30': 'VN30',
              'HNX30': 'HNX30'
            };
            
            console.log('Index map:', indexMap);
            
            for (const [code, name] of Object.entries(indexMap)) {
              const indexPosition = newIndices.findIndex(item => item.name === name);
              
              console.log(`Processing ${code} => ${name}, found at position ${indexPosition}`);
              
              if (indexPosition !== -1) {
                const indexData = allIndices[code]; // This will be null for N/A indices
                console.log(`Data for ${code}:`, indexData ? `${indexData.length} items` : 'null');
                
                if (!indexData || indexData.length === 0) {
                  // Set N/A values
                  console.log(`${code} has no data, setting to N/A`);
                  newIndices[indexPosition] = {
                    ...newIndices[indexPosition],
                    value: null,
                    change: null,
                    changePercent: null,
                    data: [] // Empty chart data
                  };
                } else {
                  // We have data, calculate current value and changes
                  try {
                    // Get the most recent value
                    const latestValue = indexData[indexData.length - 1]?.open || null;
                    
                    // Get the previous value from the day before
                    const previousValue = indexData[0]?.open || null;
                    
                    if (latestValue !== null && previousValue !== null) {
                      const change = latestValue - previousValue;
                      const changePercent = (change / previousValue) * 100;
                      
                      newIndices[indexPosition] = {
                        ...newIndices[indexPosition],
                        value: latestValue,
                        change: change,
                        changePercent: changePercent,
                        data: indexData.map(item => ({
                          time: item.time,
                          open: item.open
                        }))
                      };
                    } else {
                      // If we can't calculate proper values
                      newIndices[indexPosition] = {
                        ...newIndices[indexPosition],
                        value: null,
                        change: null,
                        changePercent: null
                      };
                    }
                  } catch (e) {
                    console.error(`Error processing data for ${code}:`, e);
                    newIndices[indexPosition] = {
                      ...newIndices[indexPosition],
                      value: null,
                      change: null,
                      changePercent: null
                    };
                  }
                }
              }
            }
            
            return newIndices;
          });
          
          setApiSuccess(true);
        } catch (e) {
          console.error("Error fetching market indices:", e);
          setError(`Failed to load market data: ${e}`);
          setApiSuccess(false);
        }
        
        // Đảm bảo thời gian loading tối thiểu để không nhấp nháy
        await loadingPromise;
        
        // Tính toán và log thời gian tải
        const endTime = performance.now();
        console.log(`Total loading time: ${(endTime - startTime).toFixed(2)}ms`);
        
        setIsLoading(false);
      } catch (e) {
        console.error("Error in market data loading:", e);
        setError(`Error loading market data: ${e}`);
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
    
    // Use 'open' property consistently instead of 'value'
    const avgValue = index.data.reduce((sum, point) => sum + point.open, 0) / index.data.length;
    
    // Tìm giá trị cao nhất và thấp nhất - use 'open' property
    const highPoint = Math.max(...index.data.map(point => point.open));
    const lowPoint = Math.min(...index.data.map(point => point.open));
    
    // Tìm vị trí (index) của các điểm này - use 'open' property
    const highPointIndex = index.data.findIndex(point => point.open === highPoint);
    const lowPointIndex = index.data.findIndex(point => point.open === lowPoint);
    
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
                <div className={`market-index-value ${(index.change ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatValue(index.value)}
                </div>
                <div className={`market-index-change ${(index.change ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change-arrow">{(index.change ?? 0) >= 0 ? '▲' : '▼'}</span>
                  {formatChange(index.change)}({formatChangePercent(index.changePercent)})
                </div>
              </div>
              <div 
                className="market-index-chart" 
                style={{ 
                  width: '120px', 
                  height: '60px',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {/* Debug info */}
                {index.data.length === 0 && <div style={{fontSize: '10px', color: 'red'}}>No data</div>}
                
                {/* D3 Area Chart */}
                <D3AreaChart 
                  data={index.data.length > 0 ? index.data.map(point => ({
                    time: String(point.time),
                    value: point.open
                  })) : [
                    {time: "0", value: 1200},
                    {time: "1", value: 1210},
                    {time: "2", value: 1205}
                  ]}
                  width={120}
                  height={60}
                  isPositive={(index.change ?? 0) >= 0}
                />
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