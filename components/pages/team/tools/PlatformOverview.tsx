import { useEffect, useState } from "react";
import { reqGetVideos } from "../../../../services/api/video.service";
import { reqGetAssets } from "../../../../services/api/asset.service";
import { reqGetLinks } from "../../../../services/api/link.service";
import { reqGetPlaylists } from "../../../../services/api/playlist.service";
import { reqGetCheckouts } from "../../../../services/api/checkout.service";
import { reqGetUsers, reqGetMobileUsers } from "../../../../services/api/user.service";
import Spinner from "../../../general/Spinner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
	label: string;
	value: number | null;
	breakdown?: { label: string; value: number; color: string }[];
}

// ─── Component ──────────────────────────────────────────────────────────────

const PlatformOverview = () => {
	const [stats, setStats] = useState<StatCard[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);

			const [
				videosRes,
				assetsRes,
				linksActiveRes,
				linksArchivedRes,
				playlistsRes,
				checkoutsRes,
				usersRes,
				mobileUsersRes,
			] = await Promise.all([
				reqGetVideos({ limit: 1000, offset: 0 }),
				reqGetAssets({ limit: 1000, offset: 0, sort: "DESC" }),
				reqGetLinks({ limit: 1000, offset: 0, active: true }),
				reqGetLinks({ limit: 1000, offset: 0, active: false }),
				reqGetPlaylists({ limit: 1000, offset: 0 }),
				reqGetCheckouts({ limit: 1000, offset: 0 }),
				reqGetUsers({ limit: 1000, offset: 0 }),
				reqGetMobileUsers({ limit: 1000, offset: 0 }),
			]);

			const videos = videosRes.success ? videosRes.data : [];
			const assets = assetsRes.success ? assetsRes.data : [];
			const activeLinks = linksActiveRes.success ? linksActiveRes.data : [];
			const archivedLinks = linksArchivedRes.success ? linksArchivedRes.data : [];
			const playlists = playlistsRes.success ? playlistsRes.data : [];
			const checkouts = checkoutsRes.success ? checkoutsRes.data : [];
			const users = usersRes.success ? usersRes.data : [];
			const mobileUsers = mobileUsersRes.success ? mobileUsersRes.data : [];

			// Video breakdown by status
			const videoPublic = videos.filter((v) => v.status.short_name === "public").length;
			const videoDraft = videos.filter((v) => v.status.short_name === "draft").length;
			const videoUnlisted = videos.filter((v) => v.status.short_name === "unlisted").length;
			const videoArchived = videos.filter((v) => v.status.short_name === "archived").length;

			// Asset breakdown by status
			const assetInService = assets.filter((a) => a.status.short_name === "in_service").length;
			const assetReady = assets.filter((a) => a.status.short_name === "ready_for_sale").length;
			const assetRepair = assets.filter((a) => a.status.short_name === "pending_repair").length;
			const assetBroken = assets.filter((a) => a.status.short_name === "broken").length;
			const assetLost = assets.filter((a) => a.status.short_name === "lost").length;

			// User breakdown by role
			const adminUsers = users.filter((u) => u.authentication.short_name === "admin").length;
			const studentUsers = users.filter((u) => u.authentication.short_name === "student").length;
			const pendingUsers = users.filter((u) => u.authentication.short_name === "unauthorized").length;

			// Checkout breakdown
			const activeCheckouts = checkouts.filter((c) => c.checkout_status.short_name === "checked_out" || !c.time_in).length;
			const completedCheckouts = checkouts.filter((c) => c.checkout_status.short_name === "checked_in" || !!c.time_in).length;

			setStats([
				{
					label: "Videos",
					value: videos.length,
					breakdown: [
						{ label: "Public", value: videoPublic, color: "bg-emerald-500" },
						{ label: "Draft", value: videoDraft, color: "bg-amber-500" },
						{ label: "Unlisted", value: videoUnlisted, color: "bg-blue-500" },
						{ label: "Archived", value: videoArchived, color: "bg-red-400" },
					],
				},
				{
					label: "Assets",
					value: assets.length,
					breakdown: [
						{ label: "In Service", value: assetInService, color: "bg-emerald-500" },
						{ label: "Ready", value: assetReady, color: "bg-blue-500" },
						{ label: "Repair", value: assetRepair, color: "bg-amber-500" },
						{ label: "Broken", value: assetBroken, color: "bg-red-400" },
						{ label: "Lost", value: assetLost, color: "bg-slate-400" },
					],
				},
				{
					label: "Links",
					value: activeLinks.length + archivedLinks.length,
					breakdown: [
						{ label: "Active", value: activeLinks.length, color: "bg-emerald-500" },
						{ label: "Archived", value: archivedLinks.length, color: "bg-slate-400" },
					],
				},
				{
					label: "Playlists",
					value: playlists.length,
				},
				{
					label: "Team Users",
					value: users.length,
					breakdown: [
						{ label: "Admin", value: adminUsers, color: "bg-blue-500" },
						{ label: "Student", value: studentUsers, color: "bg-emerald-500" },
						{ label: "Pending", value: pendingUsers, color: "bg-amber-500" },
					],
				},
				{
					label: "Mobile Users",
					value: mobileUsers.length,
				},
				{
					label: "Checkouts",
					value: checkouts.length,
					breakdown: [
						{ label: "Active", value: activeCheckouts, color: "bg-amber-500" },
						{ label: "Returned", value: completedCheckouts, color: "bg-emerald-500" },
					],
				},
			]);

			setLoading(false);
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
				>
					<p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
						{stat.label}
					</p>
					<p className="text-3xl font-bold text-slate-800 tabular-nums">
						{stat.value ?? "—"}
					</p>

					{stat.breakdown && stat.breakdown.length > 0 && (
						<div className="mt-3 pt-3 border-t border-slate-50">
							{/* Bar */}
							{stat.value && stat.value > 0 && (
								<div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mb-2.5">
									{stat.breakdown.map((b) =>
										b.value > 0 ? (
											<div
												key={b.label}
												className={`${b.color} transition-all duration-300`}
												style={{ width: `${(b.value / stat.value!) * 100}%` }}
											/>
										) : null
									)}
								</div>
							)}
							{/* Legend */}
							<div className="flex flex-wrap gap-x-3 gap-y-1">
								{stat.breakdown.map((b) => (
									<div key={b.label} className="flex items-center gap-1.5">
										<span className={`inline-block h-2 w-2 rounded-full ${b.color}`} />
										<span className="text-[11px] text-slate-500">
											{b.label}{" "}
											<span className="font-medium text-slate-700">{b.value}</span>
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default PlatformOverview;
