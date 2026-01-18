// app/api/instructor/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://34.229.79.51:8080/instructor?departmentName=COMPUTER_SCIENCE', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch instructors. Status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 });
  }
}



export async function POST(request: Request) {
    try {
      const body = await request.json();
  
      const res = await fetch('http://34.229.79.51:8080/instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to post instructor. Status: ${res.status}`);
      }
  
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      console.error('Error posting instructor:', error);
      return NextResponse.json({ error: 'Failed to create instructor' }, { status: 500 });
    }
  }