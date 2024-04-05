// pages/api/get-upload-url.js
export default async function handler(req: any, res: any) {
	if (req.method === "POST") {
		const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
		const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
		const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;

		const uploadLength = req.headers["upload-length"];
		const uploadMetadata = req.headers["upload-metadata"];

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
				"Tus-Resumable": "1.0.0",
				"Upload-Length": uploadLength,
				"Upload-Metadata": uploadMetadata,
			},
		});

		const destination = response.headers.get("Location");

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Expose-Headers", "Location");
		res.setHeader("location", destination);
		res.status(200).send({ location: destination });
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
