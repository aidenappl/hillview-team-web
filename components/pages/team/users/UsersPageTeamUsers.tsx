import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import Spinner from "../../../general/Spinner";
import Image from "next/image";
import { UserType, UserTypes } from "../../../../models/user.model";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import PageModal from "../../../general/PageModal";
import ValidUser from "../../../../validators/user.validator";

import { User } from "../../../../types";
import { UpdateUser } from "../../../../hooks/UpdateUser";
import { QueryUsers } from "../../../../hooks/QueryUsers";
dayjs.extend(relativeTime);

const GRID_COLS =
	"grid grid-cols-[100px_1fr_15%_20%_1fr_1fr_150px] items-center";

const UsersPageTeamUsers = () => {
	const [pageLoading, setPageLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<User[] | null>(null);

	// Inspect User Modal
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [changes, setChanges] = useState<any>(null);
	const [saveLoading, setSaveLoading] = useState<boolean>(false);
	const [showDeleteUser, setShowDeleteUser] = useState<boolean>(false);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setUsers(null);
		setPageLoading(true);
		const response = await QueryUsers({
			limit: 25,
			offset: 0,
		});

		if (response.success) {
			console.log(response.data);
			setUsers(response.data);
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
			let validator = ValidUser(changes, true);
			if (validator.error) {
				toast.error(validator.error!.message);
				return;
			}
			setSaveLoading(true);
			const response = await UpdateUser(selectedUser!.id, validator.value);
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
		const response = await UpdateUser(selectedUser!.id, {
			authentication: UserType.Deleted,
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
			<PageModal
				titleText="Delete User"
				bodyText="Are you sure you want to delete this user? This action is irreversible."
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
							  !ValidUser(changes, true).error
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
						title="Username"
						placeholder="Enter the user's username..."
						value={changes?.username || selectedUser.username}
						setValue={(value) => {
							if (selectedUser.username === value) {
								deleteChange("username");
							} else {
								value = value.replaceAll(" ", "-");
								inputChange({ username: value });
							}
						}}
					/>
					<TeamModalSelect
						values={UserTypes}
						title="Account Type"
						value={selectedUser.authentication}
						setValue={(value): void => {
							if (selectedUser.authentication.id === value.id) {
								deleteChange("authentication");
							} else {
								inputChange({ authentication: value.id });
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
				<div className={`${GRID_COLS} h-[60px] pr-[15px] relative font-medium`}>
					<div /> {/* Profile image column */}
					<p className="truncate">Name</p>
					<p className="truncate">Username</p>
					<p className="truncate">Email</p>
					<p className="truncate">Status</p>
					<p className="truncate">Last Active</p>
					<div /> {/* Actions column */}
					<div className="col-span-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
				</div>

				{/* List Body */}
				<div className="w-full h-[calc(100%-60px)] overflow-y-scroll overflow-x-hidden">
					{pageLoading && !users ? (
						<div className="w-full h-fit flex items-center justify-center mt-10">
							<Spinner />
						</div>
					) : (
						users?.map((user, index) => (
							<div
								key={index}
								className={`${GRID_COLS} h-[55px] hover:bg-slate-50`}
							>
								{/* Profile Image */}
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

								{/* Username */}
								{user.username ? (
									<a className="truncate text-blue-600 font-medium">
										@{user.username}
									</a>
								) : (
									<a className="truncate text-blue-950 font-medium cursor-pointer">
										Claim
									</a>
								)}

								{/* Email */}
								<p className="truncate">{user.email}</p>

								{/* Status */}
								<p className="truncate">{user.authentication.name}</p>

								{/* Last Active */}
								{user.last_active ? (
									<p className="truncate">
										{dayjs(user.last_active).fromNow()}
									</p>
								) : (
									<p className="truncate">No Activity</p>
								)}

								{/* Actions */}
								<div className="flex items-center justify-start">
									<button
										className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
										onClick={() => setSelectedUser(user)}
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

export default UsersPageTeamUsers;
