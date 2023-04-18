/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	images: {
		domains: [
			"content.hillview.tv",
			"google.com",
			"customer-nakrsdfbtn3mdz5z.cloudflarestream.com",
			"lh3.googleusercontent.com"
		],
	},
};

module.exports = nextConfig;
