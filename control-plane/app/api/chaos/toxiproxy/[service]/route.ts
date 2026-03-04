import { NextRequest, NextResponse } from 'next/server';
import { getToxiproxyUrl, SERVICE_MAP } from '../route';

type Params = { params: Promise<{ service: string }> };

// GET /api/chaos/toxiproxy/[service] — get proxy status + toxics
export async function GET(_req: NextRequest, { params }: Params) {
    const { service } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const host = _req.nextUrl.searchParams.get('host');
    const proxyUrl = getToxiproxyUrl(service, `/proxies/${service}`, host);
    const toxicsUrl = getToxiproxyUrl(service, `/proxies/${service}/toxics`, host);

    try {
        const [proxyRes, toxicsRes] = await Promise.all([
            fetch(proxyUrl!, { cache: 'no-store', signal: AbortSignal.timeout(4000) }),
            fetch(toxicsUrl!, { cache: 'no-store', signal: AbortSignal.timeout(4000) }),
        ]);

        const proxy = proxyRes.ok ? await proxyRes.json() : null;
        const toxics = toxicsRes.ok ? await toxicsRes.json() : [];

        return NextResponse.json({
            service,
            label: SERVICE_MAP[service].label,
            proxy,
            toxics: Array.isArray(toxics) ? toxics : [],
            enabled: proxy?.enabled ?? true,
            reachable: proxyRes.ok,
        });
    } catch (err: any) {
        return NextResponse.json({
            service,
            label: SERVICE_MAP[service].label,
            proxy: null,
            toxics: [],
            enabled: true,
            reachable: false,
            error: err.message,
        });
    }
}

// POST /api/chaos/toxiproxy/[service] — enable or disable the proxy
export async function POST(req: NextRequest, { params }: Params) {
    const { service } = await params;
    if (!SERVICE_MAP[service]) {
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }

    const body = await req.json();
    const host = req.nextUrl.searchParams.get('host');
    const url = getToxiproxyUrl(service, `/proxies/${service}`, host);

    try {
        const res = await fetch(url!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000),
        });

        const data = res.ok ? await res.json() : await res.text();
        if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message, ok: false }, { status: 502 });
    }
}
