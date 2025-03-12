import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
// Import the service
import { getMarketIndicesAdjustedData, PriceDatePair } from '@/app/services/marketstatistics';

interface MarketStatisticsProps {
  indexData: {
    value: number;
    data: { time: string; value: number }[];
  };
  volumeData: {
    current: number;
    previous: number;
    data: { time: string; value: number }[];
  };
  statistics: {
    pe: number;
    marketCap: number;
    tradingValue: number;
    tradingVolume: number;
    high52w: number;
    low52w: number;
    ytdReturn: string;
    yearReturn: string;
  };
}

const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  return num.toLocaleString();
};

// Update interface to include currentSymbol prop
interface MarketIndexChartProps { 
  data: { time: string; value: number }[]; 
  value: number;
  currentSymbol: string; // Add current symbol prop
}

const MarketIndexChart: React.FC<MarketIndexChartProps> = ({ data, value, currentSymbol }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1D");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<PriceDatePair[]>([]);
  const [currentValue, setCurrentValue] = useState<number>(value);
  const [error, setError] = useState<string | null>(null);
  
  // Debug information
  useEffect(() => {
    console.log("Current symbol:", currentSymbol);
    console.log("Selected period:", selectedPeriod);
  }, [currentSymbol, selectedPeriod]);
  
  // Fetch data when period or symbol changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Convert symbol to uppercase if needed for API
        const symbol = currentSymbol.toUpperCase();
        console.log(`Fetching data for ${symbol} with period ${selectedPeriod}`);
        
        const result = await getMarketIndicesAdjustedData(symbol, selectedPeriod);
        console.log("API response:", result);
        
        if (result && result.data && result.data.length > 0) {
          console.log(`Got ${result.data.length} data points`);
          setChartData(result.data);
          // Update current value with the latest price
          setCurrentValue(result.data[result.data.length - 1].price);
        } else {
          console.warn("Empty or invalid data received from API");
          setError("Không có dữ liệu cho biểu đồ");
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch market indices data:", error);
        setError("Lỗi khi tải dữ liệu");
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedPeriod, currentSymbol]);

  // Update chart rendering to use new data format
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) {
      console.log("Skipping chart render: No SVG ref or empty chart data");
      return;
    }

    console.log("Rendering chart with", chartData.length, "data points");
    
    try {
      // Clear previous chart
      const svg = svgRef.current;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Set dimensions
      const margin = { top: 10, right: 10, bottom: 20, left: 30 };
      const width = svg.clientWidth - margin.left - margin.right;
      const height = 180 - margin.top - margin.bottom;

      // Create SVG
      const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

      // X scale
      const x = (i: number) => (i / (chartData.length - 1)) * width;

      // Y scale (with some padding)
      const prices = chartData.map(d => d.price);
      console.log("Price range:", Math.min(...prices), "to", Math.max(...prices));
      
      const minValue = Math.min(...prices);
      const maxValue = Math.max(...prices);
      const yPadding = (maxValue - minValue) * 0.1;
      const y = (v: number) => height - ((v - minValue + yPadding) / (maxValue + yPadding - minValue)) * height;

      // Create line generator
      const line = (d: PriceDatePair[]) => {
        let path = '';
        for (let i = 0; i < d.length; i++) {
          const p = d[i];
          if (i === 0) {
            path += `M${x(i)} ${y(p.price)}`;
          } else {
            path += ` L${x(i)} ${y(p.price)}`;
          }
        }
        return path;
      };

      // Add the line path
      const path = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
      path.setAttribute('d', line(chartData));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#2E7D32');
      path.setAttribute('stroke-width', '2');

      // Add vertical grid lines
      for (let i = 0; i < 4; i++) {
        const gridLine = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        gridLine.setAttribute('x1', `${x(i / 3)}`);
        gridLine.setAttribute('y1', '0');
        gridLine.setAttribute('x2', `${x(i / 3)}`);
        gridLine.setAttribute('y2', `${height}`);
        gridLine.setAttribute('stroke', '#e0e0e0');
        gridLine.setAttribute('stroke-dasharray', '3,3');
      }

      // Add horizontal grid lines
      for (let i = 0; i < 4; i++) {
        const gridLine = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        gridLine.setAttribute('x1', '0');
        gridLine.setAttribute('y1', `${height * (i / 3)}`);
        gridLine.setAttribute('x2', `${width}`);
        gridLine.setAttribute('y2', `${height * (i / 3)}`);
        gridLine.setAttribute('stroke', '#e0e0e0');
        gridLine.setAttribute('stroke-dasharray', '3,3');
      }
      
      console.log("Chart rendered successfully");
    } catch (err) {
      console.error("Error rendering chart:", err);
      setError("Lỗi khi vẽ biểu đồ");
    }

  }, [chartData]);

  // Handle period selection
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Chỉ số chứng khoán {currentSymbol}
      </Typography>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', height: 180, position: 'relative' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={30} />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Alert severity="error" sx={{ width: '90%' }}>{error}</Alert>
            </Box>
          ) : chartData.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Alert severity="info">Không có dữ liệu hiển thị</Alert>
            </Box>
          ) : (
            <svg ref={svgRef} width="100%" height="100%" />
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box 
              component="span" 
              sx={{ 
                mx: 1, 
                cursor: 'pointer', 
                fontWeight: selectedPeriod === '1D' ? 'bold' : 'normal',
                color: selectedPeriod === '1D' ? '#ff0000' : 'inherit'
              }}
              onClick={() => handlePeriodChange('1D')}
            >
              1D
            </Box>
            <Box 
              component="span" 
              sx={{ 
                mx: 1, 
                cursor: 'pointer',
                fontWeight: selectedPeriod === '3M' ? 'bold' : 'normal',
                color: selectedPeriod === '3M' ? '#ff0000' : 'inherit'
              }}
              onClick={() => handlePeriodChange('3M')}
            >
              3M
            </Box>
            <Box 
              component="span" 
              sx={{ 
                mx: 1, 
                cursor: 'pointer',
                fontWeight: selectedPeriod === '6M' ? 'bold' : 'normal',
                color: selectedPeriod === '6M' ? '#ff0000' : 'inherit'
              }}
              onClick={() => handlePeriodChange('6M')}
            >
              6M
            </Box>
            <Box 
              component="span" 
              sx={{ 
                mx: 1, 
                cursor: 'pointer',
                fontWeight: selectedPeriod === '1Y' ? 'bold' : 'normal',
                color: selectedPeriod === '1Y' ? '#ff0000' : 'inherit'
              }}
              onClick={() => handlePeriodChange('1Y')}
            >
              1Y
            </Box>
            <Box 
              component="span" 
              sx={{ 
                mx: 1, 
                cursor: 'pointer',
                fontWeight: selectedPeriod === '2Y' ? 'bold' : 'normal',
                color: selectedPeriod === '2Y' ? '#ff0000' : 'inherit'
              }}
              onClick={() => handlePeriodChange('2Y')}
            >
              2Y
            </Box>
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {currentValue.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const VolumeChart: React.FC<{ 
  data: { time: string; value: number }[]; 
  current: number;
  previous: number;
}> = ({ data, current, previous }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous chart
    const svg = svgRef.current;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Set dimensions
    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    const width = svg.clientWidth - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;

    // Create SVG
    const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const x = (i: number) => (i / (data.length - 1)) * width;

    // Y scale (volume)
    const maxValue = Math.max(...data.map(d => d.value));
    const y = (v: number) => height - (v / maxValue) * height;

    // Create area generator
    const area = (d: { time: string; value: number }[]) => {
      let path = '';
      for (let i = 0; i < d.length; i++) {
        const p = d[i];
        if (i === 0) {
          path += `M${x(i)} ${height}`;
        } else {
          path += ` L${x(i)} ${height}`;
        }
      }
      for (let i = d.length - 1; i >= 0; i--) {
        const p = d[i];
        path += ` L${x(i)} ${y(p.value)}`;
      }
      path += ' Z';
      return path;
    };

    // Add the area path
    const path = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    path.setAttribute('d', area(data));
    path.setAttribute('fill', '#1976D2');
    path.setAttribute('opacity', '0.8');

    // Add horizontal grid lines
    for (let i = 0; i < 4; i++) {
      const line = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${height * (i / 3)}`);
      line.setAttribute('x2', `${width}`);
      line.setAttribute('y2', `${height * (i / 3)}`);
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-dasharray', '3,3');
    }

    // Add GTGD label to chart
    const text = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    text.setAttribute('x', '5');
    text.setAttribute('y', '15');
    text.textContent = 'GTGD tỷ đồng';
    text.setAttribute('font-size', '10px');
    text.setAttribute('fill', '#666');

  }, [data]);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Thanh khoản thị trường
      </Typography>
      <Box sx={{ width: '100%', height: 180 }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </Box>
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" fontWeight="medium">
            GTGD hôm nay:
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatNumber(current)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            GTGD phiên trước:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatNumber(previous)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const MarketStats: React.FC<{
  statistics: MarketStatisticsProps['statistics']
}> = ({ statistics }) => {
  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Thống kê thị trường
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            P/E
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {statistics.pe.toFixed(1)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Vốn hóa (tỷ đồng)
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatNumber(statistics.marketCap)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Giá trị giao dịch (tỷ đồng)
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatNumber(statistics.tradingValue)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Khối lượng giao dịch (cp)
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {formatNumber(statistics.tradingVolume)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            52 Tuần cao nhất
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {statistics.high52w.toFixed(1)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            52 Tuần thấp nhất
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {statistics.low52w.toFixed(1)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Tỷ suất YTD
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {statistics.ytdReturn}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Tỷ suất 1 năm
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {statistics.yearReturn}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

// Update MarketStatistics component to pass currentSymbol
const MarketStatistics: React.FC<MarketStatisticsProps & { currentSymbol: string }> = ({
  indexData,
  volumeData,
  statistics,
  currentSymbol
}) => {
  return (
    <Grid item xs={12} md={4}>
        <MarketIndexChart data={indexData.data} value={indexData.value} currentSymbol={currentSymbol} />
    </Grid>
  );
};

export default MarketStatistics;
