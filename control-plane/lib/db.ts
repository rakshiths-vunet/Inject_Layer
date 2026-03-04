import { Pool } from 'pg';

export const pool = new Pool({
    host: '10.1.92.179',
    port: 5432,
    database: 'ChaosPlane',
    user: 'chaos',
    password: 'chaos',
});
