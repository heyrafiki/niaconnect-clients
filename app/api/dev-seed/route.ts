import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  await dbConnect();
  const clients = await req.json();
  if (!Array.isArray(clients)) {
    return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
  }
  try {
    const inserted = await Client.insertMany(clients);
    return NextResponse.json({ inserted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 