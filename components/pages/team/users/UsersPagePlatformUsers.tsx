import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import Spinner from "../../../general/Spinner";
import Image from "next/image";
import { GeneralNSM } from "../../../../models/generalNSM.model";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import PageModal from "../../../general/PageModal";
import ValidMobileUser from "../../../../validators/mobileUser.validator";
import CreatePlatformUserModal from "./CreatePlatformUserModal";
import { FetchAPI } from "../../../../services/http/requestHandler";

type MobileUser = {
	id: number;
	name: string;
	email: string;
	identifier: string;
	profile_image_url: string;
	status: GeneralNSM;
	inserted_at: string;
};

const MobileUserType = {
	Active: 1,
	Suspended: 2,
	Deactivated: 3,
};

const MobileUserTypes: GeneralNSM[] = [
	{
		id: 1,
		name: "Active",
		short_name: "active",
	},
	{
		id: 2,
		name: "Suspended",
		short_name: "suspended",
	},
	{
		id: 3,
		name: "Deactivated",
		short_name: "deactivated",
		hidden: true,
	},
];

interface Props {
	setShowCreateUser?: (show: boolean) => void;
	showCreateUser?: boolean;
}

const UsersPagePlatformUsers = (props: Props) => {
	const [pageLoading, setPageLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<MobileUser[] | null>(null);

	// Inspect User Modal
	const [selectedUser, setSelectedUser] = useState<MobileUser | null>(null);
	const [changes, setChanges] = useState<any>(null);
	const [saveLoading, setSaveLoading] = useState<boolean>(false);
	const [showDeleteUser, setShowDeleteUser] = useState<boolean>(false);

	const { setShowCreateUser = () => {}, showCreateUser = false } = props;

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setChanges(null);
		setUsers(null);
		setPageLoading(true);
		const response = await FetchAPI(
			{
				url: "/core/v1.1/admin/mobileUsers",
				method: "GET",
				params: {
					limit: 25,
					offset: 0,
				},
			},
			{ auth: true }
		);

		if (response.success) {
			console.log(response.data.data);
			setUsers(response.data.data);
		} else {
			console.error(response);
			toast.error("Failed to load users");
		}
		setPageLoading(false);
	};

	const inputChange = (modifier: Object) => {
		setChanges({ ...changes, ...modifier });
	};

	const deleteChange = (key: string) => {
		const newChanges = { ...changes };
		delete newChanges[key];
		setChanges(newChanges);
	};

	const triggerSave = async () => {
		if (changes ? Object.keys(changes).length === 0 : true) {
			setSelectedUser(null);
		} else {
			let validator = ValidMobileUser(changes, true);
			if (validator.error) {
				toast.error(validator.error!.message);
				return;
			}
			setSaveLoading(true);
			const response = await FetchAPI(
				{
					url: `/core/v1.1/admin/mobileUser/${selectedUser!.id}`,
					method: "PUT",
					data: {
						changes,
					},
				},
				{ auth: true }
			);
			if (response.success) {
				toast.success("User updated");
				setChanges(null);
				setSelectedUser(null);
				initialize();
			} else {
				console.error(response);
				toast.error("Failed to update user");
			}
			setSaveLoading(false);
		}
	};

	const archiveUser = async () => {
		const response = await FetchAPI(
			{
				url: `/core/v1.1/admin/mobileUser/${selectedUser!.id}`,
				method: "PUT",
				data: {
					changes: {
						status: MobileUserType.Deactivated,
					},
				},
			},
			{ auth: true }
		);
		if (response.success) {
			toast.success("User deleted");
			setSelectedUser(null);
			initialize();
		} else {
			console.error(response);
			toast.error("Failed to delete user");
		}
	};

	return (
		<>
			{showCreateUser ? (
				<CreatePlatformUserModal
					saveDone={() => {
						initialize();
						setShowCreateUser(false);
					}}
					cancelHit={() => {
						setShowCreateUser(false);
					}}
				/>
			) : null}
			<PageModal
				titleText="Delete Mobile User"
				bodyText="Are you sure you want to delete this mobile user? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {
					// do nothing
				}}
				actionHit={() => {
					archiveUser();
				}}
				setShow={setShowDeleteUser}
				show={showDeleteUser}
			/>
			{selectedUser ? (
				<TeamModal
					className="gap-4"
					loader={saveLoading}
					saveActive={
						changes
							? Object.keys(changes).length > 0 &&
							  !ValidMobileUser(changes, true).error
							: false
					}
					cancelHit={(): void => {
						setSelectedUser(null);
						setChanges(null);
					}}
					deleteHit={(): void => {
						setShowDeleteUser(true);
					}}
					saveHit={(): void => {
						triggerSave();
					}}
				>
					<TeamModalInput
						title="Name"
						placeholder="Enter the user's name..."
						value={selectedUser.name}
						setValue={(value) => {
							if (selectedUser.name === value) {
								deleteChange("name");
							} else {
								inputChange({ name: value });
							}
						}}
					/>
					<TeamModalInput
						title="Email"
						placeholder="Enter the user's email..."
						value={selectedUser.email}
						setValue={(value) => {
							if (selectedUser.email === value) {
								deleteChange("email");
							} else {
								inputChange({ email: value });
							}
						}}
					/>
					<TeamModalInput
						title="Identifier"
						placeholder="Enter the user's identifier..."
						value={selectedUser.identifier}
						setValue={(value) => {
							if (selectedUser.identifier === value) {
								deleteChange("identifier");
							} else {
								inputChange({ identifier: value });
							}
						}}
					/>
					<TeamModalInput
						title="Profile Image URL"
						placeholder="Enter the user's profile image url..."
						value={selectedUser.profile_image_url}
						setValue={(value) => {
							if (selectedUser.profile_image_url === value) {
								deleteChange("profile_image_url");
							} else {
								inputChange({ profile_image_url: value });
							}
						}}
					/>
				</TeamModal>
			) : null}
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
					{pageLoading && !users ? (
						<div className="w-full h-fit flex items-center justify-center mt-10">
							<Spinner />
						</div>
					) : (
						users?.map((user, index) => {
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
												setSelectedUser({ ...user });
											}}
										>
											Inspect
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</>
	);
};

export default UsersPagePlatformUsers;
