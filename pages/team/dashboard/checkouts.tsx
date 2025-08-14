import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useEffect, useState } from "react";
import { Checkout } from "../../../models/checkout.model";
import Image from "next/image";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { UpdateCheckout } from "../../../hooks/UpdateCheckout";
import { QueryCheckouts } from "../../../hooks/QueryCheckouts";
require("dayjs/locale/en");

const GRID_TEMPLATE = "grid-cols-[80px_1fr_1fr_1fr_1fr_100px]"; // avatar | user | asset | out | in | actions

const CheckoutsPage = () => {
	const router = useRouter();
	const [checkouts, setCheckouts] = useState<Checkout[] | null>(null);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setCheckouts(null);
		const response = await QueryCheckouts({
			limit: 50,
			offset: 0,
		});
		if (response.success) {
			let data = response.data;
			console.log(data);
			setCheckouts(data);
		}
	};

	return (
		<TeamContainer pageTitle="Checkouts" router={router}>
			{/* Heading */}
			<TeamHeader title="System Checkouts" />

			{/* Header row (GRID) */}
			<div
				className={`grid ${GRID_TEMPLATE} items-center w-full h-[60px] flex-shrink-0 relative pr-4 text-sm`}
			>
				<div /> {/* avatar spacer */}
				<p className="font-semibold">User</p>
				<p className="font-semibold">Asset</p>
				<p className="font-semibold">Time Out</p>
				<p className="font-semibold">Time In</p>
				<div /> {/* action spacer */}
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>

			{/* Body (GRID rows) */}
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				<div className="w-full h-[calc(100%-70px)]">
					{checkouts && checkouts.length > 0 ? (
						checkouts.map((checkout) => {
							const timeOut = dayjs(checkout.time_out)
								.locale("en")
								.format("ddd MMM DD, hh:mm A");
							const timeInFormatted = dayjs(checkout.time_in)
								.locale("en")
								.format("ddd MMM DD, hh:mm A");

							return (
								<div
									key={checkout.id}
									className={`grid ${GRID_TEMPLATE} items-center w-full h-[60px] flex-shrink-0 hover:bg-slate-50 text-sm`}
								>
									{/* Avatar */}
									<div className="flex items-center justify-center">
										<div className="relative w-[42px] h-[42px] rounded-full overflow-hidden shadow-md border">
											<Image
												fill
												style={{ objectFit: "cover" }}
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												src={checkout.user.profile_image_url}
												alt={"user " + checkout.user.name}
											/>
										</div>
									</div>

									{/* User */}
									<p className="truncate">{checkout.user.name}</p>

									{/* Asset */}
									<p className="truncate">{checkout.asset.name}</p>

									{/* Time Out */}
									<p className="truncate">{timeOut}</p>

									{/* Time In / Status */}
									<p className="truncate">
										{checkout.checkout_status.short_name === "checked_in" ? (
											timeInFormatted
										) : (
											<b>Checked Out</b>
										)}
									</p>

									{/* Actions */}
									<div className="flex items-center">
										{checkout.checkout_status.short_name === "checked_out" ? (
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={async () => {
													const response = await UpdateCheckout(checkout.id, {
														check_in: true,
													});
													if (response.success) {
														toast.success("Checked In Successfully");
														initialize();
													} else {
														toast.error(
															"Failed to check in: " + response.error_message
														);
														console.error(response);
													}
												}}
											>
												Check In
											</button>
										) : null}
									</div>
								</div>
							);
						})
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
