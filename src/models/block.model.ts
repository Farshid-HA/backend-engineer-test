import type { Transaction } from "./transaction.model";

export interface Block {
	id: string;
	height: number;
	transactions: Array<Transaction>;
}
