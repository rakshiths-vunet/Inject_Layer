
import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database
const dbPath = path.join(process.cwd(), 'brum.db');
const db = new Database(dbPath);

// Create the activities table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT,
    userAgent TEXT
  )
`);

export interface ActivityLog {
    id: number;
    user: string;
    action: string;
    details: string;
    timestamp: string;
    ip: string;
    userAgent: string;
}

export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const stmt = db.prepare(`
    INSERT INTO activities (user, action, details, ip, userAgent)
    VALUES (?, ?, ?, ?, ?)
  `);
    return stmt.run(activity.user, activity.action, activity.details, activity.ip || 'Unknown', activity.userAgent || 'Unknown');
}

export function getRecentActivities(limit: number = 50): ActivityLog[] {
    const stmt = db.prepare(`
    SELECT * FROM activities
    ORDER BY timestamp DESC
    LIMIT ?
  `);
    return stmt.all(limit) as ActivityLog[];
}
