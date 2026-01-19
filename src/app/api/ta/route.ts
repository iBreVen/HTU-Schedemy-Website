import { NextResponse } from 'next/server';

const TA_API_URL = 'http://https://api.ayoub.htufolio.com:8080/instructor/ta';

export async function GET() {
  try {
    const res = await fetch(TA_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch TAs. Status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching TAs:', error);
    return NextResponse.json({ error: 'Failed to fetch TAs' }, { status: 500 });
  }
}
