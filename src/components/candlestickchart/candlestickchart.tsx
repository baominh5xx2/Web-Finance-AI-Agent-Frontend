import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './candlestickchart.css';

interface CandlestickChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  symbol: string;
  indicators?: {
    sma: boolean;
    ema: boolean;
    rsi: boolean;
    macd: boolean;
  };
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, symbol, indicators = { sma: false, ema: true, rsi: false, macd: false } }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  // Calculate EMA function
  const calculateEMA = (data: any[], period: number) => {
    const k = 2 / (period + 1);
    let emaArray = [];
    let currentEMA = data[0].close;
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        emaArray.push({ time: data[i].time, value: currentEMA });
      } else {
        currentEMA = data[i].close * k + currentEMA * (1 - k);
        emaArray.push({ time: data[i].time, value: currentEMA });
      }
    }
    
    return emaArray;
  };

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.time))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([
        (d3.min(data, d => d.low) || 0) * 0.99,
        (d3.max(data, d => d.high) || 0) * 1.01
      ])
      .range([height, 0]);

    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % Math.ceil(data.length / 10) === 0)));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add the candlesticks
    svg.selectAll('.candle')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'wick')
      .attr('x1', d => {
        const xPos = x(d.time);
        return xPos !== undefined ? xPos + x.bandwidth() / 2 : 0;
      })
      .attr('x2', d => {
        const xPos = x(d.time);
        return xPos !== undefined ? xPos + x.bandwidth() / 2 : 0;
      })
      .attr('y1', d => y(d.high))
      .attr('y2', d => y(d.low))
      .attr('stroke', d => d.open > d.close ? '#ef5350' : '#26a69a')
      .attr('stroke-width', 1);

    svg.selectAll('.candle-body')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candle-body')
      .attr('x', d => {
        const xPos = x(d.time);
        return xPos !== undefined ? xPos : 0;
      })
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.open) - y(d.close)))
      .attr('fill', d => d.open > d.close ? '#ef5350' : '#26a69a');

    // Add volume bars at the bottom
    const volumeHeight = height * 0.2;
    const yVolume = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.close * 100) || 0])
      .range([height, height - volumeHeight]);

    svg.selectAll('.volume')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'volume')
      .attr('x', d => {
        const xPos = x(d.time);
        return xPos !== undefined ? xPos : 0;
      })
      .attr('y', d => yVolume(d.close * 100))
      .attr('width', x.bandwidth())
      .attr('height', d => height - yVolume(d.close * 100))
      .attr('fill', d => d.open > d.close ? 'rgba(239, 83, 80, 0.5)' : 'rgba(38, 166, 154, 0.5)');

    // Add EMA indicators if enabled
    if (indicators.ema) {
      // Calculate EMA 5
      const ema5Data = calculateEMA(data, 5);
      
      // Create a line generator for EMA 5
      const lineEMA5 = d3.line<{time: string, value: number}>()
        .x(d => {
          const xPos = x(d.time);
          return xPos !== undefined ? xPos + x.bandwidth() / 2 : 0;
        })
        .y(d => y(d.value));
      
      // Draw EMA 5 line
      svg.append('path')
        .datum(ema5Data)
        .attr('fill', 'none')
        .attr('stroke', '#ffeb3b') // Yellow color
        .attr('stroke-width', 1.5)
        .attr('d', lineEMA5);
      
      // Calculate EMA 20
      const ema20Data = calculateEMA(data, 20);
      
      // Create a line generator for EMA 20
      const lineEMA20 = d3.line<{time: string, value: number}>()
        .x(d => {
          const xPos = x(d.time);
          return xPos !== undefined ? xPos + x.bandwidth() / 2 : 0;
        })
        .y(d => y(d.value));
      
      // Draw EMA 20 line
      svg.append('path')
        .datum(ema20Data)
        .attr('fill', 'none')
        .attr('stroke', '#ff9800') // Orange color
        .attr('stroke-width', 1.5)
        .attr('d', lineEMA20);

      // Add legend for EMA lines
      svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('fill', '#ffeb3b')
        .attr('font-size', '12px')
        .text(`EMA 5 close 0: ${ema5Data[ema5Data.length - 1].value.toFixed(3)}`);

      svg.append('text')
        .attr('x', 10)
        .attr('y', 30)
        .attr('fill', '#ff9800')
        .attr('font-size', '12px')
        .text(`EMA 20 close 0: ${ema20Data[ema20Data.length - 1].value.toFixed(3)}`);
    }

    // Add title with symbol and price info
    svg.append('text')
      .attr('x', 10)
      .attr('y', -5)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(`${symbol} · 1D`);

    // Add current price information (O, H, L, C)
    const lastDataPoint = data[data.length - 1];
    svg.append('text')
      .attr('x', width - 350)
      .attr('y', -5)
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .text(`O${lastDataPoint.open.toFixed(3)} H${lastDataPoint.high.toFixed(3)} L${lastDataPoint.low.toFixed(3)} C${lastDataPoint.close.toFixed(3)}`);
      
    // Add the change and percentage
    const previousClose = data[data.length - 2]?.close || lastDataPoint.open;
    const change = lastDataPoint.close - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    svg.append('text')
      .attr('x', width - 150)
      .attr('y', -5)
      .attr('font-size', '12px')
      .attr('fill', change >= 0 ? '#26a69a' : '#ef5350')
      .text(`${change >= 0 ? '+' : ''}${change.toFixed(3)} (${changePercent.toFixed(2)}%)`);

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.2);

  }, [data, symbol, indicators]);

  return (
    <div className="candlestick-chart-container">
      <svg ref={chartRef} className="chart-inner" width="100%" height="100%" />
    </div>
  );
};

export default CandlestickChart;
