import type { FastifyPluginCallback } from "fastify";
import { getBalance } from "../services/blocks.service";

export const balanceController: FastifyPluginCallback = (server, undefined, done) => {
	server.get('/:address', {}, async (request, reply) => {
		let { address } = request.params;
		try {
			address = address.substring(1);
			const balance = await getBalance(address);
			reply.send({ balance });
		} catch (error) {
			reply.status(400).send({ error: error.message });
		}
	});

	done();
}