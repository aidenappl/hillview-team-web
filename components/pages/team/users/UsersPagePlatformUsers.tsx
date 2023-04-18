import toast from "react-hot-toast";
import { NewRequest } from "../../../../services/http/requestHandler";
import { useEffect, useState } from "react";
import Spinner from "../../../general/Spinner";
import Image from "next/image";
import { GeneralNSM } from "../../../../models/generalNSM.model";

type MobileUser = {
	id: number;
	name: string;
	email: string;
	identifier: string;
	profile_image_url: string;
	status: GeneralNSM;
	inserted_at: string;
};

const UsersPagePlatformUsers = () => {
	const [pageLoading, setPageLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<MobileUser[] | null>(null);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setPageLoading(true);
		const response = await NewRequest({
			route: "/core/v1.1/admin/mobileUsers",
			method: "GET",
			params: {
				limit: 25,
				offset: 0,
			},
			auth: true,
		});

		if (response.success) {
			console.log(response.data.data);
			setUsers(response.data.data);
		} else {
			console.error(response);
			toast.error("Failed to load users");
		}
		setPageLoading(false);
	};

	return (
		<>
			{pageLoading && !users ? (
				<div className="w-full h-fit flex items-center justify-center mt-10">
					<Spinner />
				</div>
			) : (
				<div className="w-full h-[calc(100%-100px)] flex flex-col">
					{/* List Header */}
					<div className="w-full h-[60px] flex items-center justify-between pr-[15px] relative">
						<div className="w-[100px] flex-shrink-0" />
						<p className="w-1/4 font-medium">Name</p>
						<p className="w-1/4 font-medium">Email</p>
						<p className="w-1/4 font-medium">Identifier</p>
						<p className="w-1/4 font-medium">Status</p>
						<div className="w-[150px] flex-shrink-0" />
						<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
					</div>
					{/* List Body */}
					<div className="w-full h-[calc(100%-60px)] overflow-y-scroll overflow-x-hidden">
						{users?.map((user, index) => {
							return (
								<div
									key={index}
									className="w-full h-[55px] flex items-center justify-between hover:bg-slate-50"
								>
									<div className="w-[100px] flex-shrink-0 items-center flex justify-center ">
										<div className="relative w-[38px] h-[38px] rounded-full overflow-hidden shadow-md border-2">
											<Image
												src={user.profile_image_url}
												alt={
													user.name +
													"'s profile image"
												}
												fill
												style={{ objectFit: "cover" }}
											/>
										</div>
									</div>
									<p className="w-1/4">{user.name}</p>
									<p className="w-1/4">{user.email}</p>
									<p className="w-1/4">{user.identifier}</p>
									<p className="w-1/4">{user.status.name}</p>
									<div className="flex items-center h-full w-[150px] flex-shrink-0">
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
						})}
					</div>
				</div>
			)}
		</>
	);
};

export default UsersPagePlatformUsers;
