import toast from "react-hot-toast";
import { NewRequest } from "../../../../services/http/requestHandler";
import { useEffect, useState } from "react";
import Spinner from "../../../general/Spinner";
import Image from "next/image";
import { User, UserType, UserTypes } from "../../../../models/user.model";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TeamModal from "../TeamModal";
import TeamModalInput from "../TeamModalInput";
import TeamModalSelect from "../TeamModalSelect";
import PageModal from "../../../general/PageModal";
dayjs.extend(relativeTime);

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
		setPageLoading(true);
		const response = await NewRequest({
			route: "/core/v1.1/admin/users",
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
			toast.error("No changes to save");
		} else {
			setSaveLoading(true);
			const response = await NewRequest({
				route: `/core/v1.1/admin/user/${selectedUser!.id}`,
				method: "PUT",
				body: {
					changes,
				},
				auth: true,
			});
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
		const response = await NewRequest({
			route: `/core/v1.1/admin/user/${selectedUser!.id}`,
			method: "PUT",
			body: {
				changes: {
					authentication: UserType.Deleted,
				},
			},
			auth: true,
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
						changes ? Object.keys(changes).length > 0 : false
					}
					cancelHit={(): void => {
						setSelectedUser(null);
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
						value={selectedUser.username}
						setValue={(value) => {
							if (selectedUser.username === value) {
								deleteChange("username");
							} else {
								inputChange({ username: value });
							}
						}}
					/>
					<TeamModalSelect
						values={UserTypes}
						title="Account Type"
						value={selectedUser.authentication}
						setValue={(value): void => {
							if (selectedUser.authentication === value) {
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
				<div className="w-full h-[60px] flex items-center justify-between pr-[15px] relative">
					<div className="w-[100px] flex-shrink-0" />
					<p className="w-1/5 font-medium">Name</p>
					<p className="w-1/6 font-medium">Username</p>
					<p className="w-1/5 font-medium">Email</p>
					<p className="w-1/5 font-medium">Status</p>
					<p className="w-1/5 font-medium">Last Active</p>
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
												style={{
													objectFit: "cover",
												}}
											/>
										</div>
									</div>
									<p className="w-1/5">{user.name}</p>
									{user.username ? (
										<a className="w-1/6 text-blue-600 font-medium">
											@{user.username}
										</a>
									) : (
										<a className="w-1/6 text-blue-950 font-medium cursor-pointer">
											Claim
										</a>
									)}
									<p className="w-1/5">{user.email}</p>
									<p className="w-1/5">
										{user.authentication.name}
									</p>
									{user.last_active ? (
										<p className="w-1/5">
											{dayjs(user.last_active).fromNow()}
										</p>
									) : (
										<p className="w-1/5">No Activity</p>
									)}
									<div className="flex items-center h-full w-[150px] flex-shrink-0">
										<button
											className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
											onClick={() => {
												setSelectedUser(user);
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

export default UsersPageTeamUsers;
