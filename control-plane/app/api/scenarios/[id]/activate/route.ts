import { pool } from '@/lib/db';
import { compileScenario } from '@/lib/scenarioCompiler';
import { NextResponse } from 'next/server';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        // 1. Fetch scenario from DB
        const { rows } = await pool.query('SELECT * FROM scenarios WHERE id = $1', [id]);
        if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const scenario = rows[0];
        const injections = scenario.injections;

        // 2. Compile and deploy rules
        const compiledRules = compileScenario(id, injections, scenario.sites);

        const deployedRuleIds = await Promise.all(
            compiledRules.map(async (rule) => {
                const res = await fetch(`http://10.1.92.251:8080/__chaos/rules/${rule.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rule)
                });
                if (!res.ok) {
                    throw new Error('Failed proxy deployment');
                }
                return rule.id;
            })
        );

        // 3. Update DB status
        let schedule_end_time = scenario.schedule_end_time;
        if (scenario.timeout_minutes && !schedule_end_time) {
            schedule_end_time = new Date(Date.now() + scenario.timeout_minutes * 60000).toISOString();
        }

        await pool.query(
            `UPDATE scenarios SET status='active', deployed_rule_ids=$1, activated_at=NOW(), updated_at=NOW(), schedule_end_time=$2 WHERE id=$3`,
            [deployedRuleIds, schedule_end_time, id]
        );

        return NextResponse.json({ success: true, deployedRuleIds });
    } catch (err: any) {
        console.error('Failed to activate scenario:', err);
        return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
    }
}
