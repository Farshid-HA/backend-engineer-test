import Fastify from 'fastify';
import { blocksController } from './controllers/blocks.controller';
import { balanceController } from './controllers/balance.controller';
import { createDbTables, dropDbTables } from './services/database.service';
import { rollbackController } from './controllers/rollback.controller';
import { port } from '../src/configuration/server'

const fastify = Fastify({ logger: true });

fastify.register(blocksController, { prefix: `/blocks` });
fastify.register(balanceController, { prefix: `/balance` });
fastify.register(rollbackController, { prefix: `/rollback` });

try {
	await dropDbTables();
	await createDbTables();
	await fastify.listen({
		port: port,
		host: '0.0.0.0'
	});
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
