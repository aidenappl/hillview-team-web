import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalSelect from "../TeamModalSelect";
import Spinner from "../../../general/Spinner";
import ValidAsset from "../../../../validators/asset.validator";
import { AssetCategories } from "../../../../models/assetCategories.model";
import { reqCreateAsset } from "../../../../services/api/asset.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";
import { AssetInput } from "../../../../types";

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

const CreateAssetModal = ({
	cancelHit = () => {},
	saveDone = () => {},
}: Props) => {
	const [asset, setAsset] = useState<Partial<AssetInput>>({
		category: AssetCategories[0].id,
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
		setAsset((prev) => applyChange(prev, modifier) as Partial<AssetInput>);
	};

	const deleteChange = (key: string) => {
		setAsset((prev) => (removeChange(prev, key) ?? {}) as Partial<AssetInput>);
	};

	// ── Validation ───────────────────────────────────────────────────────────

	useEffect(() => {
		setSaveActive(!ValidAsset(asset).error);
	}, [asset]);

	// ── Handler ──────────────────────────────────────────────────────────────

	const runCreate = async () => {
		if (saving) return;
		const { error, value } = ValidAsset(asset);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		try {
			const response = await reqCreateAsset(value);
			if (response.success) {
				toast.success("Asset created");
				saveDone();
			} else {
				toast.error(response.error_message || "Failed to create asset");
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
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[600px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Create Asset"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
								Create Asset
							</h2>
							<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
								Register a new asset in the system
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
						{/* Name + Identifier */}
						<div className="grid grid-cols-2 gap-4">
							<TeamModalInput
								title="Name"
								placeholder="e.g. Canon R5"
								value=""
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ name: value });
									else deleteChange("name");
								}}
							/>
							<TeamModalInput
								title="Identifier"
								placeholder="e.g. CAM-01"
								value=""
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ identifier: value });
									else deleteChange("identifier");
								}}
							/>
						</div>

						{/* Category */}
						<TeamModalSelect
							title="Category"
							values={AssetCategories}
							value={AssetCategories[0]}
							required
							setValue={(value) => inputChange({ category: value.id })}
						/>

						{/* Image URL */}
						<TeamModalInput
							title="Image URL"
							placeholder="https://content.hillview.tv/thumbnails/..."
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ image_url: value });
								else deleteChange("image_url");
							}}
						/>

						{/* Manufacturer + Model */}
						<div className="grid grid-cols-2 gap-4">
							<TeamModalInput
								title="Manufacturer"
								placeholder="e.g. Canon"
								value=""
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ metadata: { ...asset.metadata, manufacturer: value } });
									else deleteChange("metadata.manufacturer");
								}}
							/>
							<TeamModalInput
								title="Model"
								placeholder="e.g. EOS R5"
								value=""
								required
								setValue={(value) => {
									if (value.length > 0) inputChange({ metadata: { ...asset.metadata, model: value } });
									else deleteChange("metadata.model");
								}}
							/>
						</div>

						{/* Serial Number */}
						<TeamModalInput
							title="Serial Number"
							placeholder="Asset serial number"
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ metadata: { ...asset.metadata, serial_number: value } });
								else deleteChange("metadata.serial_number");
							}}
						/>

						{/* Description */}
						<TeamModalTextarea
							title="Description"
							placeholder="Brief description of the asset, e.g. 'SD Card C'"
							value=""
							required
							setValue={(value) => {
								if (value.length > 0) inputChange({ description: value });
								else deleteChange("description");
							}}
						/>

						{/* Notes */}
						<TeamModalTextarea
							title="Notes"
							placeholder="Any additional notes about the asset's condition…"
							value=""
							setValue={(value) => {
								if (value.length > 0) inputChange({ metadata: { ...asset.metadata, notes: value } });
								else deleteChange("metadata.notes");
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
								"Create Asset"
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreateAssetModal;
