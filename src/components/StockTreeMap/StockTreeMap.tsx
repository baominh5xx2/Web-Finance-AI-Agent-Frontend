'use client';

import React, { useRef, useEffect, useState } from 'react';
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

interface StockTreeMapProps {
  width?: string | number;
  height?: number;
  selectedIndex?: string;
  onIndexChange?: (indexId: string) => void;
}

export default function StockTreeMap({ 
  width = '100%', 
  height = 800,
  selectedIndex = 'VNINDEX',
  onIndexChange
}: StockTreeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [treemapData, setTreemapData] = useState<TreemapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Xử lý khi người dùng chọn chỉ số
  const handleIndexSelect = (indexId: string) => {
    if (onIndexChange) {
      onIndexChange(indexId);
    }
  };
  // Fetch data from API
  const fetchTreemapData = async (indexCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiIndex = INDEX_API_MAP[indexCode] || 'HOSE';
      const response = await fetch(`http://localhost:8000/api/v1/treemap/${apiIndex}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      
      // Transform API data to TreemapData format with colors
      const transformedData = await transformApiData(data.data, indexCode);
      setTreemapData(transformedData);
      
    } catch (err) {
      console.error('Error fetching treemap data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to TreemapData format
  const transformApiData = async (apiData: ApiStockData[], indexCode: string): Promise<TreemapData> => {
    // Sắp xếp theo vốn hóa giảm dần và lấy top 50 cổ phiếu
    const sortedStocks = apiData
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 35);
    
    // Lấy dữ liệu difference cho từng cổ phiếu từ API treemap_color
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
    
    return {
      name: `Thị trường ${MARKET_INDICES.find(i => i.id === indexCode)?.name || indexCode}`,
      children: [
        {
          name: "Cổ phiếu",
          color: "#2563eb",
          children: stocksWithDifference.map(stock => {
            // Sử dụng apiDifference nếu có, nếu không thì dùng difference từ dữ liệu gốc
            const diffValue = 'apiDifference' in stock ? stock.apiDifference : stock.difference;
            
            // Chuyển đổi diffValue thành số để so sánh chính xác
            const numericDiff = Number(diffValue);
            
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
            
            return {
              name: stock.symbol,
              value: stock.market_cap,
              change: numericDiff,
              difference: numericDiff,
              color: color
            };
          })
        }
      ]
    };
  };

  // Lấy kích thước thực của container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Tính toán chiều cao dựa trên viewport height
        const viewportHeight = window.innerHeight;
        const calculatedHeight = Math.max(600, viewportHeight - 300); // Tối thiểu 600px, tối đa là viewport height - 300px
        setDimensions({ width, height: calculatedHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch data when selectedIndex changes
  useEffect(() => {
    fetchTreemapData(selectedIndex);
  }, [selectedIndex]);

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
      
      // Chỉ hiển thị text nếu ô đủ lớn
      if (cellWidth < 50 || cellHeight < 35) return;

      const centerX = cellWidth / 2;
      const centerY = cellHeight / 2;
      
      // Tên cổ phiếu
      cell.append("text")
        .attr("x", centerX)
        .attr("y", centerY - 10)
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("font-size", cellWidth < 70 ? "11px" : "13px")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text((d: any) => d.data.name);
      
      // Giá trị cổ phiếu ở dưới tên
      cell.append("text")
        .attr("x", centerX)
        .attr("y", centerY + 10)
        .attr("fill", "#fff")
        .attr("font-size", cellWidth < 70 ? "9px" : "11px")
        .attr("text-anchor", "middle")
        .text((d: any) => {
          // Chia cho 1 tỷ và format số
          const valueInBillions = d.data.value / 1000000000;
          const formattedValue = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }).format(valueInBillions);
          return `${formattedValue} tỷ`;
        });
    });
  }, [dimensions, treemapData]);

  return (
    <div className="stock-treemap-container">
      <div className="stock-treemap-header">
        <h2 className="stock-treemap-title">Bản đồ thị trường</h2>
        <div className="stock-treemap-tabs">
          {MARKET_INDICES.map((index) => (
            <button
              key={index.id}
              className={`stock-treemap-tab ${selectedIndex === index.id ? 'active' : ''}`}
              onClick={() => handleIndexSelect(index.id)}
            >
              {index.name}
            </button>
          ))}
        </div>
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
