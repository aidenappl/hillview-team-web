import type { NextApiRequest, NextApiResponse } from "next";

// Docker HEALTHCHECK and Lattice's health checks hit this.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	res.status(200).json({ status: "ok" });
}
