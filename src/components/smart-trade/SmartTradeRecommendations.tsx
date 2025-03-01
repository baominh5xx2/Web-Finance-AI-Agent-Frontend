import React, { useState } from 'react';
import { Box, Typography, Card, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavButton from './NavButton';

// Define interfaces
interface StockRecommendation {
  code: string;
  smartScore: number;
  recommendation: string;
  currentPrice: number;
  purchasePrice: number;
  purchaseDate: string;
  percentChange: number;
}

interface SmartTradeRecommendationsProps {
  recommendations: StockRecommendation[];
}

// Styled components
const RecommendationContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f7',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
}));

const StockCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2, 2, 1, 2),
  position: 'relative',
  overflow: 'visible',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  border: '1px solid #e0e0e0',
  backgroundColor: 'white',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
}));

const ScoreBadgeWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
}));

const ScoreLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: '#666',
  textTransform: 'uppercase',
  fontWeight: 500,
}));

const ScoreValue = styled(Box)<{ score: number }>(({ theme, score }) => ({
  backgroundColor: 
    score >= 70 ? '#FFB700' : 
    score >= 67 ? '#33CC33' : 
    score >= 60 ? '#33CC33' : 
    score >= 50 ? '#FF9900' : 
    '#FF3333',
  borderRadius: '4px',
  padding: '2px 8px',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  textAlign: 'center',
  minWidth: '30px',
  marginLeft: 'auto',
  marginRight: 0,
  display: 'inline-block',
}));

const RecommendationButton = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFF7E6',
  borderRadius: '20px',
  padding: theme.spacing(0.5, 2),
  textAlign: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
  fontWeight: 'bold',
  color: '#FF9500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  width: '90%',
  margin: '8px auto 16px auto',
}));

const StockLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: '#666',
  fontWeight: 400,
  marginBottom: '2px',
}));

const StockValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#333',
}));

const ChangePercentage = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#33CC33',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: '50%',
  padding: theme.spacing(0.7),
  backgroundColor: 'white',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}));

const Title = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ViewMore = styled(Typography)(({ theme }) => ({
  color: '#FF3333',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontWeight: 500,
}));

// Main component
const SmartTradeRecommendations: React.FC<SmartTradeRecommendationsProps> = ({ recommendations }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 4;
  const totalPages = Math.ceil(recommendations.length / cardsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const displayedRecommendations = recommendations.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  return (
    <RecommendationContainer>
      <Title>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
          SMART TRADE - KHUYẾN NGHỊ ĐẦU TƯ
        </Typography>
        <ViewMore>Xem thêm</ViewMore>
      </Title>
      
      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <>
          {currentPage > 0 && (
            <NavButton direction="prev" onClick={handlePrevPage} />
          )}
          {currentPage < totalPages - 1 && (
            <NavButton direction="next" onClick={handleNextPage} />
          )}
        </>
      )}
      
      <Grid container spacing={2}>
        {displayedRecommendations.map((stock, index) => (
          <Grid item xs={12} sm={6} md={3} key={stock.code} className="recommendation-card">
            <StockCard>
              <ScoreBadgeWrapper>
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '24px' }}>
                  {stock.code}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <ScoreLabel>SMART SCORE</ScoreLabel>
                  <ScoreValue score={stock.smartScore}>{stock.smartScore}</ScoreValue>
                </Box>
              </ScoreBadgeWrapper>
              
              <RecommendationButton>
                <Box component="span" sx={{ mr: 1, color: '#FF9500' }}>•</Box>
                {stock.recommendation}
              </RecommendationButton>
              
              <Grid container spacing={0} sx={{ mb: 1.5 }}>
                <Grid item xs={6}>
                  <StockLabel>Lãi/lỗ</StockLabel>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.2 }}>
                    <ChangePercentage>
                      {stock.percentChange.toFixed(1)}%
                    </ChangePercentage>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <StockLabel>Điểm mua:</StockLabel>
                  <StockValue>{stock.purchasePrice.toFixed(2)}</StockValue>
                  <StockLabel sx={{ mt: 0.5 }}>Ngày mua:</StockLabel>
                  <StockValue>{stock.purchaseDate}</StockValue>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pb: 0.5 }}>
                <ActionButton aria-label="Add to cart" size="small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="#FF5555"/>
                  </svg>
                </ActionButton>
                <ActionButton aria-label="Add to watchlist" size="small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#33CC33"/>
                  </svg>
                </ActionButton>
                <ActionButton aria-label="View details" size="small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#FFB700"/>
                  </svg>
                </ActionButton>
              </Box>
            </StockCard>
          </Grid>
        ))}
      </Grid>
    </RecommendationContainer>
  );
};

export default SmartTradeRecommendations;
