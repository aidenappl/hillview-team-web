import { useEffect, useRef } from "react";
import TeamModalInput from "../TeamModalInput";
import Spinner from "../../../general/Spinner";
import { MobileUser, MobileUserChanges } from "../../../../types";

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

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	user: MobileUser;
	changes: MobileUserChanges | null;
	saving: boolean;
	saveActive: boolean;
	inputChange: (modifier: Record<string, any>) => void;
	deleteChange: (key: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onDelete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const PlatformUserInspectionModal = ({
	user,
	changes,
	saving,
	saveActive,
	inputChange,
	deleteChange,
	onCancel,
	onSave,
	onDelete,
}: Props) => {
	const isDirty = changes && Object.keys(changes).length > 0;
	const changeCount = isDirty ? Object.keys(changes).length : 0;

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
				aria-label="Edit Platform User"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={user.profile_image_url}
								alt={user.name}
								className="h-10 w-10 shrink-0 rounded-full object-cover"
							/>
							<div className="min-w-0">
								<h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
									{user.name}
								</h2>
								<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
									{isDirty
										? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
										: "Edit platform user details"}
								</p>
							</div>
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

				{/* Info strip */}
				<div className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 sm:px-6">
					<span className="text-xs text-slate-500">Joined {formatDate(user.inserted_at)}</span>
					<span className="h-3 w-px shrink-0 bg-slate-200" />
					<span className="font-mono text-xs text-slate-500">{user.nfc_identifier}</span>
					<span className="h-3 w-px shrink-0 bg-slate-200" />
					<span className="text-xs text-slate-500">{user.status.name}</span>
				</div>

				{/* Content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					<div className="flex flex-col gap-5">
						<TeamModalInput
							title="Name"
							placeholder="User's full name"
							value={changes?.name ?? user.name}
							setValue={(value) => {
								if (value !== user.name) inputChange({ name: value });
								else deleteChange("name");
							}}
						/>
						<TeamModalInput
							title="Email"
							placeholder="User's email address"
							value={changes?.email ?? user.email}
							setValue={(value) => {
								if (value !== user.email) inputChange({ email: value });
								else deleteChange("email");
							}}
						/>
						<TeamModalInput
							title="Student ID"
							placeholder="Student identifier"
							value={changes?.nfc_identifier ?? user.nfc_identifier}
							setValue={(value) => {
								if (value !== user.nfc_identifier) inputChange({ nfc_identifier: value });
								else deleteChange("nfc_identifier");
							}}
						/>
						<TeamModalInput
							title="Profile Image URL"
							placeholder="https://content.hillview.tv/..."
							value={changes?.profile_image_url ?? user.profile_image_url}
							setValue={(value) => {
								if (value !== user.profile_image_url) inputChange({ profile_image_url: value });
								else deleteChange("profile_image_url");
							}}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={onDelete}
							className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
						>
							Delete
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
								disabled={saving || !saveActive}
								className={[
									"flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all",
									saveActive && !saving
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
				</div>
			</div>
		</>
	);
};

export default PlatformUserInspectionModal;
