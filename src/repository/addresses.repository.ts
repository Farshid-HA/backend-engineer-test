import { db } from "../configuration/database";

export async function getAddressBalance(address: string): Promise<number> {
	const res = await db.query('select value from addresses where address =$1', [address]);
	if (res.rowCount == 0)
		throw new Error(`Failed to get balance`);
	return res.rows[0];
}

export async function upsertAddressBalance(address: string, value: number): Promise<void> {
	const response = await db.query('select * from addresses where address=$1', [address]);
	if (response.rowCount != 0) {
		await db.query('UPDATE addresses SET value=value+$1  WHERE address=$2', [value, address]);
	} else {
		await db.query('INSERT INTO addresses(address,value)  VALUES($1,$2)', [address, value]);
	}
}
