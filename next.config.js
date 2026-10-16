/** @type {import('next').NextConfig} */
const nextConfig = {
	// Self-contained server for the Docker image (Lattice stack 38).
	output: "standalone",
	reactStrictMode: true,
	poweredByHeader: false,
	images: {
		remotePatterns: [
			{ hostname: "content.hillview.tv" },
			{ hostname: "google.com" },
			{ hostname: "customer-nakrsdfbtn3mdz5z.cloudflarestream.com" },
			{ hostname: "lh3.googleusercontent.com" },
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
		];
	},
};

module.exports = nextConfig;
