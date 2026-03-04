import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ddl = `
      -- Connect to: postgresql://chaos:chaos@10.1.92.179:5432/ChaosPlane

      CREATE TABLE IF NOT EXISTS scenarios (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          TEXT NOT NULL,
        description   TEXT,
        sites         TEXT[],                    -- e.g. ['react-v1', 'global']
        status        TEXT NOT NULL DEFAULT 'draft',
                                                 -- 'draft' | 'active' | 'inactive'
        injections    JSONB NOT NULL DEFAULT '[]',
                                                 -- Full UI config array (ScenarioInjection[])
        deployed_rule_ids TEXT[],                -- IDs of rules actually pushed to chaos engine
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        activated_at  TIMESTAMPTZ,
        deactivated_at TIMESTAMPTZ,
        schedule_start_time TIMESTAMPTZ,
        schedule_end_time TIMESTAMPTZ,
        cron_expression VARCHAR(255),
        timeout_minutes INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
      CREATE INDEX IF NOT EXISTS idx_scenarios_created ON scenarios(created_at DESC);
    `;

    await pool.query(ddl);

    return NextResponse.json({ success: true, message: 'Database schema initialized successfully.' });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
