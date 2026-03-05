import { pool } from '@/lib/db';
import { compileScenario } from '@/lib/scenarioCompiler';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await pool.query(`SELECT * FROM scenarios ORDER BY created_at DESC`);
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, sites, injections, action, schedule_start_time, schedule_end_time, cron_expression, timeout_minutes } = body;
        // action = 'activate' | 'draft' | 'scheduled'

        // 1. Validate
        if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
        if (!injections?.length) return NextResponse.json({ error: 'Add at least one injection' }, { status: 400 });

        // 2. Compile rules (only if activating)
        let deployedRuleIds: string[] = [];
        let finalStatus = action === 'activate' ? 'active' : action === 'scheduled' ? 'scheduled' : 'draft';

        if (action === 'activate') {
            const compiledRules = compileScenario('temp', injections, sites || []);

            // 3. Check for existing rules with same IDs to handle duplicate collision
            let existingIds = new Set<string>();
            try {
                const existingRulesRes = await fetch('http://10.1.92.251:8080/__chaos/rules');
                if (existingRulesRes.ok) {
                    const existingRules = await existingRulesRes.json();
                    existingIds = new Set(existingRules.map((r: any) => r.id));
                }
            } catch (err) {
                console.warn('Could not fetch existing rules from chaos engine', err);
            }

            // 4. Deploy each compiled rule to chaos engine
            const deployPromises = compiledRules.map(async (rule) => {
                // If a rule with this ID already exists, it may need continue_on_match patched
                if (existingIds.has(rule.id)) {
                    // Patch the existing rule with continue_on_match: true first
                    await fetch(`http://10.1.92.251:8080/__chaos/rules/${rule.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...rule, continue_on_match: true })
                    });
                }

                // PUT the new/updated rule
                const res = await fetch(`http://10.1.92.251:8080/__chaos/rules/${rule.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rule)
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed to deploy rule ${rule.id}: ${errText}`);
                }

                return rule.id;
            });

            try {
                deployedRuleIds = await Promise.all(deployPromises);
            } catch (err) {
                return NextResponse.json({
                    error: 'Chaos engine deployment failed',
                    detail: String(err)
                }, { status: 502 });
            }
        }

        let finalEndTime = schedule_end_time || null;
        if ((action === 'activate' || action === 'scheduled') && timeout_minutes && !finalEndTime) {
            // For scheduled scenarios, we calculate end time relative to start time if provided, 
            // otherwise relative to NOW (for immediate activation).
            const baseTime = (action === 'scheduled' && schedule_start_time)
                ? new Date(schedule_start_time).getTime()
                : Date.now();
            finalEndTime = new Date(baseTime + timeout_minutes * 60000).toISOString();
        }

        // 5. Persist to PostgreSQL
        const result = await pool.query(
            `INSERT INTO scenarios 
         (name, description, sites, status, injections, deployed_rule_ids, activated_at, schedule_start_time, schedule_end_time, cron_expression, timeout_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [
                name,
                description || '',
                sites || [],
                finalStatus,
                JSON.stringify(injections),
                deployedRuleIds,
                action === 'activate' ? new Date() : null,
                schedule_start_time || null,
                finalEndTime,
                cron_expression || null,
                timeout_minutes || null
            ]
        );

        // 6. Log activity
        fetch(`http://localhost:3000/api/activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: action === 'activate' ? 'scenario_activated' : action === 'scheduled' ? 'scenario_scheduled' : 'scenario_saved_draft',
                details: `Name: ${name}. Rules: ${deployedRuleIds.length}`,
            })
        }).catch(() => { }); // Don't fail if activity log fails

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err: any) {
        console.error('Failed to save scenario:', err);
        return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
    }
}
