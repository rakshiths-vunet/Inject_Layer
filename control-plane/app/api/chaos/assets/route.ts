import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const CHAOS_API_BASE = 'http://10.1.92.251:8080/__chaos';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const app = searchParams.get('app');

    if (!app) {
        return NextResponse.json({ error: 'Missing app param', ok: false }, { status: 400 });
    }

    try {
        const response = await fetch(`${CHAOS_API_BASE}/assets?app=${encodeURIComponent(app)}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch assets: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching chaos assets:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}
