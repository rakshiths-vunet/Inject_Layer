import { pool } from '@/lib/db';
import { compileScenario } from '@/lib/scenarioCompiler';
import { NextResponse } from 'next/server';
const cronParser = require('cron-parser');

export async function GET() {
    try {
        const results = {
            activated: 0,
            deactivated: 0,
            rescheduled: 0,
            errors: [] as string[]
        };

        // 1. ACTIVATE SCHEDULED SCENARIOS
        // Find scenarios that are scheduled and whose start time has passed,
        // and make sure they haven't blown past their end time (if they have one).
        const { rows: scenariosToActivate } = await pool.query(`
      SELECT * FROM scenarios 
      WHERE status = 'scheduled' 
        AND schedule_start_time <= NOW()
        AND (schedule_end_time IS NULL OR schedule_end_time > NOW())
    `);

        for (const scenario of scenariosToActivate) {
            try {
                const compiledRules = compileScenario(scenario.id, scenario.injections, scenario.sites || []);

                let deployedRuleIds: string[] = [];
                const deployPromises = compiledRules.map(async (rule) => {
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

                deployedRuleIds = await Promise.all(deployPromises);

                await pool.query(
                    `UPDATE scenarios 
           SET status = 'active', deployed_rule_ids = $1, activated_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
                    [deployedRuleIds, scenario.id]
                );

                results.activated++;
            } catch (err: any) {
                console.error(`Failed to activate scheduled scenario ${scenario.id}:`, err);
                results.errors.push(`Activation failed for ${scenario.id}: ${err.message}`);
            }
        }

        // 2. DEACTIVATE EXPIRED SCENARIOS
        // Find active scenarios that have a schedule_end_time which has passed
        const { rows: scenariosToDeactivate } = await pool.query(`
      SELECT * FROM scenarios 
      WHERE status = 'active'
        AND schedule_end_time <= NOW()
    `);

        for (const scenario of scenariosToDeactivate) {
            try {
                // Delete rules from Chaos Engine
                await Promise.allSettled(
                    (scenario.deployed_rule_ids || []).map((ruleId: string) =>
                        fetch(`http://10.1.92.251:8080/__chaos/rules/${ruleId}`, { method: 'DELETE' })
                    )
                );

                // Check if there is a cron expression to reschedule
                if (scenario.cron_expression && scenario.schedule_start_time && scenario.schedule_end_time) {
                    try {
                        const originalStartMs = new Date(scenario.schedule_start_time).getTime();
                        const originalEndMs = new Date(scenario.schedule_end_time).getTime();
                        const durationMs = originalEndMs - originalStartMs;

                        const interval = cronParser.parseExpression(scenario.cron_expression);
                        const nextStart = interval.next().toDate();
                        const nextEnd = new Date(nextStart.getTime() + durationMs);

                        await pool.query(
                            `UPDATE scenarios 
               SET status = 'scheduled', 
                   deployed_rule_ids = '{}', 
                   activated_at = NULL,
                   deactivated_at = NOW(),
                   schedule_start_time = $1, 
                   schedule_end_time = $2, 
                   updated_at = NOW() 
               WHERE id = $3`,
                            [nextStart, nextEnd, scenario.id]
                        );
                        results.rescheduled++;
                    } catch (cronErr: any) {
                        console.error(`Failed to calculate next cron tick for ${scenario.id}:`, cronErr);
                        results.errors.push(`Cron recalculation failed for ${scenario.id}: ${cronErr.message}`);

                        // Fallback to normal inactive status if cron fails
                        await pool.query(
                            `UPDATE scenarios SET status='inactive', deployed_rule_ids='{}', deactivated_at=NOW(), updated_at=NOW() WHERE id=$1`,
                            [scenario.id]
                        );
                        results.deactivated++;
                    }
                } else {
                    // Standard deactivation
                    await pool.query(
                        `UPDATE scenarios SET status='inactive', deployed_rule_ids='{}', deactivated_at=NOW(), updated_at=NOW() WHERE id=$1`,
                        [scenario.id]
                    );
                    results.deactivated++;
                }
            } catch (err: any) {
                console.error(`Failed to deactivate scheduled scenario ${scenario.id}:`, err);
                results.errors.push(`Deactivation failed for ${scenario.id}: ${err.message}`);
            }
        }

        return NextResponse.json(results);
    } catch (err: any) {
        console.error('Process scenarios cron failed:', err);
        return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
    }
}
