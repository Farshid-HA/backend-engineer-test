import { db } from "../configuration/database";

export async function executeQuery(query: string): Promise<void> {
  try {
    await db.query(query);
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error;
  }
}

export async function createTables(): Promise<void> {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS blocks (
      id VARCHAR(64) PRIMARY KEY,
      height INT UNIQUE NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(64) PRIMARY KEY,
      "blockId" VARCHAR(64) REFERENCES blocks(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS inputs (
      id SERIAL PRIMARY KEY,
      "parentTransactionId" VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
      "txId" VARCHAR(64) NOT NULL,
      index INT NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS outputs (
      id SERIAL PRIMARY KEY,
      "parentTransactionId" VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
      address VARCHAR(255) NOT NULL,
      value NUMERIC NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);


  await executeQuery(`
    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      address VARCHAR(255) NOT NULL,
      value NUMERIC NOT NULL,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export async function dropTables(): Promise<void> {
  await executeQuery(`DROP TABLE IF EXISTS inputs CASCADE`);
  await executeQuery(`DROP TABLE IF EXISTS outputs CASCADE`);
  await executeQuery(`DROP TABLE IF EXISTS transactions CASCADE`);
  await executeQuery(`DROP TABLE IF EXISTS blocks CASCADE`);
  await executeQuery(`DROP TABLE IF EXISTS addresses CASCADE`);
}