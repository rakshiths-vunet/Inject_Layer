import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const { rows } = await pool.query('SELECT * FROM scenarios WHERE id = $1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const scenario = rows[0];

    // Delete each deployed rule from chaos engine
    await Promise.allSettled(
      (scenario.deployed_rule_ids || []).map((ruleId: string) =>
        fetch(`http://10.1.92.251:8080/__chaos/rules/${ruleId}`, { method: 'DELETE' })
      )
    );

    await pool.query(
      `UPDATE scenarios SET status='inactive', deployed_rule_ids='{}', deactivated_at=NOW(), updated_at=NOW() WHERE id=$1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to deactivate scenario:', err);
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 });
  }
}
