import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import { useEffect, useState } from "react";
import { Asset } from "../../../models/asset.model";
import { NewRequest } from "../../../services/http/requestHandler";
import Image from "next/image";

const AssetsPage = () => {
	const router = useRouter();

	const [assets, setAssets] = useState<Asset[] | null>(null);

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
			console.log(data);
			setAssets(data);
		}
	};

	return (
		<TeamContainer pageTitle="Assets" router={router}>
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
											className="flex items-center w-full h-[70px] flex-shrink-0"
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
												<button className="px-4 text-sm py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
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
