'use client';

import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import './StockNews.css';

interface NewsItem {
  date: string;
  time: string;
  title: string;
}

interface StockNewsProps {
  newsItems: NewsItem[];
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

// Mẫu tin tức
const dummyNewsItems: NewsItem[] = [
  {
    date: '27/02/2025',
    time: '14:26',
    title: 'VCB: Nghị quyết HĐQT về việc phê duyệt chủ trương thay đổi phương án phân phối lợi nhuận năm 2024'
  },
  {
    date: '27/02/2025',
    time: '14:19',
    title: 'VCB: HĐQT phê duyệt chủ trương thực hiện mua bán nợ với VAMC'
  },
  {
    date: '27/02/2025',
    time: '14:19',
    title: 'VCB: HĐQT phê duyệt chủ trương thực hiện giao dịch ủy thác chỉ định đầu tư với VCBF'
  },
  {
    date: '26/02/2025',
    time: '17:43',
    title: 'VCB: Nghị quyết HĐQT về ngày ĐKCC phát hành cổ phiếu để tăng vốn từ nguồn vốn chủ sở hữu'
  },
  {
    date: '26/02/2025',
    time: '17:42',
    title: 'VCB: Thông báo phát hành cổ phiếu để trả cổ tức'
  },
  {
    date: '26/02/2025',
    time: '17:29',
    title: 'PLX: Nghị quyết HĐQT về việc giải thể Văn phòng đại diện tại Lào'
  },
  {
    date: '26/02/2025',
    time: '11:02',
    title: 'Tỷ lệ LDR tăng và áp lực thanh khoản hệ thống ngân hàng'
  },
  {
    date: '25/02/2025',
    time: '17:17',
    title: 'Khu đô thị Trảng Cát của KBC tăng vốn lên hơn 69 ngàn tỷ, đồng vốn lớn nhất Việt Nam'
  },
  {
    date: '25/02/2025',
    time: '09:02',
    title: 'Cuộc đua lợi nhuận VN30: Vinhomes giữ vững ngôi vương'
  }
];

const StockNews: React.FC<StockNewsProps> = ({ newsItems = dummyNewsItems }) => {
  return (
    <NewsContainer>
      <NewsTitle>Tin tức chứng khoán</NewsTitle>
      <Box className="news-list">
        {newsItems.map((item, index) => (
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
        ))}
      </Box>
    </NewsContainer>
  );
};

export default StockNews;
