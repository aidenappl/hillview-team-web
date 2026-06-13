// Seconds -> human clock (e.g. 202 -> "3:22", 3725 -> "1:02:05"). "" if missing.
const formatDuration = (seconds: number | null | undefined): string => {
	if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "";
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export default formatDuration;
