import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_HOST = 'localhost:8081';

function getChaosUrl(req: NextRequest) {
    const host = req.nextUrl.searchParams.get('host') || DEFAULT_HOST;
    return `http://${host}/chaos`;
}

export async function GET(req: NextRequest) {
    const url = getChaosUrl(req);
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`OTP service responded with ${res.status}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 502 }
        );
    }
}

export async function POST(req: NextRequest) {
    const url = getChaosUrl(req);
    try {
        const body = await req.json();
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`OTP service responded with ${res.status}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 502 }
        );
    }
}
