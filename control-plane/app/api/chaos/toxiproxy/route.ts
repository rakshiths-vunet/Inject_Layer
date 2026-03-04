import { NextResponse } from 'next/server';

// ─── Known Toxiproxy hosts (selectable from UI) ─────────────────────────────
export const KNOWN_HOSTS = ['10.1.92.124', '10.1.92.127'] as const;
export type ToxiproxyHost = typeof KNOWN_HOSTS[number];

// ─── Service → Port Mapping (NEVER exposed to UI) ──────────────────────────
export const SERVICE_MAP: Record<string, { port: number; label: string; icon: string; description: string }> = {
    'credit-service': { port: 8474, label: 'Credit Service', icon: 'CreditCard', description: 'Handles credit operations and allocations' },
    'debit-service': { port: 8475, label: 'Debit Service', icon: 'Minus', description: 'Handles debit operations and withdrawals' },
    'account-service': { port: 8476, label: 'Account Service', icon: 'User', description: 'Manages user account data and queries' },
    'cbs-mpin-service': { port: 8477, label: 'CBS MPIN Service', icon: 'Lock', description: 'Core banking MPIN authentication' },
    'password-service': { port: 8478, label: 'Password Service', icon: 'Key', description: 'Password hashing, validation and reset' },
    'jwt-service': { port: 8479, label: 'JWT Service', icon: 'Shield', description: 'JWT token issuance and validation' },
    'otp-service': { port: 8480, label: 'OTP Service', icon: 'Phone', description: 'One-time password delivery and verification' },
    'channel-api': { port: 8481, label: 'Channel API', icon: 'Globe', description: 'Main API gateway channel layer' },
};

export const DEFAULT_TOXIPROXY_HOST = '10.1.92.124';

export function getToxiproxyUrl(service: string, path: string = '', hostOverride?: string | null): string | null {
    const svc = SERVICE_MAP[service];
    if (!svc) return null;
    const host = hostOverride && KNOWN_HOSTS.includes(hostOverride as ToxiproxyHost)
        ? hostOverride
        : DEFAULT_TOXIPROXY_HOST;
    return `http://${host}:${svc.port}${path}`;
}

// GET /api/chaos/toxiproxy — list all services + known hosts
export async function GET() {
    const services = Object.entries(SERVICE_MAP).map(([id, meta]) => ({
        id,
        label: meta.label,
        icon: meta.icon,
        description: meta.description,
    }));
    return NextResponse.json({ services, hosts: KNOWN_HOSTS });
}
