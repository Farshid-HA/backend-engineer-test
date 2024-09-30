import { db } from '../configuration/database';
import type { Block } from '../models/block.model';


export async function getBlocksGreaterThanHeight(height: number): Promise<Block[]> {
   const blocks = await db.query(`select 
	b.*,

    (
	SELECT json_agg(t) AS transactions
FROM  (
   SELECT *
   FROM transactions t
   CROSS JOIN LATERAL (
      SELECT json_agg(inputs) AS inputs
      FROM (
         SELECT *
         FROM inputs
         WHERE inputs."parentTransactionId" = t.id
         ) inputs
      ) i
	  CROSS JOIN LATERAL (
      SELECT json_agg(outputs) AS outputs
      FROM (
         SELECT *
         FROM outputs
         WHERE outputs."parentTransactionId" = t.id
         order by "createdAt" asc
         ) outputs
      ) o
   ) t
	WHERE t."blockId" = b.id
	GROUP BY t.id
	) as transactions
		
			
		FROM blocks b 
		WHERE height > $1 
		GROUP BY b.id
		ORDER BY height DESC`, [height]);

   return blocks.rows;
}

export async function getBlocksCurrentHeight(): Promise<number> {
   const res = await db.query('SELECT height FROM blocks ORDER BY height DESC LIMIT 1');
   if (res.rowCount == 0)
      return 0;
   return res.rows[0]?.height || 0;
}

export async function saveBlock(block: Block): Promise<void> {
   await db.query('INSERT INTO blocks(id, height) VALUES($1, $2)', [block.id, block.height]);
}

export async function deleteBlock(id: string): Promise<void> {
   await db.query('DELETE FROM blocks WHERE id = $1', [id]);
}