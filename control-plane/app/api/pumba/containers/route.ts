import { NextRequest, NextResponse } from 'next/server';

const PUMBA_API_KEY = '1cb50a28db2d427eaa0201abd4217632';

export async function GET(request: NextRequest) {
    const host = request.nextUrl.searchParams.get('host') || '10.1.92.124';
    const url = `http://${host}:8099/containers`;

    try {
        const response = await fetch(url, {
            headers: { 'X-API-Key': PUMBA_API_KEY },
            cache: 'no-store',
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message, containers: [] }, { status: 500 });
    }
}
