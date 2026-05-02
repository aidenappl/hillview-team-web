/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{ hostname: "content.hillview.tv" },
			{ hostname: "google.com" },
			{ hostname: "customer-nakrsdfbtn3mdz5z.cloudflarestream.com" },
			{ hostname: "lh3.googleusercontent.com" },
		],
	},
};

module.exports = nextConfig;
