import { Pool } from 'pg';

export const db = new Pool({
	connectionString: process.env.DATABASE_URL,
});


db.connect().catch(err => {
	console.error('Database connection error', err.stack);
	process.exit(1);
});

