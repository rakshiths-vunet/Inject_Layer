import { NextResponse } from 'next/server';

const CHAOS_API_BASE = 'http://10.1.92.251:8080/__chaos';

export async function GET() {
    try {
        const response = await fetch(`${CHAOS_API_BASE}/rules`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch rules: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching chaos rules:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}
