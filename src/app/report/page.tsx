'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './report.css';
import { reportService } from '../services/report';

// Cấu hình worker cho PDF.js bằng cách import trực tiếp
// Sửa lỗi "Failed to fetch dynamically imported module"
import 'pdfjs-dist/build/pdf.worker.mjs';

export default function ReportPage() {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fixed stock symbol to NKG
  const fixedStockSymbol = 'NKG';

  // Xử lý khi document được tải thành công
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("Document loaded successfully. Total pages:", numPages);
    setNumPages(numPages);
    setIsLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Call backend API to get the report for NKG
      const pdfData = await reportService.getStockReportPDF();
      console.log('PDF data received, size:', pdfData.size, 'type:', pdfData.type);
      setPdfBlob(pdfData);
    } catch (err: any) {
      console.error('Error in handleSearch:', err);
      setError(`Không thể tải báo cáo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Direct download function - doesn't require PDF.js
  function downloadPDF() {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Financial_Report_${fixedStockSymbol}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  // Show PDF in a new tab
  function viewPDF() {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    }
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Báo Cáo Phân Tích Cổ Phiếu</h1>
        <p className="report-subtitle">Tìm kiếm báo cáo phân tích mới nhất cho mã cổ phiếu NKG</p>
      </div>
      
      <div className="search-section">
        <div className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              value={fixedStockSymbol}
              disabled
              readOnly
            />
            <button type="button" onClick={handleSearch} className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <div className="support-notice">
            <p>Hiện tại chỉ hỗ trợ mã cổ phiếu NKG cho chức năng tìm kiếm báo cáo.</p>
          </div>
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
        </div>
      )}
      
      {pdfBlob && !isLoading && !error && (
        <div className="pdf-result">
          <div className="pdf-success">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2>Báo cáo đã được tải thành công!</h2>
          </div>
          
          <div className="pdf-actions">
            <button onClick={downloadPDF} className="action-button download">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải xuống báo cáo
            </button>
            
            <button onClick={viewPDF} className="action-button view">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem trong tab mới
            </button>
          </div>
          
          <div className="pdf-container">
            <div className="pdf-info-bar">
              <span className="pdf-total-pages">
                Tổng số trang: {numPages || '--'}
              </span>
              <span className="pdf-scroll-hint">
                Kéo để xem toàn bộ báo cáo
              </span>
            </div>
            
            <div className="pdf-viewer">
              {pdfBlob && (
                <Document
                  file={URL.createObjectURL(pdfBlob)}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(err) => {
                    console.error('PDF load error:', err);
                    setError(`Không thể tải báo cáo PDF: ${err.message}`);
                  }}
                  loading={<div className="loading-spinner"></div>}
                >
                  {Array.from(
                    new Array(numPages || 0),
                    (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="pdf-page"
                        width={750}
                      />
                    )
                  )}
                </Document>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!pdfBlob && !isLoading && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2>Tìm kiếm báo cáo phân tích cổ phiếu NKG</h2>
          <p>Nhấn nút tìm kiếm để xem báo cáo phân tích cổ phiếu NKG</p>
        </div>
      )}
    </div>
  );
}
