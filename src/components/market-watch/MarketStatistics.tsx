import React from 'react';
import {
  Card,
  Grid,
  Typography,
  Box
} from '@mui/material';

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

const MarketIndexChart: React.FC<{ data: { time: string; value: number }[]; value: number }> = ({ data, value }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

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
    const x = (i: number) => (i / (data.length - 1)) * width;

    // Y scale (with some padding)
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const yPadding = (maxValue - minValue) * 0.1;
    const y = (v: number) => height - ((v - minValue + yPadding) / (maxValue + yPadding - minValue)) * height;

    // Create line generator
    const line = (d: { time: string; value: number }[]) => {
      let path = '';
      for (let i = 0; i < d.length; i++) {
        const p = d[i];
        if (i === 0) {
          path += `M${x(i)} ${y(p.value)}`;
        } else {
          path += ` L${x(i)} ${y(p.value)}`;
        }
      }
      return path;
    };

    // Add the line path
    const path = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    path.setAttribute('d', line(data));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#2E7D32');
    path.setAttribute('stroke-width', '2');

    // Add vertical grid lines
    for (let i = 0; i < 4; i++) {
      const line = g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
      line.setAttribute('x1', `${x(i / 3)}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${x(i / 3)}`);
      line.setAttribute('y2', `${height}`);
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-dasharray', '3,3');
    }

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

  }, [data]);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Chỉ số chứng khoán
      </Typography>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', height: 180 }}>
          <svg ref={svgRef} width="100%" height="100%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer', fontWeight: 'bold', color: '#ff0000' }}>1D</Box>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer' }}>3M</Box>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer' }}>6M</Box>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer' }}>YTD</Box>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer' }}>1Y</Box>
            <Box component="span" sx={{ mx: 1, cursor: 'pointer' }}>2Y</Box>
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {value.toFixed(2)}
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

const MarketStatistics: React.FC<MarketStatisticsProps> = ({
  indexData,
  volumeData,
  statistics,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <MarketIndexChart data={indexData.data} value={indexData.value} />
      </Grid>
      <Grid item xs={12} md={4}>
        <VolumeChart 
          data={volumeData.data} 
          current={volumeData.current} 
          previous={volumeData.previous} 
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MarketStats statistics={statistics} />
      </Grid>
    </Grid>
  );
};

export default MarketStatistics;
