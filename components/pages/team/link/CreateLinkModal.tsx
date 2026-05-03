import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import Spinner from "../../../general/Spinner";
import QRCodeDesigner from "./QRCodeDesigner";
import ValidLink from "../../../../validators/link.validator";
import { reqCreateLink } from "../../../../services/api/link.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";
import { LinkInput } from "../../../../types";

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
	cancelHit?: () => void;
	saveDone?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CreateLinkModal = ({
	cancelHit = () => {},
	saveDone = () => {},
}: Props) => {
	const [link, setLink] = useState<Partial<LinkInput>>({});
	const [saving, setSaving] = useState(false);
	const [saveActive, setSaveActive] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("details");

	// Stable ref for Escape key
	const cancelHitRef = useRef(cancelHit);
	useEffect(() => { cancelHitRef.current = cancelHit; });

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") cancelHitRef.current();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Helpers ──────────────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setLink((prev) => applyChange(prev, modifier) as Partial<LinkInput>);
	};

	const deleteChange = (key: string) => {
		setLink((prev) => (removeChange(prev, key) ?? {}) as Partial<LinkInput>);
	};

	// ── Validation ───────────────────────────────────────────────────────────

	useEffect(() => {
		setSaveActive(!ValidLink(link).error);
	}, [link]);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const runCreateLink = async () => {
		if (saving) return;
		const { error, value } = ValidLink(link);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		try {
			const response = await reqCreateLink(value);
			if (response.success) {
				toast.success("Link created");
				saveDone();
			} else {
				toast.error(response.error_message || "Failed to create link");
			}
		} finally {
			setSaving(false);
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	const qrUrl = link.route ? `https://hillview.tv/${link.route}` : "";

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
				onClick={!saving ? cancelHit : undefined}
				aria-hidden="true"
			/>

			{/* Modal — bottom sheet on mobile, centred on sm+ */}
			<div
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[480px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Create Link"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Create Link
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								Add a new short link for hillview.tv
							</p>
						</div>
						<button
							onClick={cancelHit}
							className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							aria-label="Close"
						>
							<XIcon />
						</button>
					</div>
				</div>

				{/* Tab bar */}
				<TabBar active={activeTab} onChange={setActiveTab} />

				{/* Content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					{activeTab === "details" ? (
						<div className="flex flex-col gap-5">
							{/* Route */}
							<div className="flex flex-col gap-1.5">
								<TeamModalInput
									title="Route"
									placeholder="about, contact, team…"
									value={link.route || ""}
									required
									setValue={(value) => {
										if (value.length > 0) {
											inputChange({ route: value.replaceAll(" ", "-").replaceAll("/", "") });
										} else {
											deleteChange("route");
										}
									}}
								/>
								{link.route && (
									<p className="text-xs text-slate-400">
										Will be available at{" "}
										<span className="font-mono text-slate-600">hillview.tv/{link.route}</span>
									</p>
								)}
							</div>

							{/* Destination */}
							<TeamModalInput
								title="Destination URL"
								placeholder="https://example.com/page"
								value={link.destination || ""}
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ destination: value });
									else deleteChange("destination");
								}}
							/>
						</div>
					) : qrUrl ? (
						<QRCodeDesigner url={qrUrl} />
					) : (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
								<svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
									<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75z" />
								</svg>
							</div>
							<p className="text-sm font-medium text-slate-700">Enter a route first</p>
							<p className="mt-1 text-xs text-slate-400">The QR code will appear once you set the route</p>
							<button
								onClick={() => setActiveTab("details")}
								className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
							>
								Go to Details
							</button>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={cancelHit}
							className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
						>
							Cancel
						</button>
						<button
							onClick={runCreateLink}
							disabled={!saveActive || saving}
							className={[
								"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
								saveActive && !saving
									? "bg-blue-600 shadow-blue-200/60 hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-300",
							].join(" ")}
						>
							{saving ? (
								<>
									<Spinner style="light" size={16} />
									<span>Creating…</span>
								</>
							) : (
								"Create Link"
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreateLinkModal;
