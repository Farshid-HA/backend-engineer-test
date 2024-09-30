import { db } from "../configuration/database";
import type { Transaction } from "../models/transaction.model";

export async function saveTransaction(transaction: Transaction, blockId: string): Promise<void> {

	await db.query('INSERT INTO transactions(id, "blockId") VALUES($1, $2)', [transaction.id, blockId]);

	for (const input of transaction.inputs) {
		await db.query('INSERT INTO inputs("parentTransactionId", "txId",index) VALUES($1, $2, $3)', [transaction.id, input.txId, input.index]);
	}

	for (const output of transaction.outputs) {
		await db.query('INSERT INTO outputs("parentTransactionId", address, value) VALUES($1, $2, $3)', [transaction.id, output.address, output.value]);
	}
}

export async function getTransaction(transaction_Id: string): Promise<Transaction> {

	const transactionQuery = `
	SELECT t.*, 
			json_agg(i.*) AS inputs, 
			json_agg(o.* order by o."createdAt" asc) AS outputs
	FROM transactions t
	LEFT JOIN inputs i ON t.id = i."parentTransactionId"
	LEFT JOIN outputs o ON t.id = o."parentTransactionId"
	WHERE t.id = $1
	GROUP BY t.id;
`;

	const transaction = await db.query(transactionQuery, [transaction_Id])
	return transaction.rowCount != 0 ? transaction.rows[0] : null;
}