'use client';

import React, { useRef } from 'react';
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

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  data: { time: number; value: number; }[];
}

const indices: IndexData[] = [
  {
    name: 'VN-Index',
    value: 1205.3,
    change: -2.46,
    changePercent: -0.19,
    data: [
      { time: 0, value: 1213.4 },
      { time: 1, value: 1214.9 },
      { time: 2, value: 1217.3 },
      { time: 3, value: 1220.8 },
      { time: 4, value: 1224.1 },
      { time: 5, value: 1227.6 },
      { time: 6, value: 1225.2 },
      { time: 7, value: 1229.7 },
      { time: 8, value: 1231.5 },
      { time: 9, value: 1228.3 },
      { time: 10, value: 1225.9 },
      { time: 11, value: 1221.4 },
      { time: 12, value: 1219.8 },
      { time: 13, value: 1216.2 },
      { time: 14, value: 1214.7 },
      { time: 15, value: 1212.9 },
      { time: 16, value: 1216.3 },
      { time: 17, value: 1214.1 },
      { time: 18, value: 1209.7 },
      { time: 19, value: 1211.2 },
      { time: 20, value: 1208.6 },
      { time: 21, value: 1205.8 },
      { time: 22, value: 1204.2 },
      { time: 23, value: 1206.9 },
      { time: 24, value: 1210.5 },
      { time: 25, value: 1208.7 },
      { time: 26, value: 1204.3 },
      { time: 27, value: 1207.8 },
      { time: 28, value: 1204.5 },
      { time: 29, value: 1205.3 }
    ]
  },
  {
    name: 'HNX',
    value: 239.2,
    change: -0.2,
    changePercent: -0.08,
    data: [
      { time: 0, value: 238.7 },
      { time: 1, value: 239.5 },
      { time: 2, value: 240.8 },
      { time: 3, value: 242.1 },
      { time: 4, value: 243.3 },
      { time: 5, value: 245.1 },
      { time: 6, value: 244.7 },
      { time: 7, value: 246.2 },
      { time: 8, value: 245.8 },
      { time: 9, value: 244.3 },
      { time: 10, value: 243.9 },
      { time: 11, value: 242.5 },
      { time: 12, value: 244.8 },
      { time: 13, value: 246.1 },
      { time: 14, value: 245.6 },
      { time: 15, value: 243.2 },
      { time: 16, value: 241.9 },
      { time: 17, value: 240.7 },
      { time: 18, value: 242.5 },
      { time: 19, value: 241.3 },
      { time: 20, value: 240.8 },
      { time: 21, value: 238.4 },
      { time: 22, value: 237.9 },
      { time: 23, value: 236.8 },
      { time: 24, value: 238.2 },
      { time: 25, value: 237.5 },
      { time: 26, value: 238.7 },
      { time: 27, value: 240.1 },
      { time: 28, value: 238.9 },
      { time: 29, value: 239.2 }
    ]
  },
  {
    name: 'UPCOM',
    value: 99.4,
    change: -0.24,
    changePercent: -0.24,
    data: [
      { time: 0, value: 99.8 },
      { time: 1, value: 100.3 },
      { time: 2, value: 101.1 },
      { time: 3, value: 100.7 },
      { time: 4, value: 101.4 },
      { time: 5, value: 102.3 },
      { time: 6, value: 103.1 },
      { time: 7, value: 102.8 },
      { time: 8, value: 103.5 },
      { time: 9, value: 102.9 },
      { time: 10, value: 102.3 },
      { time: 11, value: 101.8 },
      { time: 12, value: 101.2 },
      { time: 13, value: 100.5 },
      { time: 14, value: 99.8 },
      { time: 15, value: 100.2 },
      { time: 16, value: 99.6 },
      { time: 17, value: 98.9 },
      { time: 18, value: 98.3 },
      { time: 19, value: 97.7 },
      { time: 20, value: 97.1 },
      { time: 21, value: 97.9 },
      { time: 22, value: 98.4 },
      { time: 23, value: 99.1 },
      { time: 24, value: 98.7 },
      { time: 25, value: 98.3 },
      { time: 26, value: 99.0 },
      { time: 27, value: 99.5 },
      { time: 28, value: 99.2 },
      { time: 29, value: 99.4 }
    ]
  },
  {
    name: 'VN30',
    value: 1256.4,
    change: -7.19,
    changePercent: -0.54,
    data: [
      { time: 0, value: 1262.8 },
      { time: 1, value: 1264.5 },
      { time: 2, value: 1267.3 },
      { time: 3, value: 1269.8 },
      { time: 4, value: 1272.5 },
      { time: 5, value: 1275.7 },
      { time: 6, value: 1273.6 },
      { time: 7, value: 1276.2 },
      { time: 8, value: 1274.9 },
      { time: 9, value: 1271.4 },
      { time: 10, value: 1269.2 },
      { time: 11, value: 1265.8 },
      { time: 12, value: 1263.1 },
      { time: 13, value: 1266.9 },
      { time: 14, value: 1263.5 },
      { time: 15, value: 1261.7 },
      { time: 16, value: 1259.2 },
      { time: 17, value: 1257.8 },
      { time: 18, value: 1255.3 },
      { time: 19, value: 1253.9 },
      { time: 20, value: 1251.2 },
      { time: 21, value: 1247.8 },
      { time: 22, value: 1245.3 },
      { time: 23, value: 1248.7 },
      { time: 24, value: 1252.1 },
      { time: 25, value: 1254.6 },
      { time: 26, value: 1253.2 },
      { time: 27, value: 1255.8 },
      { time: 28, value: 1254.3 },
      { time: 29, value: 1256.4 }
    ]
  },
  {
    name: 'HNX30',
    value: 501.2,
    change: 1.19,
    changePercent: 0.22,
    data: [
      { time: 0, value: 495.7 },
      { time: 1, value: 496.3 },
      { time: 2, value: 494.8 },
      { time: 3, value: 493.2 },
      { time: 4, value: 495.1 },
      { time: 5, value: 497.4 },
      { time: 6, value: 498.9 },
      { time: 7, value: 501.2 },
      { time: 8, value: 500.8 },
      { time: 9, value: 502.3 },
      { time: 10, value: 500.7 },
      { time: 11, value: 498.5 },
      { time: 12, value: 497.9 },
      { time: 13, value: 496.4 },
      { time: 14, value: 494.8 },
      { time: 15, value: 493.5 },
      { time: 16, value: 495.2 },
      { time: 17, value: 497.8 },
      { time: 18, value: 496.9 },
      { time: 19, value: 498.3 },
      { time: 20, value: 497.5 },
      { time: 21, value: 499.2 },
      { time: 22, value: 500.7 },
      { time: 23, value: 499.8 },
      { time: 24, value: 498.6 },
      { time: 25, value: 499.3 },
      { time: 26, value: 500.2 },
      { time: 27, value: 501.7 },
      { time: 28, value: 500.5 },
      { time: 29, value: 501.2 }
    ]
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
  // Tạo ref để tham chiếu đến container scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tính giá trị baseline cho mỗi chỉ số và xác định các điểm cao/thấp
  const indicesWithBaseline = indices.map(index => {
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

  return (
    <div className="market-indices-container" style={{ height: 'fit-content', maxHeight: '500px' }}>
      {/* Nút cuộn sang trái */}
      <button 
        className="scroll-button left" 
        onClick={handleScrollLeft}
        aria-label="Cuộn sang trái"
      >
        <i className="arrow left"></i>
      </button>

      {/* Container chứa các thẻ có thể cuộn */}
      <div className="market-indices-scroll" ref={scrollContainerRef}>
        {indicesWithBaseline.map((index, i) => (
          <div key={index.name} className="market-index-card">
            <div className="market-index-content">
              <div className="market-index-info">
                <h3 className="market-index-name">{index.name}</h3>
                <div className={`market-index-value ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  {index.value.toFixed(1)}
                </div>
                <div className={`market-index-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change-arrow">{index.change >= 0 ? '▲' : '▼'}</span>
                  {Math.abs(index.change).toFixed(1)}({Math.abs(index.changePercent).toFixed(2)}%)
                </div>
              </div>
              <div className="market-index-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={index.data} 
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`colorUv${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={index.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={index.change >= 0 ? "#22C55E" : "#EF4444"} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']} 
                      hide={true}
                    />
                    
                    {/* Đường tham chiếu ở giá trị trung bình */}
                    <ReferenceLine 
                      y={index.baseline} 
                      stroke="#B8C2CC" 
                      strokeDasharray="3 3" 
                      strokeWidth={1.5}
                    />
                    
                    {/* Biểu đồ đường chính */}
                    <Area 
                      type="linear" 
                      dataKey="value" 
                      stroke={index.change >= 0 ? "#22C55E" : "#EF4444"} 
                      fillOpacity={1}
                      fill={`url(#colorUv${i})`}
                      strokeWidth={2.5}
                      connectNulls
                      isAnimationActive={false}
                      activeDot={{
                        r: 4,
                        fill: 'white',
                        stroke: index.change >= 0 ? "#22C55E" : "#EF4444",
                        strokeWidth: 2
                      }}
                    />
                    
                    {/* Điểm đánh dấu giá trị cao nhất */}
                    <ReferenceDot
                      x={index.highPointIndex}
                      y={index.highPoint}
                      r={4}
                      fill="white"
                      stroke={index.change >= 0 ? "#22C55E" : "#EF4444"}
                      strokeWidth={2}
                    />
                    
                    {/* Điểm đánh dấu giá trị thấp nhất */}
                    <ReferenceDot
                      x={index.lowPointIndex}
                      y={index.lowPoint}
                      r={4}
                      fill="white"
                      stroke={index.change >= 0 ? "#22C55E" : "#EF4444"}
                      strokeWidth={2}
                    />
                    
                    {/* Hiển thị tooltip khi hover */}
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}`, 'Giá trị']}
                      labelFormatter={() => ''}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        padding: '8px',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{
                        color: index.change >= 0 ? "#22C55E" : "#EF4444",
                        padding: 0
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút cuộn sang phải */}
      <button 
        className="scroll-button right" 
        onClick={handleScrollRight}
        aria-label="Cuộn sang phải"
      >
        <i className="arrow right"></i>
      </button>
    </div>
  );
}
