'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './StockTreeMap.css';

// Interface for API response
interface ApiStockData {
  symbol: string;
  total_value: number;
  market_cap: number;
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
      
      // Transform API data to TreemapData format
      const transformedData = transformApiData(data.data, indexCode);
      setTreemapData(transformedData);
      
    } catch (err) {
      console.error('Error fetching treemap data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to TreemapData format
  const transformApiData = (apiData: ApiStockData[], indexCode: string): TreemapData => {
    // Group stocks by market cap size
    const largeCapStocks = apiData
      .filter(stock => stock.market_cap >= 10000) // 10,000 tỷ trở lên
      .slice(0, 15); // Lấy top 15 cổ phiếu vốn hóa lớn
      
    const midCapStocks = apiData
      .filter(stock => stock.market_cap >= 1000 && stock.market_cap < 10000) // 1,000 - 10,000 tỷ
      .slice(0, 15);
      
    const smallCapStocks = apiData
      .filter(stock => stock.market_cap < 1000) // Dưới 1,000 tỷ
      .slice(0, 15);
    
    // Create TreemapData
    return {
      name: `Thị trường ${MARKET_INDICES.find(i => i.id === indexCode)?.name || indexCode}`,
      children: [
        {
          name: "Vốn hóa lớn",
          color: "#4f46e5",
          children: largeCapStocks.map(stock => ({
            name: stock.symbol,
            value: stock.market_cap,
            change: 0, // Không có dữ liệu về change từ API
            color: "#4f46e5"
          }))
        },
        {
          name: "Vốn hóa trung bình",
          color: "#10b981",
          children: midCapStocks.map(stock => ({
            name: stock.symbol,
            value: stock.market_cap,
            change: 0,
            color: "#10b981"
          }))
        },
        {
          name: "Vốn hóa nhỏ",
          color: "#f59e0b",
          children: smallCapStocks.map(stock => ({
            name: stock.symbol,
            value: stock.market_cap,
            change: 0,
            color: "#f59e0b"
          }))
        }
      ]
    };
  };

  // Lấy kích thước thực của container
  useEffect(() => {
    if (!containerRef.current) return;

    // Tính toán kích thước thực tế của container
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: typeof width === 'number' ? width : containerWidth,
          height: typeof height === 'number' ? height : 800
        });
      }
    };

    // Cập nhật kích thước ban đầu
    updateDimensions();

    // Theo dõi thay đổi kích thước
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [width, height]);

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
        // Handle the different levels of the hierarchy
        if ('value' in d) {
          return (d as StockData).value;
        }
        return 0;
      });

    // Tạo treemap layout
    const treemapGenerator = d3.treemap<TreemapData>()
      .size([dimensions.width, dimensions.height - 30]) // Để lại không gian cho thanh thống kê bên dưới
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

    // Vẽ các group rectangles
    cells
      .filter((d: TreemapNode) => d.depth === 1)
      .append("rect")
      .attr("width", (d: TreemapNode) => d.x1 - d.x0)
      .attr("height", (d: TreemapNode) => d.y1 - d.y0)
      .attr("fill", (d: TreemapNode) => {
        // Lấy màu của nhóm dựa trên màu của cổ phiếu con đầu tiên
        const data = d.data as any;
        if (data && 'color' in data) {
          return data.color;
        }
        return "#eee";
      })
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5);

    // Tên nhóm
    cells
      .filter((d: TreemapNode) => d.depth === 1)
      .append("text")
      .attr("x", 5)
      .attr("y", 15)
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text((d: TreemapNode) => {
        const data = d.data as any;
        return data && 'name' in data ? data.name : '';
      });

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

    // Thêm text cho leaf nodes
    cells.filter((d: TreemapNode) => d.depth === 2).each(function(d: TreemapNode) {
      const cell = d3.select(this);
      const cellWidth = d.x1 - d.x0;
      const cellHeight = d.y1 - d.y0;
      
      // Chỉ hiển thị text nếu ô đủ lớn
      if (cellWidth < 30 || cellHeight < 20) return;
      
      // Tên cổ phiếu
      cell.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("font-size", cellWidth < 60 ? "10px" : "14px")
        .text((d: TreemapNode) => {
          const data = d.data as any;
          return data && 'name' in data ? data.name : '';
        });
      
      // Giá trị cổ phiếu ở dưới tên
      cell.append("text")
        .attr("x", 5)
        .attr("y", 30)
        .attr("fill", "#fff")
        .attr("font-size", cellWidth < 60 ? "8px" : "12px")
        .text((d: TreemapNode) => {
          const data = d.data as any;
          if (data && 'value' in data) {
            const value = Math.round(data.value * 10) / 10;
            return `${value} tỷ`;
          }
          return '';
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
