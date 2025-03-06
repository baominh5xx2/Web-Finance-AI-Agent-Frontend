import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Đường dẫn thư mục cache - sử dụng đường dẫn tuyệt đối
const CACHE_DIR = path.join(process.cwd(), 'src', 'components', 'StockTreeMap', 'cache');

export async function GET(
  request: NextRequest,
  { params }: { params: { indexCode: string } }
) {
  const { indexCode } = params;
  const cacheFilePath = path.join(CACHE_DIR, `${indexCode}.json`);
  
  console.log(`[API] Reading index cache from: ${cacheFilePath}`);
  console.log(`[API] Current working directory: ${process.cwd()}`);
  console.log(`[API] Full cache path: ${path.resolve(cacheFilePath)}`);

  // Liệt kê các file trong thư mục cache
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      console.log(`[API] Files in cache directory: ${files.join(', ')}`);
    } else {
      console.log(`[API] Cache directory does not exist: ${CACHE_DIR}`);
    }
  } catch (error) {
    console.error(`[API] Error listing cache directory:`, error);
  }
  
  try {
    // Đảm bảo thư mục cache tồn tại
    if (!fs.existsSync(CACHE_DIR)) {
      console.log(`[API] Cache directory does not exist: ${CACHE_DIR}`);
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      return NextResponse.json(
        { error: 'Cache directory not found' },
        { status: 404 }
      );
    }
    
    // Kiểm tra xem file cache có tồn tại không
    if (!fs.existsSync(cacheFilePath)) {
      console.log(`[API] No cache file found for index: ${indexCode}`);
      return NextResponse.json(
        { error: 'Cache not found' },
        { status: 404 }
      );
    }
    
    // Đọc dữ liệu từ file cache
    const fileContent = fs.readFileSync(cacheFilePath, 'utf-8');
    
    if (!fileContent || fileContent.trim() === '') {
      console.log(`[API] Cache file is empty for index: ${indexCode}`);
      return NextResponse.json(
        { error: 'Cache file is empty' },
        { status: 404 }
      );
    }
    
    try {
      const cacheData = JSON.parse(fileContent);
      console.log(`[API] Cache loaded for index: ${indexCode}`);
      
      // Kiểm tra xem cache có còn hiệu lực không (trong vòng 1 ngày)
      if (cacheData.cacheMeta && cacheData.cacheMeta.lastUpdated) {
        const lastUpdated = new Date(cacheData.cacheMeta.lastUpdated);
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (now.getTime() - lastUpdated.getTime() > oneDayInMs) {
          console.log(`[API] Cache expired for index: ${indexCode}`);
          return NextResponse.json(
            { error: 'Cache expired' },
            { status: 404 }
          );
        }
      }
      
      // Trả về dữ liệu (loại bỏ phần meta nếu cần)
      return NextResponse.json(cacheData);
    } catch (parseError) {
      console.error(`[API] Error parsing JSON for index ${indexCode}:`, parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in cache file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`[API] Error reading cache for index ${indexCode}:`, error);
    return NextResponse.json(
      { error: 'Failed to read cache', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 