import { useEffect, useRef, useState } from "react";
import TeamModalInput from "../TeamModalInput";
import Spinner from "../../../general/Spinner";
import QRCodeDesigner from "./QRCodeDesigner";
import { Link } from "../../../../models/link.model";
import { LinkChanges } from "../../../../types";

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type Tab = "details" | "qr";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
	return (
		<div className="flex shrink-0 border-b border-slate-100">
			{(["details", "qr"] as Tab[]).map((t) => (
				<button
					key={t}
					onClick={() => onChange(t)}
					className={[
						"flex-1 py-2.5 text-xs font-semibold transition-colors",
						active === t
							? "border-b-2 border-blue-600 text-blue-600"
							: "text-slate-500 hover:text-slate-700",
					].join(" ")}
				>
					{t === "details" ? "Details" : "QR Code"}
				</button>
			))}
		</div>
	);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	link: Link;
	changes: LinkChanges | null;
	saving: boolean;
	inputChange: (modifier: Record<string, any>) => void;
	deleteChange: (key: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onArchive: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const LinkInspectionModal = ({
	link,
	changes,
	saving,
	inputChange,
	deleteChange,
	onCancel,
	onSave,
	onArchive,
}: Props) => {
	const isDirty = changes && Object.keys(changes).length > 0;
	const changeCount = isDirty ? Object.keys(changes).length : 0;
	const displayRoute = changes?.route ?? link.route;
	const [activeTab, setActiveTab] = useState<Tab>("details");

	// Stable ref so the keydown listener never needs to be re-registered
	const onCancelRef = useRef(onCancel);
	useEffect(() => { onCancelRef.current = onCancel; });

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancelRef.current();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={onCancel}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[520px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Edit Link"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="flex items-baseline gap-0.5 min-w-0">
								<span className="shrink-0 font-mono text-base font-normal text-slate-400 sm:text-lg">
									hillview.tv/
								</span>
								<h2 className="truncate font-mono text-base font-semibold text-slate-900 sm:text-lg">
									{displayRoute || "…"}
								</h2>
							</div>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								{isDirty
									? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
									: "Edit link details"}
							</p>
						</div>
						<button
							onClick={onCancel}
							className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							aria-label="Close"
						>
							<XIcon />
						</button>
					</div>
				</div>

				{/* Tab bar */}
				<TabBar active={activeTab} onChange={setActiveTab} />

				{/* Scrollable content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					{activeTab === "details" ? (
						<div className="flex flex-col gap-5">
							{/* Info strip */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-slate-50 px-4 py-2.5">
								{link.creator.profile_image_url && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={link.creator.profile_image_url}
										alt={link.creator.name}
										className="h-5 w-5 rounded-full object-cover"
									/>
								)}
								<span className="text-xs text-slate-600">{link.creator.name}</span>
								<span className="h-3 w-px shrink-0 bg-slate-200" />
								<span className="text-xs text-slate-500">
									{formatCount(link.clicks)} click{link.clicks !== 1 ? "s" : ""}
								</span>
								<span className="h-3 w-px shrink-0 bg-slate-200" />
								<span className="text-xs text-slate-500">{formatDate(link.inserted_at)}</span>
								{!link.active && (
									<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
										Archived
									</span>
								)}
							</div>

							{/* Route */}
							<TeamModalInput
								title="Route"
								placeholder="link-route"
								value={changes?.route ?? link.route}
								setValue={(value) => {
									const cleaned = value.replaceAll(" ", "-").replaceAll("/", "");
									if (cleaned !== link.route) inputChange({ route: cleaned });
									else deleteChange("route");
								}}
							/>

							{/* Destination */}
							<TeamModalInput
								title="Destination URL"
								placeholder="https://example.com/page"
								value={changes?.destination ?? link.destination}
								setValue={(value) => {
									if (value !== link.destination) inputChange({ destination: value });
									else deleteChange("destination");
								}}
							/>
						</div>
					) : (
						<QRCodeDesigner url={`https://hillview.tv/${displayRoute}`} />
					)}
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					{activeTab === "details" ? (
						<div className="flex items-center justify-between gap-3">
							<button
								onClick={onArchive}
								className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
							>
								Archive
							</button>
							<div className="flex items-center gap-2">
								<button
									onClick={onCancel}
									className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
								>
									Cancel
								</button>
								<button
									onClick={onSave}
									disabled={saving || !isDirty}
									className={[
										"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
										isDirty && !saving
											? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
											: "cursor-not-allowed bg-slate-300",
									].join(" ")}
								>
									{saving ? <Spinner style="light" size={16} /> : (
										<>
											Save
											{changeCount > 0 && (
												<span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
													{changeCount}
												</span>
											)}
										</>
									)}
								</button>
							</div>
						</div>
					) : (
						<div className="flex justify-end">
							<button
								onClick={onCancel}
								className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
							>
								Done
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default LinkInspectionModal;
