'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './StockTreeMap.css';
import { getTreemapColor } from '@/app/services/treemap_color';

// Interface for API response
interface ApiStockData {
  symbol: string;
  total_value: number;
  market_cap: number;
  difference: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiStockData[];
}

interface StockData {
  name: string;
  value: number;
  change: number;
  color: string;
  difference: number;  // Add difference field
}

interface StockGroup {
  name: string;
  children: StockData[];
  color: string;
}

interface TreemapData {
  name: string;
  children: StockGroup[];
}

// Interface for D3's treemap nodes with required properties
interface TreemapNode extends d3.HierarchyNode<TreemapData> {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

// Định nghĩa các chỉ số thị trường
const MARKET_INDICES = [
  { id: 'VNINDEX', name: 'VN-Index' },
  { id: 'HNX', name: 'HNX' },
  { id: 'UPCOM', name: 'UPCOM' },
  { id: 'VN30', name: 'VN30' },
  { id: 'HNX30', name: 'HNX30' }
];

// Mapping từ mã chỉ số sang API endpoint
const INDEX_API_MAP: Record<string, string> = {
  'VNINDEX': 'HOSE',
  'HNX': 'HNX',
  'UPCOM': 'UPCOM',
  'VN30': 'VN30',
  'HNX30': 'HNX30'
};

// Tính toán thống kê
const stats = {
  increasedStocks: 191,  // Số cổ phiếu tăng
  decreasedStocks: 262,  // Số cổ phiếu giảm
  unchangedStocks: 133,  // Số cổ phiếu đứng giá
  ceilingStocks: 3,      // Số cổ phiếu tăng trần
  floorStocks: 2         // Số cổ phiếu giảm sàn
};

// Thêm hằng số cho thời gian tối đa cache có hiệu lực (12 tiếng tính bằng millisecond)
const CACHE_MAX_AGE = 12 * 60 * 60 * 1000; // 12 giờ

interface StockTreeMapProps {
  width?: string | number;
  height?: number;
  selectedIndex?: string;
  onIndexChange?: (indexId: string) => void;
}

export default function StockTreeMap({ 
  width = '100%', 
  height = 400,
  selectedIndex = 'VNINDEX',
  onIndexChange
}: StockTreeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });
  const [treemapData, setTreemapData] = useState<TreemapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Thêm state nội bộ để theo dõi chỉ số được chọn
  const [currentIndex, setCurrentIndex] = useState<string>(selectedIndex);
  
  // Sử dụng ref để theo dõi các chỉ số đã được load
  const loadedIndicesRef = useRef<Set<string>>(new Set());
  // Sử dụng ref để theo dõi các request đang chạy
  const pendingRequestsRef = useRef<Record<string, boolean>>({});
  // Thêm ref để lưu trữ dữ liệu treemap cho mỗi chỉ số
  const cachedTreemapDataRef = useRef<Record<string, TreemapData>>({});

  // Đồng bộ state nội bộ với prop từ bên ngoài
  useEffect(() => {
    if (selectedIndex !== currentIndex) {
      setCurrentIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // Xử lý khi người dùng chọn chỉ số
  const handleIndexSelect = (indexId: string) => {
    console.log(`[Component] User selected index: ${indexId}`);
    // Cập nhật state nội bộ
    setCurrentIndex(indexId);
    
    // Gọi callback nếu có
    if (onIndexChange) {
      onIndexChange(indexId);
    }
    
    // Gọi trực tiếp fetchTreemapData để đảm bảo dữ liệu được cập nhật ngay lập tức
    fetchTreemapData(indexId);
  };
  
  // Thêm hàm kiểm tra cache có hết hạn chưa
  const isCacheExpired = (createdAt: number): boolean => {
    const now = new Date().getTime();
    const age = now - createdAt;
    const isExpired = age > CACHE_MAX_AGE;
    
    if (isExpired) {
      console.log(`[Component] Cache created at ${new Date(createdAt).toLocaleString()} has expired (age: ${Math.round(age / (60 * 60 * 1000))} hours)`);
    } else {
      console.log(`[Component] Cache is still valid (age: ${Math.round(age / (60 * 1000))} minutes)`);
    }
    
    return isExpired;
  };

  // Fetch data from API or cache
  const fetchTreemapData = async (indexCode: string) => {
    try {
      // Kiểm tra xem request đã đang chạy hay chưa
      if (pendingRequestsRef.current[indexCode]) {
        console.log(`[Component] Request for ${indexCode} is already in progress, skipping`);
        return;
      }
      
      // Đánh dấu là request đang chạy
      pendingRequestsRef.current[indexCode] = true;
      
      // Kiểm tra xem đã load trước đó chưa và đã có dữ liệu chưa
      if (loadedIndicesRef.current.has(indexCode) && treemapData) {
        console.log(`[Component] Index ${indexCode} already loaded in memory, skipping fetch`);
        pendingRequestsRef.current[indexCode] = false;
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      console.log(`[Component] Fetching data for index: ${indexCode}`);
      
      // STEP 1: Thử đọc từ file JSON trực tiếp từ thư mục public
      let cacheSuccess = false;
      
      try {
        console.log(`[Component] Attempting to load ${indexCode}.json directly from public/data folder`);
        console.time("CacheLoad");
        
        // Thêm timestamp để tránh cache của trình duyệt
        const timestamp = new Date().getTime();
        const cacheUrl = `/data/${indexCode}.json?t=${timestamp}`;
        
        try {
          // Thử tải file JSON từ thư mục public
          const response = await fetch(cacheUrl, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
            // Đặt timeout 2 giây để tránh chờ quá lâu nếu file không tồn tại
            signal: AbortSignal.timeout(2000)
          });
          
          console.log(`[Component] Cache file response status: ${response.status}`);
          
          if (response.ok) {
            // Đọc dữ liệu từ file cache
            const jsonData = await response.json();
            console.log(`[Component] Successfully loaded JSON file from public folder`);
            
            // Kiểm tra cấu trúc dữ liệu
            let validTreemapData = null;
            let cacheCreatedAt = null;
            
            if (jsonData.indexTreemapData) {
              console.log('[Component] Using indexTreemapData from JSON file');
              validTreemapData = jsonData.indexTreemapData;
              
              // Lấy thời gian tạo cache từ nhiều định dạng có thể có
              // Ưu tiên kiểm tra cấu trúc mới
              if (jsonData.cacheMeta && jsonData.cacheMeta.createdAt) {
                cacheCreatedAt = jsonData.cacheMeta.createdAt;
                console.log(`[Component] Cache was created at (from cacheMeta): ${new Date(cacheCreatedAt).toLocaleString()}`);
              } 
              // Kiểm tra định dạng cũ (savedAt hoặc timestamp)
              else if (jsonData.savedAt) {
                // Chuyển đổi chuỗi ISO sang timestamp
                cacheCreatedAt = new Date(jsonData.savedAt).getTime();
                console.log(`[Component] Cache was created at (from savedAt): ${new Date(cacheCreatedAt).toLocaleString()}`);
              }
              else if (jsonData.timestamp) {
                // Chuyển đổi chuỗi ISO sang timestamp
                cacheCreatedAt = new Date(jsonData.timestamp).getTime();
                console.log(`[Component] Cache was created at (from timestamp): ${new Date(cacheCreatedAt).toLocaleString()}`);
              }
              // Kiểm tra nếu timestamp nằm trong metadata (cấu trúc khác)
              else if (jsonData.metadata && jsonData.metadata.timestamp) {
                cacheCreatedAt = new Date(jsonData.metadata.timestamp).getTime();
                console.log(`[Component] Cache was created at (from metadata.timestamp): ${new Date(cacheCreatedAt).toLocaleString()}`);
              }
              else {
                console.warn('[Component] Cache file does not contain any recognized timestamp field');
              }
              
              // Thay đổi phần xóa cache quá hạn
              if (cacheCreatedAt) {
                if (isCacheExpired(cacheCreatedAt)) {
                  console.log(`[Component] Cache has expired, will fetch fresh data`);
                  
                  // Xóa file cache cũ bằng cách gọi API route mới
                  try {
                    console.log(`[Component] Deleting expired cache file for ${indexCode}...`);
                    
                    // Sử dụng API route mới để xóa file
                    const deleteResponse = await fetch(`/api/index-data/save`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        action: 'delete',
                        indexCode: indexCode
                      }),
                    });
                    
                    if (deleteResponse.ok) {
                      const result = await deleteResponse.json();
                      console.log(`[Component] ✅ Successfully deleted expired cache file for ${indexCode}: ${result.message}`);
                    } else {
                      console.warn(`[Component] Failed to delete expired cache: ${deleteResponse.status} ${deleteResponse.statusText}`);
                    }
                  } catch (deleteError) {
                    console.error(`[Component] Error deleting expired cache:`, deleteError);
                  }
                  
                  // Đánh dấu là chưa load để fetch lại
                  loadedIndicesRef.current.delete(indexCode);
                  // Bỏ qua cache này
                  validTreemapData = null;
                }
              } else {
                console.warn('[Component] Unable to determine cache age, treating as valid');
              }
            } else {
              console.log('[Component] JSON file does not contain expected indexTreemapData structure');
            }
            
            if (validTreemapData && validTreemapData.children) {
              console.log('[Component] ✅ Valid treemap data found in JSON file, using it');
              
              // Lưu vào cache
              cachedTreemapDataRef.current[indexCode] = validTreemapData;
              
              setTreemapData(validTreemapData);
              setIsLoading(false);
              
              // Đánh dấu đã load chỉ số này
              loadedIndicesRef.current.add(indexCode);
              cacheSuccess = true;
              console.timeEnd("CacheLoad");
              
              // Đánh dấu request đã kết thúc và thoát
              pendingRequestsRef.current[indexCode] = false;
              return; // Chắc chắn thoát hàm ngay lập tức khi cache hợp lệ
            } else {
              console.warn('[Component] JSON file exists but data structure is invalid or expired, proceeding to backend API call');
            }
          } else {
            console.log(`[Component] Cache file not found in public folder, status: ${response.status}`);
          }
        } catch (fetchError: any) {
          console.warn(`[Component] Error fetching cache file: ${fetchError.message}`);
        }
        
        console.timeEnd("CacheLoad");
      } catch (cacheError) {
        console.error(`[Component] Error in cache loading process:`, cacheError);
      }
      
      if (cacheSuccess) {
        console.log('[Component] Cache load was successful, we should not see this message');
        pendingRequestsRef.current[indexCode] = false;
        return;
      }
      
      // STEP 2: Nếu không có cache, mới gọi API
      console.log(`[Component] No valid cache found, calling backend API for ${indexCode}...`);
      const apiIndex = INDEX_API_MAP[indexCode] || 'HOSE';
      
      // Gọi API lấy dữ liệu
      console.time("BackendAPICall");
      console.log(`[Component] Fetching from backend API: http://localhost:8000/api/v1/treemap/${apiIndex}`);
      const response = await fetch(`http://localhost:8000/api/v1/treemap/${apiIndex}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.timeEnd("BackendAPICall");
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      
      console.log(`[Component] Successfully received data from backend API with ${data.data.length} stocks`);
      
      // Transform API data to TreemapData format
      console.time("TransformData");
      const transformedData = await transformApiData(data.data, indexCode);
      console.timeEnd("TransformData");
      
      // STEP 3: Lưu dữ liệu để tái sử dụng sau này - bằng cách POST lên API
      console.time("SaveCache");
      console.log(`[Component] Saving transformed data to cache for future use...`);
      
      try {
        // Tạo dữ liệu để lưu cache
        const dataToCache = {
          indexCode: indexCode,
          data: {
            indexTreemapData: transformedData
          }
        };
        
        // Lưu vào file JSON thông qua API route
        const cacheResponse = await fetch(`/api/index-data/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToCache),
        });
        
        if (cacheResponse.ok) {
          const result = await cacheResponse.json();
          console.log(`[Component] ✅ Successfully saved cache file for ${indexCode}. Saved at: ${result.path}`);
        } else {
          console.warn(`[Component] Failed to save cache: ${cacheResponse.status} ${cacheResponse.statusText}`);
        }
      } catch (error) {
        console.error(`[Component] Error saving cache:`, error);
      }
      
      console.timeEnd("SaveCache");
      
      // Sau khi transform API data thành công
      console.log(`[Component] Setting transformed data for ${indexCode}`);
      
      // Lưu vào cache
      cachedTreemapDataRef.current[indexCode] = transformedData;
      
      setTreemapData(transformedData);
      setIsLoading(false);
      
      // Đánh dấu đã tải dữ liệu cho index này
      loadedIndicesRef.current.add(indexCode);
      
    } catch (err) {
      console.error('[Component] Error fetching treemap data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      // Đánh dấu là request đã hoàn thành
      pendingRequestsRef.current[indexCode] = false;
      setIsLoading(false);
    }
  };
  
  // Sử dụng useCallback để đảm bảo hàm này không được tạo lại mỗi khi component re-render
  const fetchTreemapDataCallback = useCallback(fetchTreemapData, []);

  // Lấy kích thước thực của container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Sử dụng chiều cao được truyền vào từ props thay vì tính toán
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Fetch data when currentIndex changes
  useEffect(() => {
    console.log(`[Component] Current index changed to: ${currentIndex}`);
    
    // Kiểm tra xem đã load index này chưa
    if (loadedIndicesRef.current.has(currentIndex)) {
      console.log(`[Component] Index ${currentIndex} already loaded, retrieving from cache`);
      
      // Lấy dữ liệu từ cache và hiển thị
      if (cachedTreemapDataRef.current[currentIndex]) {
        console.log(`[Component] Displaying cached data for ${currentIndex}`);
        setTreemapData(cachedTreemapDataRef.current[currentIndex]);
        setIsLoading(false);
        return;
      } else {
        console.warn(`[Component] Index ${currentIndex} marked as loaded but no data found in cache`);
      }
    }
    
    // Chưa load, tiến hành fetch
    fetchTreemapDataCallback(currentIndex);
    
  }, [currentIndex, fetchTreemapDataCallback]);

  // Render treemap when data or dimensions change
  useEffect(() => {
    if (!svgRef.current || !treemapData || treemapData.children.length === 0) return;
    
    // Xóa nội dung cũ
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // Tạo root hierarchy
    const root = d3.hierarchy<TreemapData>(treemapData)
      .sum((d: any) => {
        if ('value' in d) {
          return (d as StockData).value;
        }
        return 0;
      });

    // Tạo treemap layout với padding mới
    const treemapGenerator = d3.treemap<TreemapData>()
      .size([dimensions.width, dimensions.height])
      .paddingTop(0)
      .paddingRight(1)
      .paddingBottom(1)
      .paddingLeft(1)
      .paddingInner(1);

    // Apply the treemap generator to the root
    treemapGenerator(root);

    // Vẽ các hình chữ nhật
    const cells = svg.selectAll("g")
      .data(root.descendants() as TreemapNode[])
      .enter()
      .append("g")
      .attr("transform", (d: TreemapNode) => `translate(${d.x0},${d.y0})`);

    // Vẽ các ô cho leaf nodes (cổ phiếu)
    cells
      .filter((d: TreemapNode) => d.depth === 2)
      .append("rect")
      .attr("width", (d: TreemapNode) => d.x1 - d.x0)
      .attr("height", (d: TreemapNode) => d.y1 - d.y0)
      .attr("fill", (d: TreemapNode) => {
        const data = d.data as any;
        return data && 'color' in data ? data.color : "#ccc";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    // Điều chỉnh ngưỡng hiển thị text và kích thước font
    cells.filter((d: TreemapNode) => d.depth === 2).each(function(d: TreemapNode) {
      const cell = d3.select(this);
      const cellWidth = d.x1 - d.x0;
      const cellHeight = d.y1 - d.y0;
      const cellArea = cellWidth * cellHeight; // Tính diện tích của ô
      
      // Chỉ hiển thị text nếu ô đủ lớn
      if (cellWidth < 40 || cellHeight < 30) return;

      const centerX = cellWidth / 2;
      const centerY = cellHeight / 2;
      
      // Tính toán kích thước font theo từng ngưỡng diện tích cụ thể
      let titleFontSize, valueFontSize;
      
      // Sử dụng các ngưỡng diện tích cố định dựa trên kích thước thực tế của các ô
      if (cellArea >= 100000) { // Ô rất lớn (như VCB)
        titleFontSize = 32;
        valueFontSize = 20;
      } else if (cellArea >= 50000) { // Ô lớn (như BID, HPG)
        titleFontSize = 26;
        valueFontSize = 18;
      } else if (cellArea >= 25000) { // Ô trung bình lớn (như TCB, VIC)
        titleFontSize = 22;
        valueFontSize = 16;
      } else if (cellArea >= 15000) { // Ô trung bình (như GAS, VHM)
        titleFontSize = 18;
        valueFontSize = 14;
      } else if (cellArea >= 10000) { // Ô trung bình nhỏ (như ACB, LPB)
        titleFontSize = 16;
        valueFontSize = 12;
      } else if (cellArea >= 5000) { // Ô nhỏ (như PLX, SSB)
        titleFontSize = 14;
        valueFontSize = 10;
      } else { // Ô rất nhỏ (như VRE, TPB)
        titleFontSize = 12;
        valueFontSize = 9;
      }

      // Tên cổ phiếu - đặt ở trung tâm ô hơn
      cell.append("text")
        .attr("x", centerX)
        .attr("y", centerY - Math.min(12, cellHeight * 0.15)) // Điều chỉnh vị trí theo chiều cao ô
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("font-size", `${titleFontSize}px`)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text((d: any) => d.data.name);
      
      // Chỉ hiển thị giá trị nếu ô đủ lớn
      if (cellArea >= 4000) {
        // Giá trị cổ phiếu ở dưới tên
        cell.append("text")
          .attr("x", centerX)
          .attr("y", centerY + Math.min(12, cellHeight * 0.15)) // Điều chỉnh vị trí theo chiều cao ô
          .attr("fill", "#fff")
          .attr("font-size", `${valueFontSize}px`)
          .attr("text-anchor", "middle")
          .text((d: any) => {
            // Kiểm tra nếu có displayValue và không phải NaN
            if (d.data.displayValue && !isNaN(d.data.displayValue)) {
              const valueInBillions = d.data.displayValue / 1000000000;
              const formattedValue = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              }).format(valueInBillions);
              
              // Rút gọn định dạng cho các ô nhỏ hơn
              if (cellArea < 8000) {
                return `${formattedValue}`;
              }
              return `${formattedValue} tỷ`;
            }
            
            // Nếu có percentage_change, hiển thị nó
            if (d.data.change !== undefined && !isNaN(d.data.change)) {
              const changeValue = Number(d.data.change);
              const formattedChange = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                signDisplay: 'always'
              }).format(changeValue);
              return `${formattedChange}%`;
            }
            
            return ''; // Trả về chuỗi rỗng nếu không có giá trị hợp lệ
          });
      }
    });
  }, [dimensions, treemapData]);

  // Transform API data to TreemapData format
  const transformApiData = async (apiData: ApiStockData[], indexCode: string): Promise<TreemapData> => {
    console.log(`[Component] Transforming API data to TreemapData format for ${indexCode}...`);
    
    // Sắp xếp theo vốn hóa giảm dần và lấy top 35 cổ phiếu
    const sortedStocks = apiData
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 35);
    
    // Lấy dữ liệu difference cho từng cổ phiếu từ API treemap_color
    console.log(`[Component] Fetching detailed data for ${sortedStocks.length} stocks...`);
    const stocksWithDifference = await Promise.all(
      sortedStocks.map(async (stock) => {
        try {
          // Gọi API để lấy dữ liệu difference
          const stockData = await getTreemapColor(stock.symbol);
          return {
            ...stock,
            apiDifference: stockData.difference,
            percentageChange: stockData.percentage_change
          };
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          // Sử dụng dữ liệu difference mặc định nếu API thất bại
          return stock;
        }
      })
    );
    
    console.log(`[Component] Creating treemap data structure...`);
    
    // Tạo dữ liệu treemap
    const result = {
      name: `Thị trường ${MARKET_INDICES.find(i => i.id === indexCode)?.name || indexCode}`,
      children: [
        {
          name: "Cổ phiếu",
          color: "#2563eb",
          children: stocksWithDifference.map(stock => {
            // Sử dụng apiDifference nếu có, nếu không thì dùng difference từ dữ liệu gốc
            const diffValue = 'apiDifference' in stock ? stock.apiDifference : stock.difference;
            const percentageValue = 'percentageChange' in stock ? stock.percentageChange : 0;
            
            // Chuyển đổi diffValue thành số để so sánh chính xác
            const numericDiff = Number(diffValue);
            const numericPercentage = Number(percentageValue);
            
            // Quyết định màu sắc dựa trên giá trị difference
            let color;
            
            if (numericDiff < 0) {
              // Màu đỏ cho giá trị âm
              color = '#ef4444';
            } else if (numericDiff > 0) {
              // Màu xanh cho giá trị dương
              color = '#22c55e';
            } else {
              // Màu vàng cho giá trị bằng 0
              color = '#eab308';
            }
            
            // Sử dụng giá trị tuyệt đối của percentage_change để xác định kích thước ô
            // và thêm một giá trị nhỏ để tránh ô có kích thước 0
            const absolutePercentage = Math.abs(numericPercentage) + 0.01;
            
            return {
              name: stock.symbol,
              value: absolutePercentage * 1000, // Nhân với 1000 để tăng sự khác biệt về kích thước
              change: numericPercentage, // Lưu giá trị phần trăm thay đổi
              difference: numericDiff,
              color: color,
              displayValue: stock.market_cap // Giữ lại giá trị vốn hóa để hiển thị
            };
          })
        }
      ]
    };
    
    console.log(`[Component] Transformation complete. Generated TreemapData with ${result.children[0].children.length} stocks.`);
    return result;
  };

  return (
    <div className="stock-treemap-container">
      <div className="stock-treemap-header">
      </div>
      <div className="stock-treemap-wrapper" ref={containerRef}>
        {isLoading && (
          <div className="stock-treemap-loading">
            <p>Đang tải dữ liệu...</p>
          </div>
        )}
        
        {error && (
          <div className="stock-treemap-error">
            <p>Lỗi: {error}</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <svg ref={svgRef}></svg>
        )}
      </div>
    </div>
  );
}
