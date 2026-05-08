import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Button from "../../../components/general/Button";
import { useCallback, useEffect, useState } from "react";
import { Link } from "../../../models/link.model";
import PageModal from "../../../components/general/PageModal";
import LinkInspectionModal from "../../../components/pages/team/link/LinkInspectionModal";
import CreateLinkModal from "../../../components/pages/team/link/CreateLinkModal";
import toast from "react-hot-toast";
import FilterSortBar, { SortOption, StatusOption } from "../../../components/pages/team/FilterSortBar";

import { reqUpdateLink, reqGetLinks } from "../../../services/api/link.service";
import { removeChange, applyChange } from "../../../utils/changeTracking";
import { LinkChanges } from "../../../types";

// ─── Filter config ────────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
	{ value: "date_desc", label: "Newest" },
	{ value: "date_asc", label: "Oldest" },
	{ value: "clicks_desc", label: "Most Clicks" },
	{ value: "clicks_asc", label: "Least Clicks" },
];

const STATUS_OPTIONS: StatusOption[] = [
	{ id: 1, label: "Active", activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700" },
	{ id: 2, label: "Archived", activeClass: "border-slate-300 bg-slate-100 text-slate-700" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCount = (n: number): string => {
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
	if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
	return String(n);
};

const getDomain = (url: string): string => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
};

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID = "grid gap-x-4 items-center px-4";
const COLS = "grid-cols-[1fr_auto] sm:grid-cols-[190px_1fr_auto] lg:grid-cols-[190px_1fr_110px_56px_auto]";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			<div className="h-6 w-28 animate-pulse rounded-md bg-slate-100" />
			<div className="hidden h-3.5 w-48 animate-pulse rounded-md bg-slate-100 sm:block" />
			<div className="hidden h-3.5 w-20 animate-pulse rounded-md bg-slate-100 lg:block" />
			<div className="hidden h-3.5 w-8 animate-pulse rounded-md bg-slate-100 lg:block" />
			<div className="h-7 w-16 animate-pulse rounded-lg bg-slate-100" />
		</div>
	);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasActiveFilters, onClearFilters }: { hasActiveFilters?: boolean; onClearFilters?: () => void }) {
	if (hasActiveFilters) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
					<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<p className="text-sm font-medium text-slate-700">No links match your filters</p>
				<p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters</p>
				{onClearFilters && (
					<button
						onClick={onClearFilters}
						className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
					>
						Clear filters
					</button>
				)}
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
				<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No links yet</p>
			<p className="mt-1 text-xs text-slate-400">Create your first short link to get started</p>
		</div>
	);
}

// ─── Link row ─────────────────────────────────────────────────────────────────

function LinkRow({
	link,
	copiedId,
	onEdit,
	onCopy,
}: {
	link: Link;
	copiedId: number | null;
	onEdit: () => void;
	onCopy: (e: React.MouseEvent) => void;
}) {
	const isCopied = copiedId === link.id;

	return (
		<div
			className={`${GRID} ${COLS} cursor-pointer border-b border-slate-50 py-3 transition-colors last:border-b-0 hover:bg-slate-50/60`}
			onClick={onEdit}
		>
			{/* Route */}
			<div className="flex min-w-0 flex-col gap-0.5">
				<div className="flex items-center gap-1.5">
					<code className="inline-block max-w-[160px] truncate rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
						/{link.route}
					</code>
					{!link.active && (
						<span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
							Archived
						</span>
					)}
				</div>
				{/* Destination as subtitle on mobile */}
				<p className="truncate text-xs text-blue-500 sm:hidden">{getDomain(link.destination)}</p>
			</div>

			{/* Destination — sm+ */}
			<a
				href={link.destination}
				target="_blank"
				rel="noopener noreferrer"
				className="hidden truncate text-xs text-blue-600 hover:text-blue-700 hover:underline sm:block"
				onClick={(e) => e.stopPropagation()}
				title={link.destination}
			>
				{link.destination}
			</a>

			{/* Creator — lg+ */}
			<p className="hidden truncate text-xs text-slate-500 lg:block">{link.creator.name}</p>

			{/* Clicks — lg+ */}
			<p className="hidden text-xs font-medium text-slate-700 lg:block">{formatCount(link.clicks)}</p>

			{/* Actions */}
			<div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
				<button
					onClick={(e) => { e.stopPropagation(); onEdit(); }}
					className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
				>
					Edit
				</button>
				<button
					onClick={onCopy}
					className={[
						"hidden sm:inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
						isCopied
							? "border-emerald-200 bg-emerald-50 text-emerald-700"
							: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
					].join(" ")}
				>
					{isCopied ? "Copied!" : "Copy"}
				</button>
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LinksPage = () => {
	const router = useRouter();
	const [links, setLinks] = useState<Link[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const [showConfirmArchive, setShowConfirmArchive] = useState(false);
	const [showCreateLink, setShowCreateLink] = useState(false);
	const [copiedId, setCopiedId] = useState<number | null>(null);

	// Filters
	const [search, setSearch] = useState("");
	const [sortValue, setSortValue] = useState("date_desc");
	const [activeStatuses, setActiveStatuses] = useState<number[]>([1]);

	// Inspector
	const [selectedLink, setSelectedLink] = useState<Link | null>(null);
	const [saving, setSaving] = useState(false);
	const [changes, setChanges] = useState<LinkChanges | null>(null);

	// ── Data ─────────────────────────────────────────────────────────────────

	// Derive active param: both selected = undefined (all), only one = explicit
	const getActiveParam = (statuses: number[]): boolean | undefined => {
		const hasActive = statuses.includes(1);
		const hasArchived = statuses.includes(2);
		if (hasActive && hasArchived) return undefined;
		if (hasActive) return true;
		if (hasArchived) return false;
		return undefined; // neither → show all
	};

	const initialize = useCallback(async () => {
		setLinks(null);
		setOffset(0);
		try {
			const [sortBy, sort] = sortValue.split("_") as ["date" | "clicks", "asc" | "desc"];
			const activeParam = getActiveParam(activeStatuses);
			const response = await reqGetLinks({
				limit: 20,
				offset: 0,
				...(search ? { search } : {}),
				sort_by: sortBy,
				sort,
				...(activeParam !== undefined ? { active: activeParam } : {}),
			});
			if (response.success) {
				setLinks(response.data ?? []);
			} else {
				setLinks([]);
				toast.error("Failed to load links");
			}
		} catch {
			setLinks([]);
			toast.error("Failed to load links");
		}
	}, [search, sortValue, activeStatuses]);

	const loadMore = async () => {
		setLoadingMore(true);
		const newOffset = offset + 20;
		const [sortBy, sort] = sortValue.split("_") as ["date" | "clicks", "asc" | "desc"];
		const activeParam = getActiveParam(activeStatuses);
		try {
			const response = await reqGetLinks({
				limit: 20,
				offset: newOffset,
				...(search ? { search } : {}),
				sort_by: sortBy,
				sort,
				...(activeParam !== undefined ? { active: activeParam } : {}),
			});
			if (response.success) {
				setLinks((prev) => [...(prev ?? []), ...(response.data ?? [])]);
				setOffset(newOffset);
			} else {
				toast.error("Failed to load more links");
			}
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		initialize();
	}, [initialize]);

	const handleStatusToggle = (id: number) => {
		setActiveStatuses((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	// ── Change tracking ──────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setChanges((prev) => applyChange(prev, modifier) as LinkChanges);
	};

	const deleteChange = (key: string) => {
		setChanges((prev) => removeChange(prev, key) as LinkChanges | null);
	};

	// ── Inspector actions ────────────────────────────────────────────────────

	const cancelLinkInspection = () => {
		setSelectedLink(null);
		setChanges(null);
		setSaving(false);
	};

	const saveLinkInspection = async () => {
		if (!changes || Object.keys(changes).length === 0 || !selectedLink) {
			setSelectedLink(null);
			return;
		}
		setSaving(true);
		try {
			const response = await reqUpdateLink(selectedLink.id, changes);
			if (response.success) {
				// Update in-place — no list flash
				setLinks((prev) =>
					prev?.map((l) => (l.id === selectedLink.id ? { ...l, ...changes } : l)) ?? null
				);
				setSelectedLink(null);
				setChanges(null);
				setSaving(false);
			} else {
				setSaving(false);
				toast.error("Failed to save changes", { position: "top-center" });
			}
		} catch {
			setSaving(false);
			toast.error("An unexpected error occurred", { position: "top-center" });
		}
	};

	const archiveLink = async () => {
		if (!selectedLink) return;
		try {
			const response = await reqUpdateLink(selectedLink.id, { active: false });
			if (response.success) {
				setLinks((prev) =>
					prev?.map((l) => (l.id === selectedLink.id ? { ...l, active: false } : l)) ?? null
				);
				setSelectedLink(null);
				setChanges(null);
				setSaving(false);
			} else {
				toast.error("Failed to archive link", { position: "top-center" });
			}
		} catch {
			toast.error("An unexpected error occurred", { position: "top-center" });
		}
	};

	const handleCopy = async (e: React.MouseEvent, link: Link) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText("https://hillview.tv/" + link.route);
			setCopiedId(link.id);
			setTimeout(() => setCopiedId((prev) => (prev === link.id ? null : prev)), 2000);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<TeamContainer pageTitle="Links" router={router}>
			<PageModal
				titleText="Archive Link"
				bodyText="Are you sure you want to archive this link? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={archiveLink}
				setShow={setShowConfirmArchive}
				show={showConfirmArchive}
			/>

			{showCreateLink && (
				<CreateLinkModal
					cancelHit={() => setShowCreateLink(false)}
					saveDone={() => {
						setShowCreateLink(false);
						initialize();
					}}
				/>
			)}

			{selectedLink && (
				<LinkInspectionModal
					link={selectedLink}
					changes={changes}
					saving={saving}
					inputChange={inputChange}
					deleteChange={deleteChange}
					onCancel={cancelLinkInspection}
					onSave={saveLinkInspection}
					onArchive={() => setShowConfirmArchive(true)}
				/>
			)}

			{/* Header — desktop */}
			<div className="hidden sm:block">
				<TeamHeader title="Custom Links">
					<Button onClick={() => setShowCreateLink(true)}>Create Link</Button>
				</TeamHeader>
			</div>

			{/* Header — mobile */}
			<div className="flex sm:hidden items-center justify-between py-3">
				<p className="text-sm font-semibold text-slate-700">Links</p>
				<Button onClick={() => setShowCreateLink(true)}>New Link</Button>
			</div>

			{/* Filters */}
			<FilterSortBar
				search={search}
				onSearch={setSearch}
				searchPlaceholder="Search routes…"
				sortValue={sortValue}
				onSort={setSortValue}
				sortOptions={SORT_OPTIONS}
				statusOptions={STATUS_OPTIONS}
				activeStatuses={activeStatuses}
				onStatusToggle={handleStatusToggle}
			/>

			{/* Table card */}
			<div className="pb-8 pt-2">
				<div className="overflow-hidden rounded-xl border border-slate-100">
					{/* Column headers */}
					<div className={`${GRID} ${COLS} border-b border-slate-100 bg-slate-50/80 py-2 text-xs font-semibold text-slate-500`}>
						<p>Route</p>
						<p className="hidden sm:block">Destination</p>
						<p className="hidden lg:block">Creator</p>
						<p className="hidden lg:block">Clicks</p>
						<div className="min-w-[52px] sm:min-w-[110px]" /> {/* actions spacer */}
					</div>

					{/* Body */}
					{links === null ? (
						Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
					) : links.length === 0 ? (
						<EmptyState
							hasActiveFilters={!!search || activeStatuses.length > 0}
							onClearFilters={() => { setSearch(""); setActiveStatuses([]); }}
						/>
					) : (
						links.map((link) => (
							<LinkRow
								key={link.id}
								link={link}
								copiedId={copiedId}
								onEdit={() => setSelectedLink(link)}
								onCopy={(e) => handleCopy(e, link)}
							/>
						))
					)}
				</div>

				{/* Load more — only show when a full page was returned */}
				{links && links.length > 0 && links.length % 20 === 0 && (
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

export default LinksPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Links",
		},
	};
};
