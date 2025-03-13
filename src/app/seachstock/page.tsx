'use client'

import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  Typography, 
  CircularProgress, 
  Alert,
  Box,
  CardContent,
  InputAdornment,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChart from '../../components/candlestickchart/candlestickchart';
import { generateMockCandleData, generateVietnameseStockData } from '../services/mockDataService';
import './page.css';

interface StockInfo {
  name: string;
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

export default function SearchStock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: true,
    rsi: false,
    macd: false
  });

  // Load demo data on initial render
  useEffect(() => {
    const demoData = generateVietnameseStockData('HDB');
    setStockData(demoData.candleData);
    setStockInfo(demoData.stockInfo);
    setSearchTerm('HDB');
  }, []);

  const handleIndicatorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleIndicatorClose = () => {
    setAnchorEl(null);
  };

  const handleIndicatorChange = (indicator: keyof typeof indicators) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use mock data instead of API call
      const mockData = generateVietnameseStockData(searchTerm.toUpperCase());
      
      // Simulate network delay
      setTimeout(() => {
        setStockData(mockData.candleData);
        setStockInfo(mockData.stockInfo);
        setLoading(false);
      }, 800);

      // Real API call code (commented out)
      /*
      const response = await fetch(`/api/stocks?symbol=${searchTerm.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const data = await response.json();
      setStockData(data.candleData);
      setStockInfo(data.stockInfo);
      setLoading(false);
      */
    } catch (err) {
      setError('Error fetching stock data. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container className="search-page-container">
      <Box className="search-container">
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Market Search
        </Typography>
        
        <Box className="search-bar">
          <TextField
            placeholder="Enter stock symbol"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton 
                    onClick={handleSearch}
                    disabled={loading}
                    className="search-icon-button"
                    size="large"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            className="indicator-button"
            onClick={handleIndicatorClick}
            disabled={loading}
            startIcon={<ShowChartIcon />}
          >
            Indicators
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleIndicatorClose}
          >
            <MenuItem onClick={() => handleIndicatorChange('sma')}>
              <Checkbox checked={indicators.sma} />
              SMA
            </MenuItem>
            <MenuItem onClick={() => handleIndicatorChange('ema')}>
              <Checkbox checked={indicators.ema} />
              EMA
            </MenuItem>
            <MenuItem onClick={() => handleIndicatorChange('rsi')}>
              <Checkbox checked={indicators.rsi} />
              RSI
            </MenuItem>
            <MenuItem onClick={() => handleIndicatorChange('macd')}>
              <Checkbox checked={indicators.macd} />
              MACD
            </MenuItem>
          </Menu>
        </Box>
        
        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box className="loading-container">
            <CircularProgress size={40} />
            <Typography variant="body1">Loading stock data...</Typography>
          </Box>
        )}

        {stockInfo && (
          <Card className="stock-info-card">
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {stockInfo.name} ({stockInfo.symbol})
              </Typography>
              <Box className="stock-details">
                <Box className="stock-detail-item">
                  <Typography variant="subtitle2">Current Price:</Typography>
                  <Typography variant="body1">${stockInfo.currentPrice.toFixed(2)}</Typography>
                </Box>
                <Box className="stock-detail-item">
                  <Typography variant="subtitle2">Change:</Typography>
                  <Typography 
                    variant="body1" 
                    className={stockInfo.change >= 0 ? "positive-change" : "negative-change"}
                  >
                    {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
                  </Typography>
                </Box>
                <Box className="stock-detail-item">
                  <Typography variant="subtitle2">Market Cap:</Typography>
                  <Typography variant="body1">${(stockInfo.marketCap / 1000000000).toFixed(2)}B</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {stockData && stockData.length > 0 && (
          <Box className="chart-container">
            <CandlestickChart 
              data={stockData} 
              symbol={searchTerm.toUpperCase()} 
              indicators={indicators}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}

