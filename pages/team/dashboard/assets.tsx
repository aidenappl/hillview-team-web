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
import { FetchAPI } from "../../../services/http/requestHandler";

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
		if (selectedAsset) {
			setSelectedAssetImage(selectedAsset.image_url);
		}
	}, [selectedAsset]);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setAssets(null);
		const response = await FetchAPI<Asset[]>(
			{
				method: "GET",
				url: "/core/v1.1/admin/assets",
				params: {
					limit: 50,
					sort: "DESC",
					offset: 0,
				},
			},
			{ auth: true }
		);
		if (response.success) {
			let data = response.data;
			console.log(data);
			setAssets(data);
		}
	};

	const deleteAsset = async () => {
		const response = await FetchAPI(
			{
				method: "PUT",
				url: "/core/v1.1/admin/asset/" + selectedAsset!.id,
				data: {
					id: selectedAsset!.id,
					changes: {
						status: AssetStatus.Deleted,
					},
				},
			},
			{ auth: true }
		);
		if (response.success) {
			setSelectedAsset(null);
			setChanges(null);
			setSaving(false);
			initialize();
		} else {
			console.error(response);
			setSaving(false);
			toast.error("Failed to save changes", {
				position: "top-center",
			});
		}
	};

	const saveAssetInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await FetchAPI(
				{
					method: "PUT",
					url: "/core/v1.1/admin/asset/" + selectedAsset!.id,
					data: {
						id: selectedAsset!.id,
						changes: changes,
					},
				},
				{ auth: true }
			);
			if (response.success) {
				setSelectedAsset(null);
				setChanges(null);
				setSaving(false);
				initialize();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", {
					position: "top-center",
				});
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
		setChanges({ ...changes, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...changes };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setChanges(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	return (
		<TeamContainer pageTitle="Assets" router={router}>
			<PageModal
				titleText="Delete Asset"
				bodyText="Are you sure you want to delete this asset? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {
					// do nothing
				}}
				actionHit={() => {
					deleteAsset();
				}}
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
					cancelHit={(): void => {
						setShowCreateAsset(false);
					}}
				/>
			) : null}
			{/* Modal */}
			{selectedAsset && selectedAssetImage ? (
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={changes && Object.keys(changes).length > 0}
					cancelHit={() => cancelAssetInspection()}
					saveHit={() => saveAssetInspection()}
					deleteHit={() => setShowConfirmDeleteAsset(true)}
				>
					<div className="flex justify-between w-full gap-4">
						<TeamModalInput
							title="Name"
							placeholder="Item Name"
							value={selectedAsset.name}
							setValue={(value: string) => {
								if (value != selectedAsset.name) {
									inputChange({ name: value });
								} else {
									deleteChange("name");
								}
							}}
						/>
						<TeamModalInput
							title="Identifier"
							placeholder="Item Identifier"
							value={selectedAsset.identifier}
							setValue={(value: string) => {
								if (value != selectedAsset.identifier) {
									inputChange({ identifier: value });
								} else {
									deleteChange("identifier");
								}
							}}
						/>
					</div>

					<TeamModalSelect
						title="Status"
						values={AssetStatuses}
						value={selectedAsset.status}
						setValue={(value) => {
							if (value.name != selectedAsset.status.name) {
								inputChange({ status: value.id });
							} else {
								deleteChange("status");
							}
						}}
					/>
					<TeamModalSelect
						title="Category"
						values={AssetCategories}
						value={selectedAsset.category}
						setValue={(value) => {
							if (value.name != selectedAsset.category.name) {
								inputChange({ category: value.id });
							} else {
								deleteChange("category");
							}
						}}
					/>
					<TeamModalTextarea
						title="Notes"
						placeholder="Item Notes"
						runner="Notes about the item's state"
						value={selectedAsset.metadata.notes}
						setValue={(value: string) => {
							if (value != selectedAsset.metadata.notes) {
								inputChange({
									metadata: {
										notes: value,
									},
								});
							} else {
								deleteChange("metadata.notes");
							}
						}}
					/>
					<TeamModalUploader
						title="Asset Photo"
						imageSource={selectedAssetImage}
						imageClassName="w-[70px]"
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
									inputChange({
										image_url: result.data.data.url,
									});
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
			{/* Team Heading */}
			<TeamHeader title="System Assets">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => {
						setShowCreateAsset(true);
					}}
				>
					Create Asset
				</button>
			</TeamHeader>
			{/* Data Content */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[110px]" />
				<p className="w-1/4 font-semibold">Asset</p>
				<p className="w-1/4 font-semibold">Identifier</p>
				<p className="w-1/4 font-semibold">Device Type</p>
				<p className="w-1/4 font-semibold">Status</p>
				<div className="w-[200px]" />
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{assets && assets.length > 0 ? (
							assets.map((asset, index) => {
								return (
									<div
										key={index}
										className="flex items-center w-full h-[70px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="w-[110px] flex items-center justify-center">
											<div className="relative w-[50px] h-[40px] rounded-lg overflow-hidden shadow-md">
												<Image
													fill
													style={{
														objectFit: "cover",
													}}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
													src={asset.image_url}
													alt={"asset " + asset.name}
												/>
											</div>
										</div>
										<p className="w-1/4">{asset.name}</p>
										<p className="w-1/4">
											{asset.identifier}
										</p>
										<p className="w-1/4">
											{asset.category.name}
										</p>
										<p className="w-1/4">
											{asset.status.name}
										</p>
										<div className="w-[200px]">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedAsset(asset);
												}}
											>
												Inspect
											</button>
										</div>
									</div>
								);
							})
						) : (
							<div className="w-full h-[100px] flex items-center justify-center">
								<Spinner />
							</div>
						)}
					</>
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
