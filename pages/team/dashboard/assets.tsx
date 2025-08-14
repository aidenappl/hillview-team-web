import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { useEffect, useState } from "react";
import { Asset } from "../../../models/asset.model";
import Image from "next/image";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import { AssetStatus, AssetStatuses } from "../../../models/assetStatus.model";
import { AssetCategories } from "../../../models/assetCategories.model";
import TeamModalUploader from "../../../components/pages/team/TeamModalUploader";
import toast from "react-hot-toast";
import Spinner from "../../../components/general/Spinner";
import UploadImage from "../../../services/uploadHandler";
import PageModal from "../../../components/general/PageModal";
import CreateAssetModal from "../../../components/pages/team/asset/CreateAssetModal";

import { UpdateAsset } from "../../../hooks/UpdateAsset";
import { QueryAssets } from "../../../hooks/QueryAssets";
const GRID_TEMPLATE = "grid-cols-[110px_1fr_1fr_1fr_1fr_200px]";

const AssetsPage = () => {
	const router = useRouter();

	const [assets, setAssets] = useState<Asset[] | null>(null);
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [showConfirmDeleteAsset, setShowConfirmDeleteAsset] =
		useState<boolean>(false);

	// inspector states
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);
	const [selectedAssetImage, setSelectedAssetImage] = useState<string | null>(
		null
	);

	// create asset modal
	const [showCreateAsset, setShowCreateAsset] = useState<boolean>(false);

	useEffect(() => {
		if (selectedAsset) setSelectedAssetImage(selectedAsset.image_url);
	}, [selectedAsset]);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setAssets(null);
		const response = await QueryAssets({
			limit: 50,
			sort: "DESC",
			offset: 0,
		});
		if (response.success) setAssets(response.data);
	};

	const deleteAsset = async () => {
		const response = await UpdateAsset(selectedAsset!.id, {
			status: AssetStatus.Deleted,
		});
		if (response.success) {
			setSelectedAsset(null);
			setChanges(null);
			setSaving(false);
			initialize();
		} else {
			console.error(response);
			setSaving(false);
			toast.error("Failed to save changes", { position: "top-center" });
		}
	};

	const saveAssetInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await UpdateAsset(selectedAsset!.id, changes);
			if (response.success) {
				setSelectedAsset(null);
				setChanges(null);
				setSaving(false);
				initialize();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", { position: "top-center" });
			}
		} else {
			setSelectedAsset(null);
		}
	};

	const cancelAssetInspection = async () => {
		setSelectedAsset(null);
		setChanges(null);
		setSelectedAssetImage(null);
		setSaving(false);
	};

	const inputChange = async (modifier: Object) => {
		setChanges((prev: any) => ({ ...(prev ?? {}), ...modifier }));
	};

	const deleteChange = async (key: string, forcedObj?: any) => {
		const obj = forcedObj ? { ...forcedObj } : { ...(changes ?? {}) };
		if (key in obj) {
			delete obj[key];
			setChanges(obj);
			return;
		}
		const [head, ...rest] = key.split(".");
		if (typeof obj[head] === "object" && obj[head] !== null) {
			await deleteChange(rest.join("."), obj[head]);
			setChanges({ ...obj, [head]: obj[head] });
		}
	};

	return (
		<TeamContainer pageTitle="Assets" router={router}>
			<PageModal
				titleText="Delete Asset"
				bodyText="Are you sure you want to delete this asset? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={deleteAsset}
				setShow={setShowConfirmDeleteAsset}
				show={showConfirmDeleteAsset}
			/>

			{/* Create Asset Modal */}
			{showCreateAsset ? (
				<CreateAssetModal
					saveDone={() => {
						setShowCreateAsset(false);
						initialize();
					}}
					cancelHit={() => setShowCreateAsset(false)}
				/>
			) : null}

			{/* Inspector Modal */}
			{selectedAsset && selectedAssetImage ? (
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={!!(changes && Object.keys(changes).length > 0)}
					cancelHit={cancelAssetInspection}
					saveHit={saveAssetInspection}
					deleteHit={() => setShowConfirmDeleteAsset(true)}
				>
					<div className="flex justify-between w-full gap-4">
						<TeamModalInput
							title="Name"
							placeholder="Item Name"
							value={selectedAsset.name}
							setValue={(value: string) => {
								if (value !== selectedAsset.name) inputChange({ name: value });
								else deleteChange("name");
							}}
						/>
						<TeamModalInput
							title="Identifier"
							placeholder="Item Identifier"
							value={selectedAsset.identifier}
							setValue={(value: string) => {
								if (value !== selectedAsset.identifier)
									inputChange({ identifier: value });
								else deleteChange("identifier");
							}}
						/>
					</div>

					<TeamModalSelect
						title="Status"
						values={AssetStatuses}
						value={selectedAsset.status}
						setValue={(value) => {
							if (value.name !== selectedAsset.status.name)
								inputChange({ status: value.id });
							else deleteChange("status");
						}}
					/>
					<TeamModalSelect
						title="Category"
						values={AssetCategories}
						value={selectedAsset.category}
						setValue={(value) => {
							if (value.name !== selectedAsset.category.name)
								inputChange({ category: value.id });
							else deleteChange("category");
						}}
					/>
					<TeamModalTextarea
						title="Notes"
						placeholder="Item Notes"
						runner="Notes about the item's state"
						value={selectedAsset.metadata.notes}
						setValue={(value: string) => {
							if (value !== selectedAsset.metadata.notes) {
								inputChange({ metadata: { notes: value } });
							} else {
								deleteChange("metadata.notes");
							}
						}}
					/>
					<TeamModalUploader
						title="Asset Photo"
						imageSource={selectedAssetImage}
						imageClassName="w-[60px]"
						altText={selectedAsset.name + " banner image"}
						showImageLoader={showImageLoader}
						onChange={async (e: any) => {
							if (e.target.files && e.target.files[0]) {
								let files = e.target.files;
								setShowImageLoader(true);
								let result = await UploadImage({
									image: files[0],
									route: "images/assets/",
									id: selectedAsset.id,
								});
								if (result.success) {
									setShowImageLoader(false);
									setSelectedAssetImage(result.data.data.url);
									inputChange({ image_url: result.data.data.url });
								} else {
									console.error(result);
									toast.error("Failed to upload image", {
										position: "top-center",
									});
									setShowImageLoader(false);
								}
							}
						}}
					/>
				</TeamModal>
			) : null}

			{/* Header */}
			<TeamHeader title="System Assets">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => setShowCreateAsset(true)}
				>
					Create Asset
				</button>
			</TeamHeader>

			{/* Grid Header Row */}
			<div
				className={`grid ${GRID_TEMPLATE} items-center w-full h-[60px] flex-shrink-0 relative pr-4 text-sm`}
			>
				<div /> {/* image spacer */}
				<p className="font-semibold">Asset</p>
				<p className="font-semibold">Identifier</p>
				<p className="font-semibold">Device Type</p>
				<p className="font-semibold">Status</p>
				<div /> {/* actions spacer */}
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>

			{/* Body */}
			<div className="w-full h-[calc(100%-160px)] overflow-y-auto overflow-x-auto">
				<div className="w-full h-[calc(100%-60px)]">
					{assets && assets.length > 0 ? (
						assets.map((asset) => (
							<div
								key={asset.id}
								className={`grid ${GRID_TEMPLATE} items-center w-full h-[60px] flex-shrink-0 hover:bg-slate-50 text-sm`}
							>
								{/* Image */}
								<div className="flex items-center justify-center">
									<div className="relative w-[50px] h-[40px] rounded-lg overflow-hidden shadow-md">
										<Image
											fill
											style={{ objectFit: "cover" }}
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											src={asset.image_url}
											alt={"asset " + asset.name}
										/>
									</div>
								</div>

								{/* Asset */}
								<p className="truncate">{asset.name}</p>

								{/* Identifier */}
								<p className="truncate">{asset.identifier}</p>

								{/* Device Type */}
								<p className="truncate">{asset.category.name}</p>

								{/* Status */}
								<p className="truncate">{asset.status.name}</p>

								{/* Actions */}
								<div className="flex items-center">
									<button
										className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
										onClick={() => setSelectedAsset(asset)}
									>
										Inspect
									</button>
								</div>
							</div>
						))
					) : (
						<div className="w-full h-[100px] flex items-center justify-center">
							<Spinner />
						</div>
					)}
				</div>
			</div>
		</TeamContainer>
	);
};

export default AssetsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Assets",
		},
	};
};
