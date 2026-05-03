import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import Spinner from "../../../general/Spinner";
import ValidMobileUser from "../../../../validators/mobileUser.validator";
import { reqCreateMobileUser } from "../../../../services/api/user.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";
import { MobileUserInput } from "../../../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = "https://content.hillview.tv/images/mobile/default.jpg";

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	cancelHit?: () => void;
	saveDone?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CreatePlatformUserModal = ({
	cancelHit = () => {},
	saveDone = () => {},
}: Props) => {
	const [user, setUser] = useState<Partial<MobileUserInput>>({
		profile_image_url: DEFAULT_AVATAR,
	});
	const [saving, setSaving] = useState(false);
	const [saveActive, setSaveActive] = useState(false);

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
		setUser((prev) => applyChange(prev, modifier) as Partial<MobileUserInput>);
	};

	const deleteChange = (key: string) => {
		setUser((prev) => (removeChange(prev, key) ?? {}) as Partial<MobileUserInput>);
	};

	// ── Validation ───────────────────────────────────────────────────────────

	useEffect(() => {
		setSaveActive(!ValidMobileUser(user).error);
	}, [user]);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const runCreate = async () => {
		if (saving) return;
		const { error, value } = ValidMobileUser(user);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		try {
			const response = await reqCreateMobileUser(value);
			if (response.success) {
				toast.success("User created");
				saveDone();
			} else {
				toast.error(response.error_message || "Failed to create user");
			}
		} finally {
			setSaving(false);
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

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
				aria-label="Create Platform User"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Create Platform User
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								Add a new student to the Hillview platform
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

				{/* Content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					<div className="flex flex-col gap-5">
						<TeamModalInput
							title="Name"
							placeholder="Student's full name"
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ name: value });
								else deleteChange("name");
							}}
						/>
						<TeamModalInput
							title="Email"
							placeholder="student@example.com"
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ email: value });
								else deleteChange("email");
							}}
						/>
						<TeamModalInput
							title="Student ID"
							placeholder="Student identifier"
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ identifier: value });
								else deleteChange("identifier");
							}}
						/>
						<TeamModalInput
							title="Profile Image URL"
							placeholder="https://content.hillview.tv/..."
							value={user.profile_image_url || ""}
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ profile_image_url: value });
								else deleteChange("profile_image_url");
							}}
						/>
					</div>
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
							onClick={runCreate}
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
								"Create User"
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreatePlatformUserModal;
