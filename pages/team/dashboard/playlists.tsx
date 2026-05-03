import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Button from "../../../components/general/Button";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Playlist } from "../../../models/playlist.model";
import Image from "next/image";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import CreatePlaylistModal from "../../../components/pages/team/playlist/CreatePlaylistModal";
import PlaylistInspectionModal from "../../../components/pages/team/playlist/PlaylistInspectionModal";
import { PlaylistStatus } from "../../../models/playlistStatus.model";

import { reqUpdatePlaylist, reqGetPlaylists } from "../../../services/api/playlist.service";
import { PlaylistChanges } from "../../../types";
import { removeChange, applyChange } from "../../../utils/changeTracking";
import FilterSortBar, { SortOption, StatusOption } from "../../../components/pages/team/FilterSortBar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
	try {
		return new Date(iso).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return "";
	}
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
	active:   "bg-emerald-100 text-emerald-700",
	hidden:   "bg-blue-100 text-blue-700",
	archived: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: { name: string; short_name: string } }) {
	const cls = STATUS_STYLES[status.short_name] ?? "bg-slate-100 text-slate-600";
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
			{status.name}
		</span>
	);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:gap-4 sm:p-4">
			<div className="h-[54px] w-[96px] shrink-0 animate-pulse rounded-lg bg-slate-100 sm:h-[72px] sm:w-[128px]" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
				<div className="h-3 w-1/3 animate-pulse rounded-md bg-slate-100" />
			</div>
			<div className="hidden h-6 w-12 shrink-0 animate-pulse rounded-full bg-slate-100 sm:block" />
		</div>
	);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasActiveFilters, onClearFilters }: { hasActiveFilters?: boolean; onClearFilters?: () => void }) {
	if (hasActiveFilters) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
					<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<p className="text-sm font-medium text-slate-700">No playlists match your filters</p>
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
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
				<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No playlists yet</p>
			<p className="mt-1 text-xs text-slate-400">Create your first playlist to get started</p>
		</div>
	);
}

// ─── Playlist row ─────────────────────────────────────────────────────────────

function PlaylistRow({
	playlist,
	copiedId,
	onInspect,
	onCopy,
}: {
	playlist: Playlist;
	copiedId: number | null;
	onInspect: () => void;
	onCopy: () => void;
}) {
	const videoCount = playlist.videos?.length ?? 0;
	const isOpenable = playlist.status.short_name !== "archived";

	return (
		<div
			className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200 hover:bg-slate-50/60 sm:gap-4 sm:p-4"
			onClick={onInspect}
		>
			{/* Thumbnail */}
			<div className="relative h-[54px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-[72px] sm:w-[128px] md:h-[84px] md:w-[150px]">
				<Image
					src={playlist.banner_image}
					alt={playlist.name}
					fill
					sizes="150px"
					style={{ objectFit: "cover" }}
					className="transition-transform duration-200 group-hover:scale-105"
				/>
			</div>

			{/* Main content */}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="line-clamp-1 text-sm font-medium leading-snug text-slate-900 sm:text-[15px]">
					{playlist.name}
				</p>
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
					<StatusBadge status={playlist.status} />
					<span>/{playlist.route}</span>
					{playlist.inserted_at && (
						<span className="hidden sm:inline">{formatDate(playlist.inserted_at)}</span>
					)}
					<span className="sm:hidden">
						{videoCount} video{videoCount !== 1 ? "s" : ""}
					</span>
				</div>
			</div>

			{/* Video count — desktop */}
			<div className="hidden shrink-0 flex-col items-end gap-1 text-right sm:flex">
				<span className="text-sm font-semibold text-slate-700">{videoCount}</span>
				<span className="text-xs text-slate-400">videos</span>
			</div>

			{/* Actions */}
			<div
				className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2"
				onClick={(e) => e.stopPropagation()}
			>
				{isOpenable && (
					<Link
						href={"https://hillview.tv/playlist/" + playlist.route}
						target="_blank"
						className="hidden lg:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
						onClick={(e) => e.stopPropagation()}
					>
						Open
					</Link>
				)}
				{isOpenable && (
					<button
						onClick={(e) => { e.stopPropagation(); onCopy(); }}
						className={[
							"hidden lg:inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
							copiedId === playlist.id
								? "border-emerald-200 bg-emerald-50 text-emerald-700"
								: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
						].join(" ")}
					>
						{copiedId === playlist.id ? "Copied!" : "Copy"}
					</button>
				)}
				<button
					className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
					onClick={(e) => { e.stopPropagation(); onInspect(); }}
				>
					Edit
				</button>
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Filter config ────────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
	{ value: "date_desc", label: "Newest first" },
	{ value: "date_asc",  label: "Oldest first" },
];

const STATUS_OPTIONS: StatusOption[] = [
	{ id: 1, label: "Active",   activeClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
	{ id: 3, label: "Hidden",   activeClass: "border-blue-200 bg-blue-50 text-blue-700" },
	{ id: 2, label: "Archived", activeClass: "border-red-200 bg-red-50 text-red-600" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PlaylistsPage = () => {
	const router = useRouter();
	const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
	const [showConfirmArchive, setShowConfirmArchive] = useState(false);
	const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

	// Filter + sort state
	const [search, setSearch] = useState("");
	const [sortValue, setSortValue] = useState("date_desc");
	const [activeStatuses, setActiveStatuses] = useState<number[]>([]);

	// Inspector
	const [saving, setSaving] = useState(false);
	const [changes, setChanges] = useState<PlaylistChanges | null>(null);
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
	const [copiedId, setCopiedId] = useState<number | null>(null);

	// ── Data ─────────────────────────────────────────────────────────────────

	const initialize = useCallback(async (background = false) => {
		if (!background) setPlaylists(null);
		const [col, dir] = sortValue.split("_") as ["date", "asc" | "desc"];
		const response = await reqGetPlaylists({
			limit: 50,
			offset: 0,
			...(search.trim() && { search: search.trim() }),
			sort_by: col,
			sort: dir,
			...(activeStatuses.length > 0 && { status: activeStatuses.join(",") }),
		});
		if (response.success) {
			setPlaylists(response.data ?? []);
		} else {
			setPlaylists([]);
			toast.error("Failed to load playlists");
		}
	}, [search, sortValue, activeStatuses]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		initialize();
	}, [initialize]);

	// ── Change tracking ──────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setChanges((prev) => applyChange(prev, modifier) as PlaylistChanges);
	};

	const deleteChange = (key: string) => {
		setChanges((prev) => removeChange(prev, key) as PlaylistChanges | null);
	};

	// ── Inspector actions ────────────────────────────────────────────────────

	const cancelPlaylistInspection = () => {
		setSelectedPlaylist(null);
		setChanges(null);
		setSaving(false);
	};

	const savePlaylistInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await reqUpdatePlaylist(selectedPlaylist!.id, changes);
			if (response.success) {
				setSelectedPlaylist(null);
				setChanges(null);
				setSaving(false);
				initialize(true);
			} else {
				setSaving(false);
				toast.error("Failed to save changes", { position: "top-center" });
			}
		} else {
			setSelectedPlaylist(null);
		}
	};

	const handleCopy = (playlist: Playlist) => {
		navigator.clipboard.writeText("https://hillview.tv/playlist/" + playlist.route);
		setCopiedId(playlist.id);
		setTimeout(() => setCopiedId((prev) => (prev === playlist.id ? null : prev)), 2000);
	};

	const archivePlaylist = async () => {
		if (!selectedPlaylist) return;
		const response = await reqUpdatePlaylist(selectedPlaylist.id, {
			status: PlaylistStatus.Archived,
		});
		if (response.success) {
			setSelectedPlaylist(null);
			setChanges(null);
			setSaving(false);
			initialize(true);
		} else {
			toast.error("Failed to archive playlist", { position: "top-center" });
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<TeamContainer pageTitle="Playlists" router={router}>
			<PageModal
				titleText="Archive Playlist"
				bodyText="Are you sure you want to archive this playlist? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={archivePlaylist}
				setShow={setShowConfirmArchive}
				show={showConfirmArchive}
			/>

			{showCreatePlaylist && (
				<CreatePlaylistModal
					saveDone={() => {
						setShowCreatePlaylist(false);
						initialize(true);
					}}
					cancelHit={() => setShowCreatePlaylist(false)}
				/>
			)}

			{selectedPlaylist && (
				<PlaylistInspectionModal
					playlist={selectedPlaylist}
					changes={changes}
					saving={saving}
					inputChange={inputChange}
					deleteChange={deleteChange}
					onCancel={cancelPlaylistInspection}
					onSave={savePlaylistInspection}
					onArchive={() => setShowConfirmArchive(true)}
				/>
			)}

			<TeamHeader title="Platform Playlists">
				<Button onClick={() => setShowCreatePlaylist(true)}>
					Create Playlist
				</Button>
			</TeamHeader>

			<FilterSortBar
				search={search}
				onSearch={setSearch}
				searchPlaceholder="Search playlists…"
				sortValue={sortValue}
				onSort={setSortValue}
				sortOptions={SORT_OPTIONS}
				statusOptions={STATUS_OPTIONS}
				activeStatuses={activeStatuses}
				onStatusToggle={(id) =>
					setActiveStatuses((prev) =>
						prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
					)
				}
			/>

			{/* List */}
			{playlists === null ? (
				<div className="flex flex-col gap-2 pb-8 pt-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<SkeletonRow key={i} />
					))}
				</div>
			) : playlists.length === 0 ? (
				<EmptyState
					hasActiveFilters={!!search.trim() || activeStatuses.length > 0}
					onClearFilters={() => { setSearch(""); setActiveStatuses([]); }}
				/>
			) : (
				<div className="flex flex-col gap-2 pb-8 pt-2">
					{playlists.map((playlist) => (
						<PlaylistRow
							key={playlist.id}
							playlist={playlist}
							copiedId={copiedId}
							onInspect={() => setSelectedPlaylist(playlist)}
							onCopy={() => handleCopy(playlist)}
						/>
					))}
				</div>
			)}
		</TeamContainer>
	);
};

export default PlaylistsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Playlists",
		},
	};
};
