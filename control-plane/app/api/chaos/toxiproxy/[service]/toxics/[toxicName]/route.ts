import { NextRequest, NextResponse } from 'next/server';
import { getToxiproxyUrl, SERVICE_MAP } from '../../../route';

type Params = { params: Promise<{ service: string; toxicName: string }> };

// DELETE /api/chaos/toxiproxy/[service]/toxics/[toxicName]
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { service, toxicName } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const host = _req.nextUrl.searchParams.get('host');
    const url = getToxiproxyUrl(service, `/proxies/${service}/toxics/${toxicName}`, host);
    try {
        const res = await fetch(url!, { method: 'DELETE', signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`Toxiproxy responded with ${res.status}`);
        return NextResponse.json({ deleted: toxicName });
    } catch (err: any) {
        return NextResponse.json({ error: err.message, ok: false }, { status: 502 });
    }
}

// POST /api/chaos/toxiproxy/[service]/toxics/[toxicName] — update toxic
export async function POST(req: NextRequest, { params }: Params) {
    const { service, toxicName } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const body = await req.json();
    const host = req.nextUrl.searchParams.get('host');
    const url = getToxiproxyUrl(service, `/proxies/${service}/toxics/${toxicName}`, host);
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
