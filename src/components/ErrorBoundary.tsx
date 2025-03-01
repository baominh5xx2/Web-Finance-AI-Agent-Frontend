'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  // Nếu lỗi liên quan đến không tìm thấy trang, chuyển đến trang 404
  if (error.message.includes('not found') || error.message.includes('404')) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi!</h2>
      <p className="mb-6 text-red-500">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Thử lại
      </button>
    </div>
  );
}
