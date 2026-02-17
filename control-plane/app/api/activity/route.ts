
import { NextResponse } from 'next/server';
import { logActivity, getRecentActivities, ActivityLog } from '../../lib/db';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const activities = getRecentActivities();
        return NextResponse.json(activities);
    } catch (error) {
        console.error("Failed to fetch activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const headersList = headers();
        const ip = (await headersList).get('x-forwarded-for') || (await headersList).get('x-real-ip') || 'Unknown IP';
        const userAgent = (await headersList).get('user-agent') || 'Unknown UA';

        const activity = {
            user: body.user || 'System', // Could be dynamic if we had auth
            action: body.action,
            details: body.details,
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: userAgent,
        };

        logActivity(activity);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to log activity:", error);
        return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
    }
}
