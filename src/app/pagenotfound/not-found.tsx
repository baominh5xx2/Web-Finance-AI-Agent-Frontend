'use client';

import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="error-code-container">
        <div className="error-code">404</div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 text-purple-800 bounce-in">
        Oops! Trang không tìm thấy
      </h1>
      
      <p className="text-xl text-center mb-8 text-gray-600 max-w-md">
        Có vẻ như bạn đã lạc vào một trang không tồn tại. Đừng lo lắng, hãy quay lại trang chính nhé!
      </p>
      
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
        <Link 
          href="/dashboard" 
          className="px-8 py-3 bg-purple-600 text-white font-medium rounded-lg shadow-lg hover:bg-purple-700 transition-colors duration-300 text-center"
        >
          Về trang chủ
        </Link>
      </div>
      <div className="mt-8 flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-purple-300 animate-bounce" 
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
