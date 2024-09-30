import { createTables, dropTables } from "../repository/database.repository";

export async function createDbTables() {
    try {
        await createTables();
    } catch (error) {
        console.error('Error generating schema:', error.message);
    }
}

export async function dropDbTables() {
    try {
        await dropTables();
    } catch (error) {
        console.error('Error dropping tables:', error.message);
    }
}