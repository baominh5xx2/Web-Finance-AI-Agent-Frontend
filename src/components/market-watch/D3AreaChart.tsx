import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3AreaChartProps {
  data: { time: string; value: number }[];
  width?: number;
  height?: number;
  isPositive?: boolean;
}

const D3AreaChart: React.FC<D3AreaChartProps> = ({
  data,
  width = 90,
  height = 50,
  isPositive = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length < 2 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 2, right: 2, bottom: 2, left: 2 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xValues = data.map(d => new Date(d.time));
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(xValues) as [Date, Date])
      .range([0, innerWidth]);

    const yValues = data.map(d => d.value);
    const yMin = d3.min(yValues) || 0;
    const yMax = d3.max(yValues) || 100;
    const yPadding = (yMax - yMin) * 0.03; // Reduced padding for a tighter fit

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([innerHeight, 0]);

    // Create a unique gradient ID for this chart
    const gradientId = `areaGradient-${Math.random().toString(36).substring(7)}`;

    // Define gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    // Set gradient colors based on positive/negative
    const primaryColor = isPositive ? '#22C55E' : '#EF4444';
    
    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.2);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', primaryColor)
      .attr('stop-opacity', 0.01);

    // Create line generator with curved line
    const line = d3
      .line<{ time: string; value: number }>()
      .x(d => xScale(new Date(d.time)))
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)); // Adjusted curve type for better match to image

    // Create area generator
    const area = d3
      .area<{ time: string; value: number }>()
      .x(d => xScale(new Date(d.time)))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)); // Match the curve to the line

    // Add the area path
    svg
      .append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    // Add the line path
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', primaryColor)
      .attr('stroke-width', 1.5)
      .attr('d', line);

  }, [data, width, height, isPositive]);

  return <svg ref={svgRef} className="d3-chart" />;
};

export default D3AreaChart; 