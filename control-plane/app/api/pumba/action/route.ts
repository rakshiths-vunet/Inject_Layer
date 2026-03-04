import { NextRequest, NextResponse } from 'next/server';

const PUMBA_API_KEY = '1cb50a28db2d427eaa0201abd4217632';

export async function POST(request: NextRequest) {
    const { host, action, ...body } = await request.json();
    const url = `http://${host || '10.1.92.124'}:8099/${action}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': PUMBA_API_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const host = request.nextUrl.searchParams.get('host') || '10.1.92.124';
    const action = request.nextUrl.searchParams.get('action') || 'health';
    const url = `http://${host}:8099/${action}`;

    try {
        const response = await fetch(url, {
            headers: { 'X-API-Key': PUMBA_API_KEY },
            cache: 'no-store',
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
