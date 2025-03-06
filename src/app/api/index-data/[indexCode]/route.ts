import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Đường dẫn thư mục chứa dữ liệu
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export async function GET(
  request: NextRequest,
  { params }: { params: { indexCode: string } }
) {
  const { indexCode } = params;
  
  try {
    // Thời gian bắt đầu
    const startTime = Date.now();
    console.log(`[API] Reading data for index: ${indexCode} from JSON file (Start: ${new Date().toISOString()})...`);
    console.log(`[API] Current working directory: ${process.cwd()}`);
    console.log(`[API] Data directory path: ${DATA_DIR}`);
    
    // Kiểm tra và xử lý thư mục
    const dirExists = fs.existsSync(DATA_DIR);
    console.log(`[API] Data directory exists: ${dirExists}`);
    
    if (!dirExists) {
      console.log(`[API] Creating data directory: ${DATA_DIR}`);
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log('[API] Directory created successfully');
      } catch (mkdirError) {
        console.error('[API] Error creating directory:', mkdirError);
      }
    }
    
    // Kiểm tra xem có file nào trong thư mục không
    try {
      const files = fs.readdirSync(DATA_DIR);
      console.log(`[API] Found ${files.length} files in data directory: ${files.map(f => f.split('.')[0]).join(', ')}`);
    } catch (readDirError) {
      console.error('[API] Error listing directory:', readDirError);
    }
    
    // Đường dẫn file JSON
    const filePath = path.join(DATA_DIR, `${indexCode}.json`);
    console.log(`[API] Full file path: ${filePath}`);
    console.log(`[API] Absolute file path: ${path.resolve(filePath)}`);
    
    // Kiểm tra xem file có tồn tại không
    const fileExists = fs.existsSync(filePath);
    console.log(`[API] File exists: ${fileExists}`);
    
    if (!fileExists) {
      console.log(`[API] No data file found for index: ${indexCode}`);
      
      return NextResponse.json(
        { error: 'Data file not found', type: 'no_file', path: filePath },
        { status: 404 }
      );
    }
    
    // File tồn tại - đọc dữ liệu
    console.log(`[API] Reading file: ${filePath}`);
    let fileContent;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`[API] File read successfully. Content length: ${fileContent.length} bytes`);
      
      // Kiểm tra nội dung tối thiểu
      if (!fileContent || fileContent.trim().length < 10) {
        console.log(`[API] File content is too small: ${fileContent}`);
        return NextResponse.json(
          { error: 'File content is invalid (too small)', content: fileContent },
          { status: 404 }
        );
      }
    } catch (readError) {
      console.error(`[API] Error reading file:`, readError);
      return NextResponse.json(
        { error: 'Cannot read file', message: (readError as Error).message, path: filePath },
        { status: 500 }
      );
    }
    
    // Parse JSON
    try {
      const data = JSON.parse(fileContent);
      console.log(`[API] JSON parsed successfully`);
      
      // Kiểm tra cấu trúc dữ liệu
      if (!data) {
        console.error(`[API] Parsed data is null or undefined`);
        return NextResponse.json(
          { error: 'Parsed data is invalid' },
          { status: 500 }
        );
      }
      
      // Kiểm tra và log cấu trúc dữ liệu
      if (data.indexTreemapData) {
        const childrenCount = data.indexTreemapData.children?.[0]?.children?.length || 0;
        console.log(`[API] Data contains indexTreemapData with ${childrenCount} stocks`);
      } else {
        console.log(`[API] Data does not contain indexTreemapData structure`);
      }
      
      // Đo thời gian hoàn thành
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      console.log(`[API] Successfully read data for index: ${indexCode} in ${durationMs}ms`);
      
      // Trả về dữ liệu với định dạng phù hợp, kèm theo thông tin cho client
      return NextResponse.json({
        ...data,
        status: 'success',
        message: `Data loaded from cache file: ${indexCode}.json`,
        fromCache: true
      });
    } catch (parseError) {
      console.error(`[API] Error parsing JSON:`, parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON format', 
          message: (parseError as Error).message,
          content: fileContent ? fileContent.substring(0, 100) + "..." : null 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`[API] Error reading data for index ${indexCode}:`, error);
    return NextResponse.json(
      { error: 'Failed to read data', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { indexCode: string } }
) {
  const { indexCode } = params;
  
  console.log(`[API] Request to delete cache file for index: ${indexCode}`);
  
  try {
    // Đường dẫn file JSON
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
  } catch (error) {
    console.error(`[API] Error deleting cache file for index ${indexCode}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete cache file', 
        message: (error as Error).message,
        indexCode
      },
      { status: 500 }
    );
  }
}

// Cập nhật hàm POST để hỗ trợ action=delete
export async function POST(
  request: NextRequest,
  { params }: { params: { indexCode: string } }
) {
  const { indexCode } = params;
  
  try {
    // Đọc dữ liệu từ request
    const requestData = await request.json();
    
    // Kiểm tra xem có phải là yêu cầu xóa file không
    if (requestData.action === 'delete') {
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
    
    // Nếu không phải yêu cầu xóa, tiếp tục lưu cache như bình thường
    console.log(`[API] Request to save cache for index: ${indexCode}`);
    
    // Đảm bảo thư mục data tồn tại
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`[API] Creating data directory: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Thêm metadata về thời gian lưu cache
    const dataToSave = {
      ...requestData,
      savedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    // Đường dẫn file để lưu
    const filePath = path.join(DATA_DIR, `${indexCode}.json`);
    console.log(`[API] Saving data to file: ${filePath}`);
    
    // Ghi file
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    console.log(`[API] ✅ Successfully saved cache file for ${indexCode}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully saved cache for ${indexCode}`,
      savedAt: dataToSave.savedAt,
      filePath: `${indexCode}.json`
    });
  } catch (error) {
    console.error(`[API] Error processing request for ${indexCode}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request', message: (error as Error).message },
      { status: 500 }
    );
  }
} 