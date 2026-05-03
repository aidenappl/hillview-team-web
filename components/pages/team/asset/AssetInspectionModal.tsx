import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalTextarea from "../TeamModalTextarea";
import TeamModalSelect from "../TeamModalSelect";
import Spinner from "../../../general/Spinner";
import UploadImage from "../../../../services/uploadHandler";
import { AssetStatuses } from "../../../../models/assetStatus.model";
import { AssetCategories } from "../../../../models/assetCategories.model";
import { Asset } from "../../../../models/asset.model";
import { AssetChanges } from "../../../../types";

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
	<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
	</svg>
);

const CameraIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
	</svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	asset: Asset;
	changes: AssetChanges | null;
	saving: boolean;
	inputChange: (modifier: Record<string, any>) => void;
	deleteChange: (key: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onDelete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const AssetInspectionModal = ({
	asset,
	changes,
	saving,
	inputChange,
	deleteChange,
	onCancel,
	onSave,
	onDelete,
}: Props) => {
	const isDirty = changes && Object.keys(changes).length > 0;
	const changeCount = isDirty ? Object.keys(changes).length : 0;
	const [showImageLoader, setShowImageLoader] = useState(false);
	// Local image URL for preview (may differ from asset.image_url after upload)
	const [displayImage, setDisplayImage] = useState(changes?.image_url ?? asset.image_url);

	const onCancelRef = useRef(onCancel);
	useEffect(() => { onCancelRef.current = onCancel; });

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancelRef.current();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setShowImageLoader(true);
		try {
			const result = await UploadImage({ image: file, route: "images/assets/", id: asset.id });
			if (result.success) {
				const url: string = result.data.data.url;
				setDisplayImage(url);
				inputChange({ image_url: url });
			} else {
				toast.error("Failed to upload image");
			}
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setShowImageLoader(false);
		}
	};

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
				className="fixed bottom-0 inset-x-0 z-30 flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:inset-x-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[88vh] sm:w-[560px] sm:rounded-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Edit Asset"
			>
				{/* Header */}
				<div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-6">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							{/* Asset thumbnail */}
							<div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
								<Image
									src={displayImage}
									alt={asset.name}
									fill
									sizes="56px"
									style={{ objectFit: "cover" }}
								/>
							</div>
							<div className="min-w-0">
								<h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
									{asset.name}
								</h2>
								<p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
									{isDirty
										? `${changeCount} unsaved change${changeCount !== 1 ? "s" : ""} — click Save to apply`
										: "Edit asset details"}
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
					<span className="font-mono text-xs text-slate-500">{asset.identifier}</span>
					<span className="h-3 w-px shrink-0 bg-slate-200" />
					<span className="text-xs text-slate-500">{asset.category.name}</span>
					{asset.metadata?.manufacturer && (
						<>
							<span className="h-3 w-px shrink-0 bg-slate-200" />
							<span className="text-xs text-slate-400">{asset.metadata.manufacturer}</span>
						</>
					)}
					{asset.metadata?.model && (
						<>
							<span className="h-3 w-px shrink-0 bg-slate-200" />
							<span className="text-xs text-slate-400">{asset.metadata.model}</span>
						</>
					)}
				</div>

				{/* Content */}
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6">
					<div className="flex flex-col gap-5">
						{/* Name + Identifier */}
						<div className="grid grid-cols-2 gap-4">
							<TeamModalInput
								title="Name"
								placeholder="Asset name"
								value={changes?.name ?? asset.name}
								setValue={(value) => {
									if (value !== asset.name) inputChange({ name: value });
									else deleteChange("name");
								}}
							/>
							<TeamModalInput
								title="Identifier"
								placeholder="Asset identifier"
								value={changes?.identifier ?? asset.identifier}
								setValue={(value) => {
									if (value !== asset.identifier) inputChange({ identifier: value });
									else deleteChange("identifier");
								}}
							/>
						</div>

						{/* Status */}
						<TeamModalSelect
							title="Status"
							values={AssetStatuses}
							value={asset.status}
							setValue={(value) => {
								if (value.id !== asset.status.id) inputChange({ status: value.id });
								else deleteChange("status");
							}}
						/>

						{/* Category */}
						<TeamModalSelect
							title="Category"
							values={AssetCategories}
							value={asset.category}
							setValue={(value) => {
								if (value.id !== asset.category.id) inputChange({ category: value.id });
								else deleteChange("category");
							}}
						/>

						{/* Notes */}
						<TeamModalTextarea
							title="Notes"
							placeholder="Notes about the asset's condition…"
							value={changes?.metadata?.notes ?? asset.metadata?.notes ?? ""}
							setValue={(value) => {
								if (value !== asset.metadata?.notes) inputChange({ metadata: { notes: value } });
								else deleteChange("metadata");
							}}
						/>

						{/* Image */}
						<div className="flex flex-col gap-2">
							<p className="text-sm font-medium text-slate-800">Asset Photo</p>
							<div className="flex items-center gap-4">
								<div
									className="relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
									onClick={() => { if (!showImageLoader) document.getElementById("assetFileInput")!.click(); }}
								>
									{showImageLoader ? (
										<div className="flex h-full items-center justify-center">
											<Spinner />
										</div>
									) : (
										<Image src={displayImage} alt={asset.name} fill sizes="96px" style={{ objectFit: "cover" }} />
									)}
								</div>
								<input
									type="file"
									id="assetFileInput"
									className="hidden"
									accept="image/png,image/jpeg,image/gif"
									onChange={handleImageUpload}
								/>
								<button
									onClick={() => { if (!showImageLoader) document.getElementById("assetFileInput")!.click(); }}
									className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
								>
									<CameraIcon />
									Change Photo
								</button>
							</div>
						</div>
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
				</div>
			</div>
		</>
	);
};

export default AssetInspectionModal;
