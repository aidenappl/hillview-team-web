import type { NextApiRequest, NextApiResponse } from "next";
import { MAX_BODY_BYTES, relayBatch } from "../../lib/monitor-relay";

// Raw NDJSON: the relay parses it line by line.
export const config = {
	api: { bodyParser: false },
};

const readBody = (req: NextApiRequest): Promise<string | null> =>
	new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		let size = 0;
		req.on("data", (chunk: Buffer) => {
			size += chunk.length;
			if (size > MAX_BODY_BYTES) {
				resolve(null);
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});

// Browser telemetry relay — see lib/monitor-relay.ts.
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).end();
		return;
	}
	const declared = Number(req.headers["content-length"] ?? 0);
	if (declared > MAX_BODY_BYTES) {
		res.status(413).end();
		return;
	}
	const body = await readBody(req);
	if (body === null) {
		res.status(413).end();
		return;
	}
	const header = (name: string) => {
		const v = req.headers[name];
		return Array.isArray(v) ? v[0] : v;
	};
	res.status(await relayBatch(header, body)).end();
}
