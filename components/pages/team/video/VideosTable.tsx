import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faLock } from "@fortawesome/free-solid-svg-icons";
import { Video } from "../../../../types";
import Spinner from "../../../general/Spinner";

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

const formatCount = (n: number): string => {
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
	if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
	return String(n);
};

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
	public:   "bg-emerald-100 text-emerald-700",
	unlisted: "bg-blue-100 text-blue-700",
	draft:    "bg-amber-100 text-amber-700",
	archived: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: Video["status"] }) {
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
			<div className="h-[54px] w-[96px] shrink-0 rounded-lg bg-slate-100 sm:h-[72px] sm:w-[128px] animate-pulse" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="h-4 w-2/3 rounded-md bg-slate-100 animate-pulse" />
				<div className="h-3 w-1/3 rounded-md bg-slate-100 animate-pulse" />
			</div>
			<div className="hidden h-6 w-16 shrink-0 rounded-full bg-slate-100 animate-pulse sm:block" />
		</div>
	);
}

// ─── Video row ────────────────────────────────────────────────────────────────

function VideoRow({
	video,
	copiedId,
	onInspect,
	onPublish,
	onCopy,
}: {
	video: Video;
	copiedId: number | null;
	onInspect: () => void;
	onPublish: () => void;
	onCopy: () => void;
}) {
	const isPublishable = video.status.short_name !== "public";
	const isWatchable   = video.status.short_name === "public" || video.status.short_name === "unlisted";

	return (
		<div
			className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200 hover:bg-slate-50/60 cursor-pointer sm:gap-4 sm:p-4"
			onClick={onInspect}
		>
			{/* Thumbnail */}
			<div className="relative h-[54px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-[72px] sm:w-[128px] md:h-[84px] md:w-[150px]">
				<Image
					src={video.thumbnail}
					alt={video.title}
					fill
					sizes="150px"
					style={{ objectFit: "cover" }}
					className="transition-transform duration-200 group-hover:scale-105"
				/>
			</div>

			{/* Main content */}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900 sm:text-[15px]">
					{video.title}
				</p>
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
					<StatusBadge status={video.status} />
					{video.inserted_at && (
						<span>{formatDate(video.inserted_at)}</span>
					)}
					{video.creator && (
						<span className="hidden sm:inline-flex items-center gap-1">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={video.creator.profile_image_url} alt={video.creator.name} className="h-3.5 w-3.5 rounded-full object-cover" />
							{video.creator.name}
						</span>
					)}
					<span className="hidden sm:inline-flex items-center gap-1">
						<FontAwesomeIcon icon={faEye} className="h-3 w-3" />
						{formatCount(video.views)}
					</span>
					{video.downloads > 0 && (
						<span className="hidden md:inline-flex items-center gap-1">
							<FontAwesomeIcon icon={faDownload} className="h-3 w-3" />
							{formatCount(video.downloads)}
						</span>
					)}
					{video.allow_downloads ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-600">
							<FontAwesomeIcon icon={faDownload} className="h-2.5 w-2.5" />
							Downloads on
						</span>
					) : (
						<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400">
							<FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5" />
							Downloads off
						</span>
					)}
				</div>
			</div>

			{/* Stats — desktop */}
			<div className="hidden shrink-0 flex-col items-end gap-1 text-right md:flex">
				<span className="text-sm font-semibold text-slate-700">
					{formatCount(video.views)}
				</span>
				<FontAwesomeIcon icon={faEye} className="h-3 w-3 text-slate-400" />
			</div>
			{video.downloads > 0 && (
				<div className="hidden shrink-0 flex-col items-end gap-1 text-right lg:flex">
					<span className="text-sm font-semibold text-slate-700">
						{formatCount(video.downloads)}
					</span>
					<FontAwesomeIcon icon={faDownload} className="h-3 w-3 text-slate-400" />
				</div>
			)}

			{/* Actions */}
			<div
				className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2"
				onClick={(e) => e.stopPropagation()}
			>
				{isWatchable && (
					<Link
						href={"https://hillview.tv/watch?v=" + video.uuid}
						target="_blank"
						className="hidden lg:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
						onClick={(e) => e.stopPropagation()}
					>
						Watch
					</Link>
				)}
				{isWatchable && (
					<button
						onClick={(e) => { e.stopPropagation(); onCopy(); }}
						className={[
							"hidden lg:inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
							copiedId === video.id
								? "border-emerald-200 bg-emerald-50 text-emerald-700"
								: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
						].join(" ")}
					>
						{copiedId === video.id ? "Copied!" : "Copy"}
					</button>
				)}
				{isPublishable && (
					<button
						className="hidden sm:inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
						onClick={(e) => { e.stopPropagation(); onPublish(); }}
					>
						Publish
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

// ─── Table ────────────────────────────────────────────────────────────────────

type Props = {
	videos: Video[] | null;
	onInspect: (v: Video) => void;
	onPublish: (v: Video) => void;
	onLoadMore: () => void;
	loadingMore: boolean;
	hasActiveFilters?: boolean;
	onClearFilters?: () => void;
};

export const VideosTable = ({
	videos,
	onInspect,
	onPublish,
	onLoadMore,
	loadingMore,
	hasActiveFilters = false,
	onClearFilters,
}: Props) => {
	const [copiedId, setCopiedId] = useState<number | null>(null);

	const handleCopy = async (video: Video) => {
		try {
			await navigator.clipboard.writeText("https://hillview.tv/watch?v=" + video.uuid);
			setCopiedId(video.id);
			setTimeout(() => setCopiedId((prev) => (prev === video.id ? null : prev)), 2000);
		} catch {
			// Clipboard access denied — silently ignore
		}
	};

	// Loading skeleton
	if (videos === null) {
		return (
			<div className="flex flex-col gap-2 pb-8 pt-2">
				{Array.from({ length: 8 }).map((_, i) => (
					<SkeletonRow key={i} />
				))}
			</div>
		);
	}

	// Empty state
	if (videos.length === 0) {
		return hasActiveFilters ? (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
					<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<p className="text-sm font-medium text-slate-700">No videos match your filters</p>
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
		) : (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
					<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375m0 0a1.125 1.125 0 011.125-1.125H8.25m-5.625 1.125h1.5C5.496 5.25 6 5.754 6 6.375m0 0h12m0 0a1.125 1.125 0 011.125-1.125h1.5m-1.5 0V18.375m0 0c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0h-1.5" />
					</svg>
				</div>
				<p className="text-sm font-medium text-slate-700">No videos yet</p>
				<p className="mt-1 text-xs text-slate-400">Upload your first video to get started</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 pb-8 pt-2">
			{videos.map((video) => (
				<VideoRow
					key={video.id}
					video={video}
					copiedId={copiedId}
					onInspect={() => onInspect(video)}
					onPublish={() => onPublish(video)}
					onCopy={() => handleCopy(video)}
				/>
			))}

			{/* Load more */}
			<div className="flex justify-center pt-4">
				<button
					onClick={onLoadMore}
					disabled={loadingMore}
					className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loadingMore ? (
						<>
							<Spinner size={14} />
							<span>Loading…</span>
						</>
					) : (
						"Load more"
					)}
				</button>
			</div>
		</div>
	);
};
