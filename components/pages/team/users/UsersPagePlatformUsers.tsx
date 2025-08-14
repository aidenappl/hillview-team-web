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

import { UpdateMobileUser } from "../../../../hooks/UpdateMobileUser";
import { QueryMobileUsers } from "../../../../hooks/QueryMobileUsers";

export type MobileUser = {
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

interface Props {
	setShowCreateUser?: (show: boolean) => void;
	showCreateUser?: boolean;
}

const GRID_TEMPLATE = "grid-cols-[100px_1fr_1fr_1fr_1fr_150px]";

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
		const response = await QueryMobileUsers({ limit: 25, offset: 0 });

		if (response.success) {
			setUsers(response.data);
		} else {
			console.error(response);
			toast.error("Failed to load users");
		}
		setPageLoading(false);
	};

	const inputChange = (modifier: Object) => {
		setChanges((prev: any) => ({ ...(prev ?? {}), ...modifier }));
	};

	const deleteChange = (key: string) => {
		setChanges((prev: any) => {
			const next = { ...(prev ?? {}) };
			delete next[key];
			return next;
		});
	};

	const triggerSave = async () => {
		if (!changes || Object.keys(changes).length === 0) {
			setSelectedUser(null);
			return;
		}
		const validator = ValidMobileUser(changes, true);
		if (validator.error) {
			toast.error(validator.error.message);
			return;
		}
		setSaveLoading(true);
		const response = await UpdateMobileUser(selectedUser!.id, validator.value);
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
	};

	const archiveUser = async () => {
		const response = await UpdateMobileUser(selectedUser!.id, {
			status: MobileUserType.Deactivated,
		});
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
					cancelHit={() => setShowCreateUser(false)}
				/>
			) : null}

			<PageModal
				titleText="Delete Mobile User"
				bodyText="Are you sure you want to delete this mobile user? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={archiveUser}
				setShow={setShowDeleteUser}
				show={showDeleteUser}
			/>

			{selectedUser ? (
				<TeamModal
					className="gap-4"
					loader={saveLoading}
					saveActive={
						!!(
							changes &&
							Object.keys(changes).length > 0 &&
							!ValidMobileUser(changes, true).error
						)
					}
					cancelHit={() => {
						setSelectedUser(null);
						setChanges(null);
					}}
					deleteHit={() => setShowDeleteUser(true)}
					saveHit={triggerSave}
				>
					<TeamModalInput
						title="Name"
						placeholder="Enter the user's name..."
						value={selectedUser.name}
						setValue={(value) => {
							if (selectedUser.name === value) deleteChange("name");
							else inputChange({ name: value });
						}}
					/>
					<TeamModalInput
						title="Email"
						placeholder="Enter the user's email..."
						value={selectedUser.email}
						setValue={(value) => {
							if (selectedUser.email === value) deleteChange("email");
							else inputChange({ email: value });
						}}
					/>
					<TeamModalInput
						title="Identifier"
						placeholder="Enter the user's identifier..."
						value={selectedUser.identifier}
						setValue={(value) => {
							if (selectedUser.identifier === value) deleteChange("identifier");
							else inputChange({ identifier: value });
						}}
					/>
					<TeamModalInput
						title="Profile Image URL"
						placeholder="Enter the user's profile image url..."
						value={selectedUser.profile_image_url}
						setValue={(value) => {
							if (selectedUser.profile_image_url === value)
								deleteChange("profile_image_url");
							else inputChange({ profile_image_url: value });
						}}
					/>
				</TeamModal>
			) : null}

			{/* List container */}
			<div className="w-full h-[calc(100%-100px)] flex flex-col">
				{/* Grid Header */}
				<div
					className={`grid ${GRID_TEMPLATE} items-center w-full h-[60px] pr-[15px] relative text-sm`}
				>
					<div /> {/* avatar spacer */}
					<p className="font-medium">Name</p>
					<p className="font-medium">Email</p>
					<p className="font-medium">Identifier</p>
					<p className="font-medium">Status</p>
					<div /> {/* actions spacer */}
					<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
				</div>

				{/* Grid Body */}
				<div className="w-full h-[calc(100%-60px)] overflow-y-scroll overflow-x-hidden">
					{pageLoading && !users ? (
						<div className="w-full flex items-center justify-center mt-10">
							<Spinner />
						</div>
					) : (
						users?.map((user) => (
							<div
								key={user.id}
								className={`grid ${GRID_TEMPLATE} items-center w-full h-[55px] hover:bg-slate-50 text-sm`}
							>
								{/* Avatar */}
								<div className="flex items-center justify-center">
									<div className="relative w-[38px] h-[38px] rounded-full overflow-hidden shadow-md border-2">
										<Image
											src={user.profile_image_url}
											alt={`${user.name}'s profile image`}
											fill
											style={{ objectFit: "cover" }}
										/>
									</div>
								</div>

								{/* Name */}
								<p className="truncate">{user.name}</p>

								{/* Email */}
								<p className="truncate">{user.email}</p>

								{/* Identifier */}
								<p className="truncate">{user.identifier}</p>

								{/* Status */}
								<p className="truncate">{user.status.name}</p>

								{/* Actions */}
								<div className="flex items-center">
									<button
										className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
										onClick={() => setSelectedUser({ ...user })}
									>
										Inspect
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</>
	);
};

export default UsersPagePlatformUsers;
