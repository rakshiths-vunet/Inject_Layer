import { NextResponse } from 'next/server';

const CHAOS_API_BASE = 'http://10.1.92.251:8080/__chaos';

export async function GET() {
    try {
        const response = await fetch(`${CHAOS_API_BASE}/apps`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch apps: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching chaos apps:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}
