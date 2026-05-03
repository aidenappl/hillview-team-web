import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Button from "../../../components/general/Button";
import PageModal from "../../../components/general/PageModal";
import AssetInspectionModal from "../../../components/pages/team/asset/AssetInspectionModal";
import CreateAssetModal from "../../../components/pages/team/asset/CreateAssetModal";
import { AssetStatus } from "../../../models/assetStatus.model";
import { Asset } from "../../../models/asset.model";
import { reqUpdateAsset, reqGetAssets } from "../../../services/api/asset.service";
import { removeChange, applyChange } from "../../../utils/changeTracking";
import { AssetChanges } from "../../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
	in_service: "bg-emerald-100 text-emerald-700",
	ready_for_sale: "bg-blue-100 text-blue-700",
	pending_repair: "bg-amber-100 text-amber-700",
	broken: "bg-red-100 text-red-600",
	lost: "bg-red-100 text-red-600",
	warning: "bg-orange-100 text-orange-700",
};

const STATUS_LABEL: Record<string, string> = {
	ready_for_sale: "Ready",
	in_service: "In Service",
	pending_repair: "Pending",
	broken: "Broken",
	lost: "Lost",
	warning: "Warning",
};

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID = "grid gap-x-4 items-center px-4";
const COLS = "grid-cols-[52px_1fr_auto] sm:grid-cols-[52px_1fr_100px_100px_auto] lg:grid-cols-[52px_1fr_100px_130px_100px_auto]";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			<div className="h-9 w-[50px] animate-pulse rounded-lg bg-slate-100" />
			<div className="h-3.5 w-28 animate-pulse rounded-md bg-slate-100" />
			<div className="hidden h-3.5 w-20 animate-pulse rounded-md bg-slate-100 sm:block" />
			<div className="hidden h-5 w-16 animate-pulse rounded-full bg-slate-100 sm:block" />
			<div className="h-7 w-14 animate-pulse rounded-lg bg-slate-100" />
		</div>
	);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
				<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
					<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No assets yet</p>
			<p className="mt-1 text-xs text-slate-400">Create your first asset to get started</p>
		</div>
	);
}

// ─── Asset row ────────────────────────────────────────────────────────────────

function AssetRow({
	asset,
	onEdit,
}: {
	asset: Asset;
	onEdit: () => void;
}) {
	const badgeCls = STATUS_BADGE[asset.status.short_name] ?? "bg-slate-100 text-slate-600";

	return (
		<div
			className={`${GRID} ${COLS} cursor-pointer border-b border-slate-50 py-3 transition-colors last:border-b-0 hover:bg-slate-50/60`}
			onClick={onEdit}
		>
			{/* Image */}
			<div className="relative h-9 w-[50px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
				<Image
					src={asset.image_url}
					alt={asset.name}
					fill
					sizes="50px"
					style={{ objectFit: "cover" }}
				/>
			</div>

			{/* Name */}
			<div className="flex min-w-0 flex-col gap-0.5">
				<p className="truncate text-sm font-medium text-slate-800">{asset.name}</p>
				{/* Category subtitle on mobile */}
				<p className="truncate text-xs text-slate-400 sm:hidden">{asset.category.name}</p>
			</div>

			{/* Category — sm+ */}
			<p className="hidden truncate text-xs text-slate-500 sm:block">{asset.category.name}</p>

			{/* Identifier — sm+ */}
			<p className="hidden truncate font-mono text-xs text-slate-500 sm:block">{asset.identifier}</p>

			{/* Status badge — sm+ */}
			<div className="hidden sm:flex items-center">
				<span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeCls}`}>
					{STATUS_LABEL[asset.status.short_name] ?? asset.status.name}
				</span>
			</div>

			{/* Actions */}
			<div onClick={(e) => e.stopPropagation()}>
				<button
					onClick={(e) => { e.stopPropagation(); onEdit(); }}
					className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
				>
					Edit
				</button>
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AssetsPage = () => {
	const router = useRouter();
	const [assets, setAssets] = useState<Asset[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const [showCreateAsset, setShowCreateAsset] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	// Inspector
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [changes, setChanges] = useState<AssetChanges | null>(null);
	const [saving, setSaving] = useState(false);

	// ── Data ─────────────────────────────────────────────────────────────────

	const initialize = async () => {
		setAssets(null);
		setOffset(0);
		const response = await reqGetAssets({ limit: 25, sort: "DESC", offset: 0 });
		if (response.success) {
			setAssets(response.data ?? []);
		} else {
			setAssets([]);
			toast.error("Failed to load assets");
		}
	};

	const loadMore = async () => {
		setLoadingMore(true);
		const newOffset = offset + 25;
		try {
			const response = await reqGetAssets({ limit: 25, sort: "DESC", offset: newOffset });
			if (response.success) {
				setAssets((prev) => [...(prev ?? []), ...response.data]);
				setOffset(newOffset);
			} else {
				toast.error("Failed to load more assets");
			}
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		initialize();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Change tracking ──────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setChanges((prev) => applyChange(prev, modifier) as AssetChanges);
	};

	const deleteChange = (key: string) => {
		setChanges((prev) => removeChange(prev, key) as AssetChanges | null);
	};

	// ── Inspector actions ────────────────────────────────────────────────────

	const cancelInspection = () => {
		setSelectedAsset(null);
		setChanges(null);
		setSaving(false);
	};

	const saveInspection = async () => {
		if (!changes || Object.keys(changes).length === 0 || !selectedAsset) {
			setSelectedAsset(null);
			return;
		}
		setSaving(true);
		const response = await reqUpdateAsset(selectedAsset.id, changes);
		if (response.success) {
			// In-place update
			setAssets((prev) =>
				prev?.map((a) => {
					if (a.id !== selectedAsset.id) return a;
					return {
						...a,
						...(changes.name !== undefined && { name: changes.name }),
						...(changes.identifier !== undefined && { identifier: changes.identifier }),
						...(changes.image_url !== undefined && { image_url: changes.image_url }),
						...(changes.status !== undefined && {
							status: { ...a.status, id: changes.status },
						}),
						...(changes.category !== undefined && {
							category: { ...a.category, id: changes.category },
						}),
						...(changes.metadata !== undefined && {
							metadata: { ...a.metadata, ...changes.metadata },
						}),
					};
				}) ?? null
			);
			setSelectedAsset(null);
			setChanges(null);
			setSaving(false);
		} else {
			setSaving(false);
			toast.error("Failed to save changes", { position: "top-center" });
		}
	};

	const deleteAsset = async () => {
		if (!selectedAsset) return;
		const response = await reqUpdateAsset(selectedAsset.id, { status: AssetStatus.Deleted });
		if (response.success) {
			setAssets((prev) => prev?.filter((a) => a.id !== selectedAsset.id) ?? null);
			setSelectedAsset(null);
			setChanges(null);
		} else {
			toast.error("Failed to delete asset", { position: "top-center" });
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<TeamContainer pageTitle="Assets" router={router}>
			<PageModal
				titleText="Delete Asset"
				bodyText="Are you sure you want to delete this asset? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={deleteAsset}
				setShow={setShowConfirmDelete}
				show={showConfirmDelete}
			/>

			{showCreateAsset && (
				<CreateAssetModal
					cancelHit={() => setShowCreateAsset(false)}
					saveDone={() => {
						setShowCreateAsset(false);
						initialize();
					}}
				/>
			)}

			{selectedAsset && (
				<AssetInspectionModal
					asset={selectedAsset}
					changes={changes}
					saving={saving}
					inputChange={inputChange}
					deleteChange={deleteChange}
					onCancel={cancelInspection}
					onSave={saveInspection}
					onDelete={() => setShowConfirmDelete(true)}
				/>
			)}

			{/* Header — desktop */}
			<div className="hidden sm:block">
				<TeamHeader title="System Assets">
					<Button onClick={() => setShowCreateAsset(true)}>Create Asset</Button>
				</TeamHeader>
			</div>

			{/* Header — mobile */}
			<div className="flex sm:hidden items-center justify-between py-3">
				<p className="text-sm font-semibold text-slate-700">Assets</p>
				<Button onClick={() => setShowCreateAsset(true)}>New Asset</Button>
			</div>

			{/* Table card */}
			<div className="pb-8 pt-2">
				<div className="overflow-hidden rounded-xl border border-slate-100">
					{/* Column headers */}
					<div className={`${GRID} ${COLS} border-b border-slate-100 bg-slate-50/80 py-2 text-xs font-semibold text-slate-500`}>
						<div /> {/* image spacer */}
						<p>Asset</p>
						<p className="hidden sm:block">Category</p>
						<p className="hidden sm:block">Identifier</p>
						<p className="hidden sm:block">Status</p>
						<div className="min-w-[52px]" /> {/* actions spacer */}
					</div>

					{/* Body */}
					{assets === null ? (
						Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
					) : assets.length === 0 ? (
						<EmptyState />
					) : (
						assets.map((asset) => (
							<AssetRow
								key={asset.id}
								asset={asset}
								onEdit={() => setSelectedAsset(asset)}
							/>
						))
					)}
				</div>

				{/* Load more */}
				{assets && assets.length > 0 && assets.length % 25 === 0 && (
					<div className="flex justify-center pt-4">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loadingMore ? "Loading…" : "Load more"}
						</button>
					</div>
				)}
			</div>
		</TeamContainer>
	);
};

export default AssetsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Assets",
		},
	};
};
