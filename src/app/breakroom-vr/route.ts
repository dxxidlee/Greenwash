import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'breakroom-vr', 'index.html');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
