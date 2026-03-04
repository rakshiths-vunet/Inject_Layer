import { NextRequest, NextResponse } from 'next/server';
import { getToxiproxyUrl, SERVICE_MAP } from '../../route';

type Params = { params: Promise<{ service: string }> };

// GET /api/chaos/toxiproxy/[service]/toxics
export async function GET(_req: NextRequest, { params }: Params) {
    const { service } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const host = _req.nextUrl.searchParams.get('host');
    const url = getToxiproxyUrl(service, `/proxies/${service}/toxics`, host);
    try {
        const res = await fetch(url!, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error(`Toxiproxy responded with ${res.status}`);
        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message, ok: false }, { status: 502 });
    }
}

// POST /api/chaos/toxiproxy/[service]/toxics — inject a new toxic
export async function POST(req: NextRequest, { params }: Params) {
    const { service } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const body = await req.json();
    const host = req.nextUrl.searchParams.get('host');
    const url = getToxiproxyUrl(service, `/proxies/${service}/toxics`, host);
    try {
        const res = await fetch(url!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Toxiproxy responded with ${res.status}`);
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message, ok: false }, { status: 502 });
    }
}

// DELETE /api/chaos/toxiproxy/[service]/toxics — clear ALL toxics for this service
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { service } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    // First fetch the list, then delete each one
    const host = _req.nextUrl.searchParams.get('host');
    const listUrl = getToxiproxyUrl(service, `/proxies/${service}/toxics`, host);
    try {
        const listRes = await fetch(listUrl!, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
        if (!listRes.ok) throw new Error(`Cannot fetch toxics: ${listRes.status}`);
        const toxics: { name: string }[] = await listRes.json();

        await Promise.all(
            toxics.map((t) => {
                const delUrl = getToxiproxyUrl(service, `/proxies/${service}/toxics/${t.name}`, host);
                return fetch(delUrl!, { method: 'DELETE', signal: AbortSignal.timeout(4000) });
            })
        );

        return NextResponse.json({ deleted: toxics.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message, ok: false }, { status: 502 });
    }
}
