import { NextResponse } from 'next/server';

const CHAOS_API_BASE = 'http://10.1.92.251:8080/__chaos';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ ruleId: string }> }
) {
    try {
        const { ruleId } = await params;
        const body = await request.json();

        const response = await fetch(`${CHAOS_API_BASE}/rules/${ruleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Failed to deploy rule: ${errText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error deploying rule:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ ruleId: string }> }
) {
    try {
        const { ruleId } = await params;
        const body = await request.json();
        const action = body.action || 'disable'; // 'enable' or 'disable'

        const response = await fetch(`${CHAOS_API_BASE}/rules/${ruleId}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} rule: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error toggling rule:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ ruleId: string }> }
) {
    try {
        const { ruleId } = await params;

        const response = await fetch(`${CHAOS_API_BASE}/rules/${ruleId}`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete rule: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error deleting rule:', error);
        return NextResponse.json(
            { error: error.message, ok: false },
            { status: 500 }
        );
    }
}
