import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  
  try {
    // Gọi API backend từ server Next.js (không có vấn đề CORS ở đây)
    const response = await fetch(`http://localhost:8000/api/v1/treemap-color/stock-change/${symbol}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Trả về dữ liệu cho client
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching treemap color for ${symbol}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 