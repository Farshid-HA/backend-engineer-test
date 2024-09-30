import type { FastifyPluginCallback } from "fastify";
import type { Block } from "../models/block.model";
import { processBlock, validateBlock, generateBlockId } from "../services/blocks.service";

export const blocksController: FastifyPluginCallback = (server, undefined, done) => {
	server.post('/', {}, async (request, reply) => {
		const block: Block = request.body;
		try {
			var validateMessage = await validateBlock(block);
			if (validateMessage == '') {
				await processBlock(block);
				reply.status(200).send({ success: true });
			} else {
				reply.status(400).send({ error: validateMessage });
			}

		} catch (error) {
			reply.status(400).send({ error: error.message });
		}
	});

	done();
}

