import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Đường dẫn thư mục cache
const CACHE_DIR = path.join(process.cwd(), 'src', 'components', 'StockTreeMap', 'cache');

export async function POST(request: NextRequest) {
  try {
    // Đảm bảo thư mục cache tồn tại
    if (!fs.existsSync(CACHE_DIR)) {
      console.log(`[API] Creating cache directory: ${CACHE_DIR}`);
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    // Đọc dữ liệu từ request
    const { indexCode, data, rawData, timestamp } = await request.json();
    
    if (!indexCode || !data) {
      console.log('[API] Missing indexCode or data in request');
      return NextResponse.json(
        { error: 'Missing indexCode or data' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Saving cache for index: ${indexCode}`);
    
    // Thêm metadata vào dữ liệu
    const dataToCache = {
      ...data,
      rawData: rawData || [], // Lưu dữ liệu gốc
      cacheMeta: {
        lastUpdated: timestamp || new Date().toISOString(),
        indexCode: indexCode
      }
    };
    
    // Lưu dữ liệu vào file cache
    const cacheFilePath = path.join(CACHE_DIR, `${indexCode}.json`);
    fs.writeFileSync(cacheFilePath, JSON.stringify(dataToCache, null, 2));
    console.log(`[API] Index cache written to: ${cacheFilePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cache saved for ${indexCode}`,
      path: cacheFilePath
    });
  } catch (error) {
    console.error('[API] Error saving index cache:', error);
    return NextResponse.json(
      { error: 'Failed to save cache', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 