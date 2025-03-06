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

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting save process...');
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
    let indexCode, data;
    try {
      const requestJson = await request.json();
      indexCode = requestJson.indexCode;
      data = requestJson.data;
      console.log(`[API] Received request to save data for index: ${indexCode}`);
    } catch (parseError) {
      console.error('[API] Error parsing request JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse request body', message: (parseError as Error).message },
        { status: 400 }
      );
    }
    
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
  } catch (error) {
    console.error('[API] Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 