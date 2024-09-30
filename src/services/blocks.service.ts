import crypto from 'crypto';
import type { Block } from '../models/block.model';
import { deleteBlock, getBlocksCurrentHeight, getBlocksGreaterThanHeight, saveBlock } from '../repository/blocks.repository';
import { getTransaction, saveTransaction } from '../repository/transactions.repository';
import { getAddressBalance, upsertAddressBalance } from '../repository/addresses.repository';

export async function validateBlock(block: Block): Promise<string> {
	const currentHeight = await getBlocksCurrentHeight();
	if (block.height !== 1 && block.height !== currentHeight + 1) {
		return 'The height is not valid';
	}

	let totalOutputs = 0;

	for (const transaction of block.transactions) {
		for (const output of transaction.outputs) {
			totalOutputs += output.value;
		}
	}

	let totalInputs = 0;
	for (const transaction of block.transactions) {
		for (const input of transaction.inputs) {
			totalInputs += (await getTransaction(input.txId)).outputs[input.index].value;
		}
	}
	if (totalInputs != totalOutputs && block.height != 1)
		return 'The sum of the inputs is not equal to the sum of outputs';

	if (block.id != await generateBlockId(block)) {
		return 'The block id is not correct'
	}


	return '';
}


export async function getBalance(address: string): Promise<number> {
	try {
		const balance = await getAddressBalance(address);
		return balance;
	} catch (error) {
		throw new Error(error.message);
	}
}

export async function generateBlockId(block: Block): Promise<string> {
	const transactionIds = block.transactions.map(tx => tx.id).join('');
	const hash = crypto.createHash('sha256').update(block.height + transactionIds).digest('hex');
	return hash;
}

export async function processBlock(block: Block): Promise<void> {

	await saveBlock(block);

	for (const transaction of block.transactions) {
		await saveTransaction(transaction, block.id);

		for (const output of transaction.outputs) {
			await upsertAddressBalance(output.address, output.value);
		}

		for (const input of transaction.inputs) {
			const inputTransaction = await getTransaction(input.txId);
			if (inputTransaction != null) {
				await upsertAddressBalance(inputTransaction.outputs[input.index].address, -inputTransaction.outputs[input.index].value);
			}
		}
	}


}

export async function rollbackToHeight(height: number): Promise<void> {
	const blocks = await getBlocksGreaterThanHeight(height);
	for (const block of blocks) {
		for (const transaction of block.transactions) {
			for (const output of transaction.outputs) {
				await upsertAddressBalance(output.address, -output.value);
			}
			for (const input of transaction.inputs) {
				const inputTransaction = await getTransaction(input.txId);
				if (inputTransaction != null) {
					await upsertAddressBalance(inputTransaction.outputs[input.index].address, inputTransaction.outputs[input.index].value);
				}
			}
		}
		await deleteBlock(block.id);

	}

}



