'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './StockTreeMap.css';

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

const fakeData: TreemapData = {
  name: "Thị trường chứng khoán Việt Nam",
  children: [
    {
      name: "VN30",
      color: "#FF4136",
      children: [
        { name: "VCB", value: 194, change: -1.2, color: "#FF4136" },
        { name: "FPT", value: 655.8, change: -0.4, color: "#FF4136" },
        { name: "TCB", value: 319.7, change: -1.1, color: "#FF4136" },
        { name: "HPG", value: 681.1, change: -0.8, color: "#FF4136" },
        { name: "VHM", value: 344.8, change: 1.1, color: "#2ECC40" },
      ]
    },
    {
      name: "VN100",
      color: "#FFDC00",
      children: [
        { name: "BID", value: 124.6, change: 0.7, color: "#FFDC00" },
        { name: "CTG", value: 228.1, change: 0.5, color: "#FFDC00" },
        { name: "GAS", value: 53.8, change: 0.3, color: "#FFDC00" },
        { name: "VNM", value: 261.8, change: 0.6, color: "#FFDC00" },
        { name: "VPB", value: 177.9, change: 0.2, color: "#FFDC00" },
      ]
    },
    {
      name: "Cổ phiếu ngành Ngân hàng",
      color: "#FF4136",
      children: [
        { name: "MBB", value: 254.3, change: -1.5, color: "#FF4136" },
        { name: "ACB", value: 142, change: -0.9, color: "#FF4136" },
        { name: "LPB", value: 108.4, change: -1.3, color: "#FF4136" },
        { name: "HDB", value: 233, change: -0.7, color: "#FF4136" },
      ]
    },
    {
      name: "Cổ phiếu ngành Bất động sản",
      color: "#2ECC40",
      children: [
        { name: "VIC", value: 114.1, change: 1.8, color: "#2ECC40" },
        { name: "GVR", value: 214.7, change: 2.1, color: "#2ECC40" },
        { name: "NVL", value: 168.3, change: 1.5, color: "#2ECC40" },
        { name: "DIG", value: 43.8, change: 2.2, color: "#2ECC40" },
        { name: "IDC", value: 87.4, change: 1.9, color: "#2ECC40" },
      ]
    },
    {
      name: "Cổ phiếu ngành Chứng khoán",
      color: "#FF4136",
      children: [
        { name: "SSI", value: 109.4, change: -1.8, color: "#FF4136" },
        { name: "VCI", value: 53, change: -0.6, color: "#FF4136" },
        { name: "HCM", value: 48, change: -1.4, color: "#FF4136" },
      ]
    },
    {
      name: "Cổ phiếu tăng mạnh",
      color: "#2ECC40",
      children: [
        { name: "MSN", value: 266.2, change: 2.8, color: "#2ECC40" },
        { name: "MWG", value: 307.2, change: 3.1, color: "#2ECC40" },
        { name: "BSR", value: 108.6, change: 2.4, color: "#2ECC40" },
        { name: "VIB", value: 265.8, change: 1.9, color: "#2ECC40" },
      ]
    },
    {
      name: "Cổ phiếu giảm mạnh",
      color: "#FF4136",
      children: [
        { name: "BCM", value: 31.6, change: -3.2, color: "#FF4136" },
        { name: "STB", value: 215, change: -2.7, color: "#FF4136" },
        { name: "HVN", value: 31.9, change: -4.1, color: "#FF4136" },
        { name: "TPB", value: 34.2, change: -3.8, color: "#FF4136" },
      ]
    },
  ]
};

// Tính toán thống kê
const stats = {
  increasedStocks: 191,  // Số cổ phiếu tăng
  decreasedStocks: 262,  // Số cổ phiếu giảm
  unchangedStocks: 133,  // Số cổ phiếu đứng giá
  ceilingStocks: 3,      // Số cổ phiếu tăng trần
  floorStocks: 2         // Số cổ phiếu giảm sàn
};

export default function StockTreeMap({ width = '100%', height = 800 }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

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

  useEffect(() => {
    if (!svgRef.current) return;
    
    // Xóa nội dung cũ
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // Tạo root hierarchy
    const root = d3.hierarchy<TreemapData>(fakeData)
      .sum((d: TreemapData | StockData) => {
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
        const children = (d.data as StockGroup).children;
        if (children && children.length > 0) {
          return children[0].color;
        }
        return "#eee";
      })
      .attr("fill-opacity", 0.3)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5);

    // Thêm nhãn cho các nhóm
    cells
      .filter((d: TreemapNode) => d.depth === 1)
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text((d: TreemapNode) => (d.data as StockGroup).name);

    // Vẽ các ô cho leaf nodes (cổ phiếu)
    cells
      .filter((d: TreemapNode) => d.depth > 1)
      .append("rect")
      .attr("width", (d: TreemapNode) => d.x1 - d.x0)
      .attr("height", (d: TreemapNode) => d.y1 - d.y0)
      .attr("fill", (d: TreemapNode) => {
        const change = (d.data as StockData).change;
        return change >= 0 ? "#00C957" : "#FF4500";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    // Thêm tên và giá trị cho các cổ phiếu
    const stockCells = cells.filter((d: TreemapNode) => d.depth > 1);
    
    // Kiểm tra kích thước ô để quyết định cách hiển thị chữ
    stockCells.each(function(d: TreemapNode) {
      const cellWidth = d.x1 - d.x0;
      const cellHeight = d.y1 - d.y0;
      const cell = d3.select(this);
      
      // Tên cổ phiếu ở chính giữa
      cell
        .append("text")
        .attr("x", cellWidth / 2)
        .attr("y", cellHeight / 2 - 8) // Dịch lên trên một chút
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("font-size", cellWidth < 60 ? "10px" : "14px")
        .text((d: TreemapNode) => (d.data as StockData).name);
      
      // Giá trị cổ phiếu ở dưới tên
      cell
        .append("text")
        .attr("x", cellWidth / 2)
        .attr("y", cellHeight / 2 + 12) // Dịch xuống dưới một chút
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#000")
        .attr("font-size", cellWidth < 60 ? "8px" : "12px")
        .text((d: TreemapNode) => `${(d.data as StockData).value} tỷ`);
    });

    // Thanh thống kê ở dưới
    const statsHeight = 30;
    const statsBar = svg
      .append("g")
      .attr("transform", `translate(0, ${dimensions.height - statsHeight})`);

    // Tính toán tổng số cổ phiếu
    const totalStocks = stats.increasedStocks + stats.decreasedStocks + stats.unchangedStocks;
    
    // Tính toán tỷ lệ phần trăm
    const increaseRatio = stats.increasedStocks / totalStocks;
    const decreaseRatio = stats.decreasedStocks / totalStocks;
    const unchangedRatio = stats.unchangedStocks / totalStocks;
    const ceilingRatio = stats.ceilingStocks / totalStocks;
    const floorRatio = stats.floorStocks / totalStocks;

    // Vẽ các thanh thống kê
    let currentX = 0;
    
    // Thanh cổ phiếu tăng trần
    statsBar
      .append("rect")
      .attr("x", currentX)
      .attr("y", 0)
      .attr("width", dimensions.width * (ceilingRatio * 0.8)) // Phóng to để dễ nhìn
      .attr("height", statsHeight)
      .attr("fill", "#B10DC9"); // Màu tím cho tăng trần

    statsBar
      .append("text")
      .attr("x", currentX + 10)
      .attr("y", statsHeight / 2 + 5)
      .attr("fill", "#000")
      .attr("font-size", "14px")
      .text(`Tăng trần: ${stats.ceilingStocks}`);

    currentX += dimensions.width * (ceilingRatio * 0.8);

    // Thanh cổ phiếu tăng
    statsBar
      .append("rect")
      .attr("x", currentX)
      .attr("y", 0)
      .attr("width", dimensions.width * increaseRatio)
      .attr("height", statsHeight)
      .attr("fill", "#2ECC40"); // Màu xanh lá

    statsBar
      .append("text")
      .attr("x", currentX + 10)
      .attr("y", statsHeight / 2 + 5)
      .attr("fill", "#000")
      .attr("font-size", "14px")
      .text(`Tăng giá: ${stats.increasedStocks}`);

    currentX += dimensions.width * increaseRatio;

    // Thanh cổ phiếu đứng giá
    statsBar
      .append("rect")
      .attr("x", currentX)
      .attr("y", 0)
      .attr("width", dimensions.width * unchangedRatio)
      .attr("height", statsHeight)
      .attr("fill", "#FFDC00"); // Màu vàng

    statsBar
      .append("text")
      .attr("x", currentX + 10)
      .attr("y", statsHeight / 2 + 5)
      .attr("fill", "#000")
      .attr("font-size", "14px")
      .text(`Tham chiếu: ${stats.unchangedStocks}`);

    currentX += dimensions.width * unchangedRatio;

    // Thanh cổ phiếu giảm
    statsBar
      .append("rect")
      .attr("x", currentX)
      .attr("y", 0)
      .attr("width", dimensions.width * decreaseRatio)
      .attr("height", statsHeight)
      .attr("fill", "#FF4136"); // Màu đỏ

    statsBar
      .append("text")
      .attr("x", currentX + 10)
      .attr("y", statsHeight / 2 + 5)
      .attr("fill", "#000")
      .attr("font-size", "14px")
      .text(`Giảm giá: ${stats.decreasedStocks}`);

    currentX += dimensions.width * decreaseRatio;

    // Thanh cổ phiếu giảm sàn
    statsBar
      .append("rect")
      .attr("x", currentX)
      .attr("y", 0)
      .attr("width", dimensions.width * (floorRatio * 0.8)) // Phóng to để dễ nhìn
      .attr("height", statsHeight)
      .attr("fill", "#0074D9"); // Màu xanh dương cho giảm sàn

    statsBar
      .append("text")
      .attr("x", currentX + 10)
      .attr("y", statsHeight / 2 + 5)
      .attr("fill", "#000")
      .attr("font-size", "14px")
      .text(`Giảm sàn: ${stats.floorStocks}`);

  }, [dimensions]);

  return (
    <div className="stock-treemap-container">
      <div className="stock-treemap-wrapper" ref={containerRef}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
