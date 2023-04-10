import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { useEffect, useState } from "react";
import { Asset } from "../../../models/asset.model";
import { NewRequest } from "../../../services/http/requestHandler";
import Image from "next/image";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import { AssetStatuses } from "../../../models/assetStatus.model";
import TeamModalUploader from "../../../components/pages/team/TeamModalUploader";

const AssetsPage = () => {
	const router = useRouter();

	const [assets, setAssets] = useState<Asset[] | null>(null);
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/assets",
			params: {
				limit: 50,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			setSelectedAsset(data[0]);
			console.log(data);
			setAssets(data);
		}
	};

	return (
		<TeamContainer pageTitle="Assets" router={router}>
			{/* Modal */}
			{selectedAsset ? (
				<TeamModal className="gap-6">
					<div className="flex justify-between w-full gap-4">
						<TeamModalInput
							title="Name"
							placeholder="Item Name"
							value={selectedAsset.name}
							setValue={function (value: string): {} {
								throw new Error("Function not implemented.");
							}}
						/>
						<TeamModalInput
							title="Identifier"
							placeholder="Item Identifier"
							value={selectedAsset.identifier}
							setValue={function (value: string): {} {
								throw new Error("Function not implemented.");
							}}
						/>
					</div>

					<TeamModalSelect
						title="Status"
						values={AssetStatuses}
						default={AssetStatuses[0]}
					/>
					<TeamModalTextarea
						title="Notes"
						placeholder="Item Notes"
						runner="Notes about the item's state"
						value={selectedAsset.metadata.notes}
						setValue={function (value: string): {} {
							throw new Error("Function not implemented.");
						}}
					/>
					<TeamModalUploader
						title="Asset Photo"
						imageSource={selectedAsset.image_url}
						imageClassName="w-[70px]"
						altText={selectedAsset.name + " banner image"}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System Assets" />
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
			<div className="w-full h-[calc(100%-100px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{assets && assets.length > 0
							? assets.map((asset, index) => {
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
														src={asset.image_url}
														alt={
															"asset " +
															asset.name
														}
													/>
												</div>
											</div>
											<p className="w-1/4">
												{asset.name}
											</p>
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
												<button className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md">
													Inspect
												</button>
											</div>
										</div>
									);
							  })
							: null}
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
