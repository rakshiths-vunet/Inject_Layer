import { pool } from '@/lib/db';
import { compileScenario } from '@/lib/scenarioCompiler';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    // First deactivate if active
    const { rows } = await pool.query('SELECT * FROM scenarios WHERE id = $1', [id]);

    if (rows[0]?.status === 'active') {
      // Clean up rules from engine first
      await Promise.allSettled(
        (rows[0].deployed_rule_ids || []).map((ruleId: string) =>
          fetch(`http://10.1.92.251:8080/__chaos/rules/${ruleId}`, { method: 'DELETE' })
        )
      );
    }

    await pool.query('DELETE FROM scenarios WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete scenario:', err);
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const body = await req.json();
    const { name, description, sites, injections, action, schedule_start_time, schedule_end_time, cron_expression, timeout_minutes } = body;

    const { rows } = await pool.query('SELECT * FROM scenarios WHERE id = $1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const scenario = rows[0];

    // Delete old rules if active
    if (scenario.status === 'active') {
      await Promise.allSettled(
        (rows[0].deployed_rule_ids || []).map((ruleId: string) =>
          fetch(`http://10.1.92.251:8080/__chaos/rules/${ruleId}`, { method: 'DELETE' })
        )
      );
    }

    let deployedRuleIds = scenario.deployed_rule_ids || [];
    let finalStatus = action === 'activate' ? 'active' : action === 'scheduled' ? 'scheduled' : 'draft';

    if (action === 'activate') {
      // Compile and deploy new rules
      const compiledRules = compileScenario(id, injections, sites || []);
      deployedRuleIds = await Promise.all(
        compiledRules.map(async (rule) => {
          const res = await fetch(`http://10.1.92.251:8080/__chaos/rules/${rule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
          });
          if (!res.ok) throw new Error('Failed to redeploy proxy rule');
          return rule.id;
        })
      );
    } else {
      // If we are not activating (e.g. saving draft or scheduling), we shouldn't have active deployed rules.
      // They were deleted above if the previous status was 'active'.
      deployedRuleIds = [];
    }

    let finalEndTime = schedule_end_time || null;
    if (action === 'activate' && timeout_minutes && !finalEndTime) {
      finalEndTime = new Date(Date.now() + timeout_minutes * 60000).toISOString();
    }

    // Update DB
    const result = await pool.query(
      `UPDATE scenarios 
       SET name=$1, description=$2, sites=$3, injections=$4, deployed_rule_ids=$5, updated_at=NOW(), status=$6, activated_at=$7, schedule_start_time=$8, schedule_end_time=$9, cron_expression=$10, timeout_minutes=$11
       WHERE id=$12 RETURNING *`,
      [
        name,
        description || '',
        sites || [],
        JSON.stringify(injections),
        deployedRuleIds,
        finalStatus,
        action === 'activate' ? new Date() : null,
        schedule_start_time || null,
        finalEndTime,
        cron_expression || null,
        timeout_minutes || null,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('Failed to update scenario:', err);
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
  }
}
