import { useEffect, useRef } from "react";
import Spinner from "./Spinner";

// ─── Big features ─────────────────────────────────────────────────────────────

const BIG_FEATURES: Array<{
	color: string;       // icon bg + border
	textColor: string;   // icon colour
	icon: React.ReactNode;
	title: string;
	description: string;
}> = [
	{
		color: "bg-violet-50 border-violet-100",
		textColor: "text-violet-600",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 18.75h.75v.75h-.75v-.75zM18.75 13.5h.75v.75h-.75v-.75zM18.75 18.75h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
			</svg>
		),
		title: "QR Code System",
		description: "QR codes for any link. Drop in a custom centre image, pick your colours, and download. Works great for printed materials.",
	},
	{
		color: "bg-emerald-50 border-emerald-100",
		textColor: "text-emerald-600",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
			</svg>
		),
		title: "Reliability & Error Reporting",
		description: "Fixed a bunch of flaky token refresh and request failures. Errors now tell you what actually went wrong instead of failing silently.",
	},
	{
		color: "bg-blue-50 border-blue-100",
		textColor: "text-blue-600",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
			</svg>
		),
		title: "Better Metrics",
		description: "View and download counts are more accurate now, and the data shows up in more places across videos and playlists.",
	},
	{
		color: "bg-amber-50 border-amber-100",
		textColor: "text-amber-600",
		icon: (
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
			</svg>
		),
		title: "Spotlight Overhaul",
		description: "The spotlight system was rebuilt from the ground up. Drag to reorder, search and preview videos before adding, and see live rank changes before you save.",
	},
];

// ─── Smaller updates ──────────────────────────────────────────────────────────

const UPDATES: Array<{
	icon: React.ReactNode;
	title: string;
	detail: string;
}> = [
	{
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
			</svg>
		),
		title: "Dashboard Redesign",
		detail: "Everything got restyled — cleaner tables, new modals, works better on smaller screens.",
	},
	{
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
			</svg>
		),
		title: "Users",
		detail: "Team and Platform users are now split into tabs. Inspection panels redone for both.",
	},
	{
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375m0 0a1.125 1.125 0 011.125-1.125H8.25m-5.625 1.125h1.5C5.496 5.25 6 5.754 6 6.375m0 0h12m0 0a1.125 1.125 0 011.125-1.125h1.5m-1.5 0V18.375m0 0c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0h-1.5" />
			</svg>
		),
		title: "Videos",
		detail: "List, inspection modal, and frame grabber all updated. Spotlight reworked. Copy link added.",
	},
	{
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
			</svg>
		),
		title: "Playlists & Links",
		detail: "Both pages got filtering and sorting. Copy link is on every row.",
	},
	{
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
			</svg>
		),
		title: "Assets & Checkouts",
		detail: "Assets have a proper inspection panel now with photo upload. Checkouts table was cleaned up.",
	},
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	onAcknowledge: () => void;
	acknowledging: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

const WhatsNewModal = ({ onAcknowledge, acknowledging }: Props) => {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		buttonRef.current?.focus();
	}, []);

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" aria-hidden="true" />

			{/* Modal */}
			<div
				className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[85vh] sm:w-[560px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="What's New"
			>
				{/* Header */}
				<div className="shrink-0 px-6 pb-4 pt-6">
					<div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
						<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
						</svg>
						Dashboard Update
					</div>
					<h2 className="text-xl font-bold text-slate-900 sm:text-2xl">What&apos;s New</h2>
					<p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s new.</p>
				</div>

				<div className="shrink-0 border-t border-slate-100" />

				{/* Scrollable body */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-5">

					{/* Big features */}
					<div className="flex flex-col gap-3">
						{BIG_FEATURES.map((f) => (
							<div key={f.title} className={`flex items-start gap-3 rounded-xl border p-4 ${f.color}`}>
								<div className={`mt-0.5 shrink-0 ${f.textColor}`}>{f.icon}</div>
								<div>
									<p className={`text-sm font-semibold ${f.textColor}`}>{f.title}</p>
									<p className="mt-0.5 text-xs leading-relaxed text-slate-600">{f.description}</p>
								</div>
							</div>
						))}
					</div>

					{/* Divider */}
					<div className="my-5 flex items-center gap-3">
						<div className="flex-1 border-t border-slate-100" />
						<span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Also in this update</span>
						<div className="flex-1 border-t border-slate-100" />
					</div>

					{/* Smaller updates */}
					<div className="flex flex-col gap-3">
						{UPDATES.map((u) => (
							<div key={u.title} className="flex items-start gap-3">
								<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
									{u.icon}
								</div>
								<div>
									<span className="text-xs font-semibold text-slate-700">{u.title} </span>
									<span className="text-xs text-slate-500">{u.detail}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-6 py-4">
					<button
						ref={buttonRef}
						onClick={onAcknowledge}
						disabled={acknowledging}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200/60 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{acknowledging ? (
							<>
								<Spinner style="light" size={16} />
								<span>Saving…</span>
							</>
						) : (
							"Got it — dismiss"
						)}
					</button>
				</div>
			</div>
		</>
	);
};

export default WhatsNewModal;
