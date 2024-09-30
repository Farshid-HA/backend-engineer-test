import type { FastifyPluginCallback } from "fastify";
import { rollbackToHeight } from "../services/blocks.service";

export const rollbackController : FastifyPluginCallback = (server, undefined, done) => {
    server.post('', {}, async (request, reply) => {
		const { height } = request.query;
		try {
			await rollbackToHeight(height);
            reply.status(200).send({ success: true });
		} catch (error) {
			reply.status(400).send({ error: error.message });
		}
	});

	done();
}