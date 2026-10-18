// Mux urls. Stored video urls are https://stream.mux.com/{playback_id}.m3u8.

const MUX_STREAM = "https://stream.mux.com/";

export function extractMuxPlaybackIdFromUrl(url: string): string | null {
	if (!url.startsWith(MUX_STREAM)) return null;
	const m = url.slice(MUX_STREAM.length).match(/^([A-Za-z0-9]+)\.m3u8(?:[?#]|$)/);
	return m?.[1] ?? null;
}

// The MP4 every Hillview Mux asset is created with.
export const muxDownloadUrl = (playbackId: string) =>
	`${MUX_STREAM}${playbackId}/highest.mp4`;

// Playback id behind a Mux MP4 download url, or null.
export function extractMuxPlaybackIdFromDownloadUrl(url: string): string | null {
	const m = url.match(/^https:\/\/stream\.mux\.com\/([A-Za-z0-9]+)\/highest\.mp4/);
	return m?.[1] ?? null;
}

// Poster frame at `seconds` into the video.
export const muxThumbnailUrl = (playbackId: string, seconds: number) =>
	`https://image.mux.com/${playbackId}/thumbnail.jpg?time=${seconds}&width=1280&height=720`;
