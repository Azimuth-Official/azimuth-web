import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const versionPath = path.join(process.cwd(), 'public', 'version.json');
  const data = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
  return NextResponse.json(data);
}
