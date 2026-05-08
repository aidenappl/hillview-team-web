import { useState } from "react";
import { reqGetVideos } from "../../../../services/api/video.service";
import { reqGetAssets } from "../../../../services/api/asset.service";
import { reqGetLinks } from "../../../../services/api/link.service";
import { reqGetPlaylists } from "../../../../services/api/playlist.service";
import { reqGetCheckouts } from "../../../../services/api/checkout.service";
import { reqGetUsers, reqGetMobileUsers } from "../../../../services/api/user.service";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type ExportType = "videos" | "assets" | "links" | "playlists" | "checkouts" | "users" | "mobile_users";

interface ExportOption {
	id: ExportType;
	label: string;
	description: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const EXPORT_OPTIONS: ExportOption[] = [
	{ id: "videos", label: "Videos", description: "All videos with title, status, views, downloads, creator" },
	{ id: "assets", label: "Assets", description: "All assets with name, category, status, metadata" },
	{ id: "links", label: "Links", description: "All links with route, destination, clicks, status" },
	{ id: "playlists", label: "Playlists", description: "All playlists with name, route, status, video count" },
	{ id: "checkouts", label: "Checkouts", description: "All checkouts with asset, user, status, times" },
	{ id: "users", label: "Team Users", description: "All team users with name, email, role, last active" },
	{ id: "mobile_users", label: "Mobile Users", description: "All mobile users with name, email, NFC ID, status" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const escapeCsvField = (val: string): string => {
	if (val.includes(",") || val.includes('"') || val.includes("\n")) {
		return `"${val.replace(/"/g, '""')}"`;
	}
	return val;
};

const toCsv = (headers: string[], rows: string[][]): string => {
	const headerLine = headers.map(escapeCsvField).join(",");
	const dataLines = rows.map((row) => row.map(escapeCsvField).join(","));
	return [headerLine, ...dataLines].join("\n");
};

const downloadCsv = (csv: string, filename: string) => {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

// ─── Fetchers ────────────────────────────────────────────────────────────────

const fetchAndExport: Record<ExportType, () => Promise<void>> = {
	videos: async () => {
		const res = await reqGetVideos({ limit: 10000, offset: 0 });
		if (!res.success) throw new Error("Failed to fetch videos");
		const headers = ["ID", "Title", "Description", "Status", "Views", "Downloads", "Creator", "URL", "Created"];
		const rows = res.data.map((v) => [
			String(v.id),
			v.title,
			v.description,
			v.status.name,
			String(v.views),
			String(v.downloads),
			v.creator?.name ?? "",
			v.url,
			v.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-videos");
	},
	assets: async () => {
		const res = await reqGetAssets({ limit: 10000, offset: 0, sort: "DESC" });
		if (!res.success) throw new Error("Failed to fetch assets");
		const headers = ["ID", "Name", "Identifier", "Category", "Status", "Serial Number", "Manufacturer", "Model", "Notes", "Created"];
		const rows = res.data.map((a) => [
			String(a.id),
			a.name,
			a.identifier,
			a.category.name,
			a.status.name,
			a.metadata?.serial_number ?? "",
			a.metadata?.manufacturer ?? "",
			a.metadata?.model ?? "",
			a.metadata?.notes ?? "",
			a.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-assets");
	},
	links: async () => {
		const [activeRes, archivedRes] = await Promise.all([
			reqGetLinks({ limit: 10000, offset: 0, active: true }),
			reqGetLinks({ limit: 10000, offset: 0, active: false }),
		]);
		const active = activeRes.success ? activeRes.data : [];
		const archived = archivedRes.success ? archivedRes.data : [];
		const allLinks = [...active, ...archived];
		if (allLinks.length === 0) throw new Error("No links found");
		const headers = ["ID", "Route", "Destination", "Active", "Clicks", "Creator", "Created"];
		const rows = allLinks.map((l) => [
			String(l.id),
			l.route,
			l.destination,
			l.active ? "Yes" : "No",
			String(l.clicks),
			l.creator.name,
			l.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-links");
	},
	playlists: async () => {
		const res = await reqGetPlaylists({ limit: 10000, offset: 0 });
		if (!res.success) throw new Error("Failed to fetch playlists");
		const headers = ["ID", "Name", "Route", "Description", "Status", "Videos", "Created"];
		const rows = res.data.map((p) => [
			String(p.id),
			p.name,
			p.route,
			p.description,
			p.status.name,
			String(p.videos?.length ?? 0),
			p.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-playlists");
	},
	checkouts: async () => {
		const res = await reqGetCheckouts({ limit: 10000, offset: 0 });
		if (!res.success) throw new Error("Failed to fetch checkouts");
		const headers = ["ID", "Asset", "Asset ID", "User", "Status", "Notes", "Offsite", "Time Out", "Time In", "Expected In"];
		const rows = res.data.map((c) => [
			String(c.id),
			c.asset?.name ?? "",
			String(c.asset_id),
			c.user?.name ?? "",
			c.checkout_status.name,
			c.checkout_notes ?? "",
			c.offsite ? "Yes" : "No",
			c.time_out ?? "",
			c.time_in ?? "",
			c.expected_in ?? "",
		]);
		downloadCsv(toCsv(headers, rows), "hillview-checkouts");
	},
	users: async () => {
		const res = await reqGetUsers({ limit: 10000, offset: 0 });
		if (!res.success) throw new Error("Failed to fetch users");
		const headers = ["ID", "Name", "Username", "Email", "Role", "Last Active", "Created"];
		const rows = res.data.map((u) => [
			String(u.id),
			u.name,
			u.username,
			u.email,
			u.authentication.name,
			u.last_active ?? "",
			u.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-users");
	},
	mobile_users: async () => {
		const res = await reqGetMobileUsers({ limit: 10000, offset: 0 });
		if (!res.success) throw new Error("Failed to fetch mobile users");
		const headers = ["ID", "Name", "Email", "NFC Identifier", "Status", "Created"];
		const rows = res.data.map((u) => [
			String(u.id),
			u.name,
			u.email,
			u.nfc_identifier,
			u.status.name,
			u.inserted_at,
		]);
		downloadCsv(toCsv(headers, rows), "hillview-mobile-users");
	},
};

// ─── Component ──────────────────────────────────────────────────────────────

const DataExportTool = () => {
	const [exporting, setExporting] = useState<ExportType | null>(null);

	const handleExport = async (type: ExportType) => {
		setExporting(type);
		try {
			await fetchAndExport[type]();
			toast.success("Export downloaded", { position: "top-center" });
		} catch (err: any) {
			toast.error(err.message || "Export failed", { position: "top-center" });
		} finally {
			setExporting(null);
		}
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{EXPORT_OPTIONS.map((opt) => {
				const isExporting = exporting === opt.id;
				return (
					<button
						key={opt.id}
						onClick={() => handleExport(opt.id)}
						disabled={!!exporting}
						className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
							{isExporting ? (
								<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
								</svg>
							) : (
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
								</svg>
							)}
						</div>
						<div className="min-w-0">
							<p className="text-sm font-semibold text-slate-700">{opt.label}</p>
							<p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{opt.description}</p>
						</div>
					</button>
				);
			})}
		</div>
	);
};

export default DataExportTool;
