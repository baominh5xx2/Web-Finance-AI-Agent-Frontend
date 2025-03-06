import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Đường dẫn thư mục chứa dữ liệu
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

// Chuẩn hóa cấu trúc dữ liệu TreemapData để đảm bảo tính nhất quán
function normalizeTreemapData(data: any) {
  // Kiểm tra cấu trúc cơ bản
  if (!data || typeof data !== 'object') {
    console.error('[API] Invalid data format - not an object');
    return null;
  }
  
  // Lấy đúng cấu trúc TreemapData
  let treemapData = data;
  
  // Nếu data chứa indexTreemapData, sử dụng nó
  if (data.indexTreemapData && typeof data.indexTreemapData === 'object') {
    treemapData = data.indexTreemapData;
  }
  
  // Kiểm tra cấu trúc TreemapData
  if (!treemapData.name || !Array.isArray(treemapData.children)) {
    console.error('[API] Invalid TreemapData structure - missing name or children');
    return null;
  }
  
  return treemapData;
}

// API route đa năng - xử lý cả lưu cache và xóa cache
export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting process...');
    console.log('[API] Current working directory:', process.cwd());
    console.log('[API] Data directory path:', DATA_DIR);
    
    // Đảm bảo thư mục data tồn tại
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`[API] Creating data directory: ${DATA_DIR}`);
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log('[API] Directory created successfully');
      } catch (mkdirError) {
        console.error('[API] Error creating directory:', mkdirError);
        throw new Error(`Cannot create directory: ${(mkdirError as Error).message}`);
      }
    } else {
      console.log('[API] Data directory already exists');
    }
    
    // Đọc dữ liệu từ request
    const requestData = await request.json();
    const { action } = requestData;
    
    console.log(`[API] Received request with action: ${action}`);
    
    // CASE 1: Xóa file cache
    if (action === 'delete') {
      const { indexCode } = requestData;
      
      if (!indexCode) {
        return NextResponse.json(
          { success: false, message: 'Missing indexCode for delete action' },
          { status: 400 }
        );
      }
      
      console.log(`[API] Request to delete cache file for index: ${indexCode}`);
      
      // Đường dẫn file cần xóa
      const filePath = path.join(DATA_DIR, `${indexCode}.json`);
      console.log(`[API] Checking file path: ${filePath}`);
      
      // Kiểm tra xem file có tồn tại không
      const fileExists = fs.existsSync(filePath);
      console.log(`[API] File exists: ${fileExists}`);
      
      if (!fileExists) {
        console.log(`[API] No cache file to delete for index: ${indexCode}`);
        return NextResponse.json(
          { success: false, message: 'File not found', indexCode },
          { status: 404 }
        );
      }
      
      // File tồn tại - xóa file
      console.log(`[API] Deleting file: ${filePath}`);
      fs.unlinkSync(filePath);
      console.log(`[API] ✅ Successfully deleted cache file for index: ${indexCode}`);
      
      return NextResponse.json({
        success: true,
        message: `Successfully deleted cache file for index: ${indexCode}`,
        indexCode
      });
    }
    // CASE 2: Lưu cache
    else {
      // Lấy dữ liệu từ request
      const { indexCode, data } = requestData;
      
      if (!indexCode || !data) {
        console.error('[API] Missing indexCode or data in request');
        return NextResponse.json(
          { error: 'Missing indexCode or data' },
          { status: 400 }
        );
      }
      
      console.log(`[API] Saving data for index: ${indexCode} to JSON file...`);
      
      // Chuẩn hóa cấu trúc dữ liệu treemap nếu có
      const treemapData = normalizeTreemapData(data);
      
      // Đường dẫn file JSON
      const filePath = path.join(DATA_DIR, `${indexCode}.json`);
      console.log(`[API] File will be saved to: ${filePath}`);
      
      // Cấu trúc dữ liệu để lưu
      const dataToSave = {
        // Dữ liệu TreemapData đã chuẩn hóa
        indexTreemapData: treemapData || data.indexTreemapData || null,
        
        // Dữ liệu gốc của các cổ phiếu
        rawStocksData: data.rawStocksData || null,
        
        // Metadata và thời gian
        metadata: {
          indexCode: indexCode,
          stockCount: data.rawStocksData?.length || 0,
          source: data.metadata?.source || "api",
          ...data.metadata
        },
        
        // Thời gian lưu
        timestamp: data.timestamp || new Date().toISOString(),
        savedAt: new Date().toISOString()
      };
      
      // Log cấu trúc dữ liệu sẽ lưu
      console.log(`[API] Data structure to save:`, {
        indexCode,
        hasTreemapData: !!dataToSave.indexTreemapData,
        hasRawData: !!dataToSave.rawStocksData,
        metadata: dataToSave.metadata,
        timestamp: dataToSave.timestamp,
        savedAt: dataToSave.savedAt
      });
      
      // Lưu dữ liệu vào file JSON với format dễ đọc
      try {
        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
        console.log(`[API] Data successfully saved to: ${filePath}`);
        
        // Đọc lại file để xác nhận
        try {
          const savedContent = fs.readFileSync(filePath, 'utf-8');
          console.log(`[API] Verified file ${filePath} exists with ${savedContent.length} bytes`);
        } catch (readError) {
          console.warn(`[API] File was saved but cannot be read back:`, readError);
        }
      } catch (writeError) {
        console.error('[API] Error writing file:', writeError);
        throw new Error(`Cannot write file: ${(writeError as Error).message}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Data saved for ${indexCode}`,
        path: filePath,
        dataStructure: Object.keys(dataToSave)
      });
    }
  } catch (error) {
    console.error('[API] Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 