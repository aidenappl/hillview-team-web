import { useCallback, useEffect, useState } from "react";
import { reqGetAssets, reqUpdateAsset } from "../../../../services/api/asset.service";
import { Asset } from "../../../../types";
import { AssetStatuses } from "../../../../models/assetStatus.model";
import Spinner from "../../../general/Spinner";
import toast from "react-hot-toast";

// ─── Component ──────────────────────────────────────────────────────────────

const BulkAssetTool = () => {
	const [assets, setAssets] = useState<Asset[] | null>(null);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [targetStatus, setTargetStatus] = useState<number | "">("");
	const [applying, setApplying] = useState(false);
	const [search, setSearch] = useState("");

	const fetchAssets = useCallback(async () => {
		setAssets(null);
		setSelected(new Set());
		const res = await reqGetAssets({
			limit: 500,
			offset: 0,
			sort: "DESC",
			...(search ? { search } : {}),
		});
		if (res.success) {
			setAssets(res.data);
		} else {
			setAssets([]);
			toast.error("Failed to load assets");
		}
	}, [search]);

	useEffect(() => {
		fetchAssets();
	}, [fetchAssets]);

	const toggleSelect = (id: number) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleAll = () => {
		if (!assets) return;
		if (selected.size === assets.length) {
			setSelected(new Set());
		} else {
			setSelected(new Set(assets.map((a) => a.id)));
		}
	};

	const applyBulkStatus = async () => {
		if (!targetStatus || selected.size === 0) return;
		setApplying(true);
		let succeeded = 0;
		let failed = 0;

		const ids = Array.from(selected);
		for (let i = 0; i < ids.length; i += 5) {
			const batch = ids.slice(i, i + 5);
			const results = await Promise.all(
				batch.map((id) => reqUpdateAsset(id, { status: targetStatus as number }))
			);
			results.forEach((r) => {
				if (r.success) succeeded++;
				else failed++;
			});
		}

		setApplying(false);
		if (failed === 0) {
			toast.success(`Updated ${succeeded} asset${succeeded !== 1 ? "s" : ""}`, { position: "top-center" });
		} else {
			toast.error(`${succeeded} succeeded, ${failed} failed`, { position: "top-center" });
		}
		setSelected(new Set());
		setTargetStatus("");
		fetchAssets();
	};

	const statusLabel = (id: number) => AssetStatuses.find((s) => s.id === id)?.name ?? "Unknown";

	const statusBadge = (shortName: string) => {
		const map: Record<string, string> = {
			in_service: "bg-emerald-50 text-emerald-700 border-emerald-200",
			ready_for_sale: "bg-blue-50 text-blue-700 border-blue-200",
			pending_repair: "bg-amber-50 text-amber-700 border-amber-200",
			broken: "bg-red-50 text-red-600 border-red-200",
			lost: "bg-slate-100 text-slate-600 border-slate-300",
			warning: "bg-orange-50 text-orange-700 border-orange-200",
		};
		return map[shortName] ?? "bg-slate-50 text-slate-600 border-slate-200";
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Controls */}
			<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
				{/* Search */}
				<div className="flex flex-col gap-1.5 flex-1 min-w-0">
					<label className="text-xs font-semibold text-slate-600">Search</label>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search assets..."
						className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
					/>
				</div>

				{/* Divider */}
				<div className="hidden sm:block h-9 w-px bg-slate-200" />

				{/* Target status */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-semibold text-slate-600">Set Status To</label>
					<select
						value={targetStatus}
						onChange={(e) => setTargetStatus(e.target.value ? Number(e.target.value) : "")}
						className="h-9 rounded-lg border border-slate-200 bg-white px-3 pr-7 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none cursor-pointer"
					>
						<option value="">Select status...</option>
						{AssetStatuses.map((s) => (
							<option key={s.id} value={s.id}>{s.name}</option>
						))}
					</select>
				</div>

				{/* Apply button */}
				<button
					onClick={applyBulkStatus}
					disabled={!targetStatus || selected.size === 0 || applying}
					className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{applying ? (
						<>
							<svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Applying...
						</>
					) : (
						<>Apply to {selected.size} selected</>
					)}
				</button>
			</div>

			{/* Table */}
			{assets === null ? (
				<div className="flex items-center justify-center py-12">
					<Spinner />
				</div>
			) : assets.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<p className="text-sm font-medium text-slate-700">No assets found</p>
					<p className="mt-1 text-xs text-slate-400">Try adjusting your search</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-slate-100">
					{/* Header */}
					<div className="grid grid-cols-[40px_1fr_120px_120px] items-center gap-x-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-500">
						<div className="flex items-center justify-center">
							<input
								type="checkbox"
								checked={assets.length > 0 && selected.size === assets.length}
								onChange={toggleAll}
								className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
							/>
						</div>
						<p>Name</p>
						<p className="hidden sm:block">Category</p>
						<p className="hidden sm:block">Status</p>
					</div>

					{/* Rows */}
					<div className="max-h-[400px] overflow-y-auto">
						{assets.map((asset) => (
							<div
								key={asset.id}
								onClick={() => toggleSelect(asset.id)}
								className={`grid grid-cols-[40px_1fr_120px_120px] items-center gap-x-3 border-b border-slate-50 px-4 py-2.5 transition-colors cursor-pointer last:border-b-0 ${
									selected.has(asset.id) ? "bg-blue-50/50" : "hover:bg-slate-50/60"
								}`}
							>
								<div className="flex items-center justify-center">
									<input
										type="checkbox"
										checked={selected.has(asset.id)}
										onChange={() => toggleSelect(asset.id)}
										onClick={(e) => e.stopPropagation()}
										className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
									/>
								</div>
								<div className="min-w-0">
									<p className="text-sm text-slate-700 truncate">{asset.name}</p>
									<p className="text-[11px] text-slate-400 truncate">{asset.identifier}</p>
								</div>
								<p className="hidden sm:block text-xs text-slate-500 truncate">{asset.category.name}</p>
								<div className="hidden sm:block">
									<span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge(asset.status.short_name)}`}>
										{asset.status.name}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Selection info */}
			{selected.size > 0 && targetStatus && (
				<div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
					<p className="text-sm text-blue-700">
						<span className="font-semibold">{selected.size}</span> asset{selected.size !== 1 ? "s" : ""} will be set to{" "}
						<span className="font-semibold">{statusLabel(targetStatus as number)}</span>
					</p>
				</div>
			)}
		</div>
	);
};

export default BulkAssetTool;
