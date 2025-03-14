'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './report.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Mock data for demonstration - in a real app, these would come from an API
  const stockReports = [
    { symbol: 'VNM', name: 'Vinamilk', pdfUrl: 'https://example.com/reports/vnm-report.pdf' },
    { symbol: 'FPT', name: 'FPT Corporation', pdfUrl: 'https://example.com/reports/fpt-report.pdf' },
    { symbol: 'VIC', name: 'Vingroup', pdfUrl: 'https://example.com/reports/vic-report.pdf' },
    // Add more as needed
  ];

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // In a real application, this would be an API call
    setTimeout(() => {
      const foundStock = stockReports.find(
        stock => stock.symbol.toLowerCase() === searchTerm.toLowerCase() ||
                stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (foundStock) {
        setPdfUrl(foundStock.pdfUrl);
      } else {
        setError('Không tìm thấy báo cáo cho cổ phiếu này. Vui lòng thử lại.');
        setPdfUrl('');
      }
      setIsLoading(false);
    }, 800);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Báo Cáo Phân Tích Cổ Phiếu</h1>
        <p className="report-subtitle">Tìm kiếm báo cáo phân tích mới nhất cho các mã cổ phiếu</p>
      </div>
      
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Nhập mã cổ phiếu hoặc tên công ty (VD: VNM, FPT, Vingroup...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
        
        <div className="search-filters">
          <select className="filter-select">
            <option value="all">Tất cả báo cáo</option>
            <option value="technical">Phân tích kỹ thuật</option>
            <option value="fundamental">Phân tích cơ bản</option>
            <option value="quarterly">Báo cáo quý</option>
          </select>
          
          <select className="filter-select">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải báo cáo...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <div className="suggestion-container">
            <h3>Có thể bạn quan tâm:</h3>
            <div className="suggestion-items">
              {stockReports.slice(0, 3).map(stock => (
                <div 
                  key={stock.symbol} 
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(stock.symbol);
                    setPdfUrl(stock.pdfUrl);
                  }}
                >
                  <strong>{stock.symbol}</strong> - {stock.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {pdfUrl && !isLoading && !error && (
        <div className="pdf-container">
          <div className="pdf-controls">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={previousPage}
              className="page-control"
            >
              ‹ Trước
            </button>
            <span className="page-indicator">
              Trang {pageNumber} / {numPages || '--'}
            </span>
            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={nextPage}
              className="page-control"
            >
              Sau ›
            </button>
          </div>
          
          <div className="pdf-viewer">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => setError("Không thể tải báo cáo. Vui lòng thử lại sau.")}
              loading={<div className="loading-spinner"></div>}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="pdf-page"
              />
            </Document>
          </div>
          
          <div className="pdf-info">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-link">
              Tải xuống báo cáo
            </a>
          </div>
        </div>
      )}
      
      {!pdfUrl && !isLoading && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2>Tìm kiếm báo cáo phân tích</h2>
          <p>Nhập mã cổ phiếu hoặc tên công ty để tìm báo cáo phân tích mới nhất</p>
          <div className="popular-searches">
            <h3>Báo cáo phổ biến:</h3>
            <div className="popular-tags">
              {stockReports.map(stock => (
                <span 
                  key={stock.symbol} 
                  className="popular-tag"
                  onClick={() => {
                    setSearchTerm(stock.symbol);
                    setPdfUrl(stock.pdfUrl);
                  }}
                >
                  {stock.symbol}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
