import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch('http://https://api.ayoub.htufolio.com:8080/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to save schedule. Status: ${res.status}`);
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error posting schedules:', error);
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  }
}
