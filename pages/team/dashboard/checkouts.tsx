import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useEffect, useState } from "react";
import { Checkout } from "../../../models/checkout.model";
import Image from "next/image";
import { NewRequest } from "../../../services/http/requestHandler";
import dayjs from "dayjs";
require("dayjs/locale/en");

const CheckoutsPage = () => {
	const router = useRouter();
	const [checkouts, setCheckouts] = useState<Checkout[] | null>(null);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setCheckouts(null);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/checkouts",
			params: {
				limit: 50,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setCheckouts(data);
		}
	};

	return (
		<TeamContainer pageTitle="Checkouts" router={router}>
			{/* Team Heading */}
			<TeamHeader title="System Checkouts" />
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[110px]" />
				<p className="w-1/4 font-semibold">User</p>
				<p className="w-1/4 font-semibold">Asset</p>
				<p className="w-1/4 font-semibold">Time Out</p>
				<p className="w-1/4 font-semibold">Time In</p>
				<div className="w-[200px]" />
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{checkouts && checkouts.length > 0 ? (
							checkouts.map((checkout, index) => {
								checkout.time_in = dayjs(checkout.time_in)
									.locale("en")
									.format("ddd MMM DD, HH:MM");
								checkout.time_out = dayjs(checkout.time_out)
									.locale("en")
									.format("ddd MMM DD, HH:MM");
								return (
									<div
										key={index}
										className="flex items-center w-full h-[70px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="w-[110px] flex items-center justify-center">
											<div className="relative w-[42px] h-[42px] rounded-full overflow-hidden shadow-md border">
												<Image
													fill
													style={{
														objectFit: "cover",
													}}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
													src={
														checkout.user
															.profile_image_url
													}
													alt={
														"user " +
														checkout.user.name
													}
												/>
											</div>
										</div>
										<p className="w-1/4">
											{checkout.user.name}
										</p>
										<p className="w-1/4">
											{checkout.asset.name}
										</p>
										<p className="w-1/4">
											{checkout.time_out}
										</p>
										<p className="w-1/4">
											{checkout.checkout_status
												.short_name == "checked_in"
												? checkout.time_in
												: <b>Checked Out</b>}
										</p>
										<div className="w-[200px]">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													// setSelectedAsset(asset);
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

export default CheckoutsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Checkouts",
		},
	};
};
