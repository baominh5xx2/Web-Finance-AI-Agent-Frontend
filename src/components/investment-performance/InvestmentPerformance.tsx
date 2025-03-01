'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import * as d3 from 'd3';
import './InvestmentPerformance.css';

interface DataPoint {
  date: Date;
  portfolioValue: number;
  vn30Value: number;
}

interface InvestmentPerformanceProps {
  width?: string | number;
  height?: number;
}

const ChartContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
  padding: '16px',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#333',
}));

const TimeFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
}));

const TimeFilterButton = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: '0.875rem',
  padding: '4px 8px',
  cursor: 'pointer',
  borderRadius: '4px',
  backgroundColor: active ? '#f0f0f0' : 'transparent',
  fontWeight: active ? 600 : 400,
  color: active ? '#2176FF' : '#666',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const ComparisonSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  gap: '8px',
}));

const SelectLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#666',
}));

const CustomSelect = styled('select')(({ theme }) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: 'white',
  fontSize: '0.875rem',
  cursor: 'pointer',
  '&:focus': {
    outline: 'none',
    border: '1px solid #2176FF',
  },
}));

// Generate dummy data
const generateData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 6);

  // Start values
  let portfolioValue = 0;
  let vn30Value = 0;

  // Generate points for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 5)) {
    // Random fluctuations between -3% and +3%
    const portfolioChange = (Math.random() * 6 - 3) / 100;
    const vn30Change = (Math.random() * 6 - 2) / 100;

    if (data.length === 0) {
      // Initialize first data point
      portfolioValue = 0;
      vn30Value = 0;
    } else {
      // Apply changes
      portfolioValue += portfolioChange * 3;
      vn30Value += vn30Change * 3;
    }

    // Add to data array
    data.push({
      date: new Date(d),
      portfolioValue,
      vn30Value,
    });
  }

  return data;
};

const InvestmentPerformance: React.FC<InvestmentPerformanceProps> = ({ width = '100%', height = 400 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<string>('YTD');
  const [comparisonIndex, setComparisonIndex] = useState<string>('VN30');
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

  // Initialize data
  useEffect(() => {
    setData(generateData());
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: 300
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Create/update chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create root group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    // Y scale (percentage)
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.portfolioValue, d.vn30Value)) as number * 1.1,
        d3.max(data, d => Math.max(d.portfolioValue, d.vn30Value)) as number * 1.1
      ])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%d/%m/%Y') as any))
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d.toFixed(0)}%`))
      .selectAll('text')
      .style('font-size', '10px');

    // Add horizontal gridlines
    svg.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', '#e0e0e0')
      .style('stroke-opacity', 0.7);

    // Line generator for portfolio performance
    const portfolioLine = d3.line<DataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.portfolioValue))
      .curve(d3.curveMonotoneX);

    // Line generator for VN30 index
    const vn30Line = d3.line<DataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.vn30Value))
      .curve(d3.curveMonotoneX);

    // Add VN30 line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#FF4560')
      .attr('stroke-width', 2)
      .attr('d', vn30Line)
      .attr('class', 'vn30-line');

    // Add portfolio line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#A020F0')
      .attr('stroke-width', 2)
      .attr('d', portfolioLine)
      .attr('class', 'portfolio-line');

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, 0)`);

    // Portfolio legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#A020F0');

    legend.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text('Danh mục Thần trọng')
      .style('font-size', '10px')
      .style('fill', '#333');

    // VN30 legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#FF4560');

    legend.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .text('VN30')
      .style('font-size', '10px')
      .style('fill', '#333');

  }, [data, dimensions]);

  return (
    <ChartContainer>
      <ChartTitle>Hiệu quả đầu tư</ChartTitle>
      <TimeFilterContainer>
        <TimeFilterButton 
          active={activeTimeFilter === '1M'} 
          onClick={() => setActiveTimeFilter('1M')}
        >
          1M
        </TimeFilterButton>
        <TimeFilterButton 
          active={activeTimeFilter === '3M'} 
          onClick={() => setActiveTimeFilter('3M')}
        >
          3M
        </TimeFilterButton>
        <TimeFilterButton 
          active={activeTimeFilter === '6M'} 
          onClick={() => setActiveTimeFilter('6M')}
        >
          6M
        </TimeFilterButton>
        <TimeFilterButton 
          active={activeTimeFilter === 'YTD'} 
          onClick={() => setActiveTimeFilter('YTD')}
        >
          YTD
        </TimeFilterButton>
        <TimeFilterButton 
          active={activeTimeFilter === '1Y'} 
          onClick={() => setActiveTimeFilter('1Y')}
        >
          1Y
        </TimeFilterButton>
      </TimeFilterContainer>
      <ComparisonSelector>
        <SelectLabel>So sánh với:</SelectLabel>
        <CustomSelect 
          value={comparisonIndex}
          onChange={(e) => setComparisonIndex(e.target.value)}
        >
          <option value="VN30">VN30</option>
          <option value="VN-Index">VN-Index</option>
          <option value="HNX-Index">HNX-Index</option>
        </CustomSelect>
      </ComparisonSelector>
      <Box ref={containerRef} className="chart-wrapper">
        <svg ref={svgRef}></svg>
      </Box>
    </ChartContainer>
  );
};

export default InvestmentPerformance;
