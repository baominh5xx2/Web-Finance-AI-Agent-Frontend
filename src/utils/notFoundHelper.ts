import { notFound } from 'next/navigation';

/**
 * Hàm tiện ích để gọi notFound() và chuyển hướng đến trang 404 tùy chỉnh
 * @param message Tùy chọn: Thông báo lỗi để ghi log
 */
export function showNotFoundPage(message?: string) {
  if (message) {
    console.error(`Page not found: ${message}`);
  }
  notFound();
}
