// Supports URLs like:
// https://customer-xxx.cloudflarestream.com/abcd1234/manifest/video.m3u8
export function extractCloudflareIdFromUrl(url: string): string | null {
	try {
		if (!url.includes("cloudflarestream.com")) return null;
		// grab the segment right before /manifest
		const m = url.match(/cloudflarestream\.com\/([^/]+)\/manifest/);
		return m?.[1] ?? null;
	} catch {
		return null;
	}
}
