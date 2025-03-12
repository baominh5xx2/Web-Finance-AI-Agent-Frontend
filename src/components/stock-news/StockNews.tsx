'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, CircularProgress } from '@mui/material';
import './StockNews.css';
import { newsService, NewsItem as ApiNewsItem } from '@/app/services/news';

interface NewsItemUI {
  date: string;
  time: string;
  title: string;
  symbol?: string;
}

interface StockNewsProps {
  symbol?: string; // Optional symbol prop to fetch news for a specific stock
  newsItems?: NewsItemUI[]; // Optional pre-loaded news items
}

const NewsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
  padding: '16px',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const NewsTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#333',
}));

const NewsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: '8px 0',
  borderBottom: '1px solid #eaeaea',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NewsDate = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginRight: '12px',
  alignItems: 'center',
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#666',
  fontWeight: 500,
}));

const TimeText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#666',
}));

const NewsTitleText = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: '#333',
  fontWeight: 500,
  lineHeight: 1.4,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    color: '#2176FF',
  },
}));

const StockNews: React.FC<StockNewsProps> = ({ symbol, newsItems: initialNewsItems }) => {
  const [newsItems, setNewsItems] = useState<NewsItemUI[]>(initialNewsItems || []);
  const [loading, setLoading] = useState<boolean>(!initialNewsItems);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        let data;
        
        console.log('StockNews: Starting to fetch news data', { symbol });
        
        if (symbol) {
          // Fetch news for specific symbol
          console.log(`Fetching news for symbol: ${symbol}`);
          const response = await newsService.getStockNews(symbol);
          console.log('Got symbol news response:', response);
          data = response.news;
        } else {
          // Fetch top news if no symbol provided
          console.log('Fetching top news');
          const response = await newsService.getTopNews();
          console.log('Got top news response:', response);
          data = response.news;
        }
        
        console.log('News data before transform:', data);
        
        if (!data || data.length === 0) {
          console.warn('Received empty news data');
          setNewsItems([]);
          setError('No news available');
          setLoading(false);
          return;
        }
        
        // Transform API data format to component format
        const transformedNews = data.map((item: ApiNewsItem) => {
          console.log('Processing news item:', item);
          
          // Parse publish_date to get date and time
          const [datePart = '', timePart = ''] = (item.publish_date || '').split(' ');
          
          // Format date to DD/MM/YYYY if needed
          let formattedDate = datePart;
          try {
            const dateObj = new Date(datePart);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            }
          } catch (e) {
            console.error('Error parsing date:', datePart, e);
          }
          
          return {
            date: formattedDate,
            time: timePart || '',
            title: item.title || 'No title',
            symbol: item.symbol
          };
        });
        
        console.log('Transformed news data:', transformedNews);
        setNewsItems(transformedNews);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    if (!initialNewsItems) {
      fetchNews();
    }
  }, [symbol, initialNewsItems]);

  return (
    <NewsContainer>
      <NewsTitle>Tin tức chứng khoán</NewsTitle>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <Box className="news-list">
          {newsItems.length > 0 ? (
            newsItems.map((item, index) => (
              <NewsItem key={index}>
                <NewsDate>
                  <Box className="date-icon">
                    <DateText>{item.date}</DateText>
                  </Box>
                  <TimeText>{item.time}</TimeText>
                </NewsDate>
                <NewsTitleText title={item.title}>
                  {item.title}
                </NewsTitleText>
              </NewsItem>
            ))
          ) : (
            <Typography align="center" sx={{ py: 2 }}>
              Không có tin tức nào
            </Typography>
          )}
        </Box>
      )}
    </NewsContainer>
  );
};

export default StockNews;
