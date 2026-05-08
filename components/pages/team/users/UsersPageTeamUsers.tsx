import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PageModal from "../../../general/PageModal";
import TeamUserInspectionModal from "./TeamUserInspectionModal";
import ValidUser from "../../../../validators/user.validator";
import { UserType, UserTypes } from "../../../../models/user.model";
import { User, UserChanges } from "../../../../types";
import { reqUpdateUser, reqGetUsers } from "../../../../services/api/user.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

dayjs.extend(relativeTime);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTH_BADGE: Record<number, { label: string; cls: string }> = {
	1: { label: "Unauthorized", cls: "bg-amber-100 text-amber-700" },
	2: { label: "Student", cls: "bg-emerald-100 text-emerald-700" },
	3: { label: "Admin", cls: "bg-blue-100 text-blue-700" },
	9: { label: "Deleted", cls: "bg-red-100 text-red-600" },
};

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID = "grid gap-x-4 items-center px-4";
const COLS = "grid-cols-[36px_1fr_auto] sm:grid-cols-[36px_1fr_1fr_96px_auto] lg:grid-cols-[36px_1fr_120px_1fr_96px_100px_auto]";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			<div className="h-7 w-7 animate-pulse rounded-full bg-slate-100" />
			<div className="h-3.5 w-28 animate-pulse rounded-md bg-slate-100" />
			<div className="hidden h-3.5 w-32 animate-pulse rounded-md bg-slate-100 sm:block" />
			<div className="hidden h-5 w-16 animate-pulse rounded-full bg-slate-100 sm:block" />
			<div className="h-7 w-14 animate-pulse rounded-lg bg-slate-100" />
		</div>
	);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
				<svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No team users</p>
			<p className="mt-1 text-xs text-slate-400">Team members will appear here</p>
		</div>
	);
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({
	user,
	onEdit,
}: {
	user: User;
	onEdit: () => void;
}) {
	const badge = AUTH_BADGE[user.authentication.id] ?? { label: user.authentication.name, cls: "bg-slate-100 text-slate-600" };

	return (
		<div
			className={`${GRID} ${COLS} cursor-pointer border-b border-slate-50 py-3 transition-colors last:border-b-0 hover:bg-slate-50/60`}
			onClick={onEdit}
		>
			{/* Avatar */}
			<div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
				<Image
					src={user.profile_image_url}
					alt={user.name}
					fill
					sizes="28px"
					style={{ objectFit: "cover" }}
				/>
			</div>

			{/* Name */}
			<p className="truncate text-sm font-medium text-slate-800">{user.name}</p>

			{/* Email — sm+ */}
			<p className="hidden truncate text-xs text-slate-500 sm:block">{user.email}</p>

			{/* Username — lg+ (col 3) */}
			<p className="hidden truncate font-mono text-xs text-slate-500 lg:block">
				{user.username ? `@${user.username}` : "—"}
			</p>

			{/* Auth badge — sm+ */}
			<div className="hidden sm:flex items-center">
				<span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
					{badge.label}
				</span>
			</div>

			{/* Last active — lg+ */}
			<p className="hidden truncate text-xs text-slate-400 lg:block">
				{user.last_active ? dayjs(user.last_active).fromNow() : "Never"}
			</p>

			{/* Actions */}
			<div onClick={(e) => e.stopPropagation()}>
				<button
					onClick={(e) => { e.stopPropagation(); onEdit(); }}
					className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
				>
					Edit
				</button>
			</div>
		</div>
	);
}

// ─── Component ───────────────────────────────────────────────────────────────

const UsersPageTeamUsers = () => {
	const [users, setUsers] = useState<User[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [changes, setChanges] = useState<UserChanges | null>(null);
	const [saving, setSaving] = useState(false);
	const [showDeleteUser, setShowDeleteUser] = useState(false);

	// ── Data ─────────────────────────────────────────────────────────────────

	const initialize = async () => {
		setUsers(null);
		setOffset(0);
		try {
			const response = await reqGetUsers({ limit: 25, offset: 0 });
			if (response.success) setUsers(response.data);
			else {
				setUsers([]);
				toast.error("Failed to load users");
			}
		} catch {
			setUsers([]);
			toast.error("Failed to load users");
		}
	};

	const loadMore = async () => {
		setLoadingMore(true);
		const newOffset = offset + 25;
		try {
			const response = await reqGetUsers({ limit: 25, offset: newOffset });
			if (response.success) {
				setUsers((prev) => [...(prev ?? []), ...response.data]);
				setOffset(newOffset);
			} else {
				toast.error("Failed to load more users");
			}
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		initialize();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Change tracking ──────────────────────────────────────────────────────

	const inputChange = (modifier: Record<string, any>) => {
		setChanges((prev) => applyChange(prev, modifier) as UserChanges);
	};

	const deleteChange = (key: string) => {
		setChanges((prev) => removeChange(prev, key) as UserChanges | null);
	};

	const saveActive = !!(
		changes &&
		Object.keys(changes).length > 0 &&
		!ValidUser(changes, true).error
	);

	// ── Inspector actions ────────────────────────────────────────────────────

	const cancelInspection = () => {
		setSelectedUser(null);
		setChanges(null);
		setSaving(false);
	};

	const saveInspection = async () => {
		if (!changes || Object.keys(changes).length === 0 || !selectedUser) {
			setSelectedUser(null);
			return;
		}
		const { error, value } = ValidUser(changes, true);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		try {
			const response = await reqUpdateUser(selectedUser.id, value);
			if (response.success) {
				// In-place update — no list flash
				setUsers((prev) =>
					prev?.map((u) => {
						if (u.id !== selectedUser.id) return u;
						return {
							...u,
							...(value.name !== undefined && { name: value.name }),
							...(value.email !== undefined && { email: value.email }),
							...(value.username !== undefined && { username: value.username }),
							...(value.profile_image_url !== undefined && { profile_image_url: value.profile_image_url }),
							...(value.authentication !== undefined && {
								authentication: UserTypes.find((t) => t.id === value.authentication) ?? u.authentication,
							}),
						};
					}) ?? null
				);
				toast.success("User updated");
				setSelectedUser(null);
				setChanges(null);
				setSaving(false);
			} else {
				setSaving(false);
				toast.error("Failed to update user");
			}
		} catch {
			setSaving(false);
			toast.error("An unexpected error occurred");
		}
	};

	const deleteUser = async () => {
		if (!selectedUser) return;
		try {
			const response = await reqUpdateUser(selectedUser.id, { authentication: UserType.Deleted });
			if (response.success) {
				setUsers((prev) =>
					prev?.map((u) =>
						u.id === selectedUser.id
							? { ...u, authentication: UserTypes.find((t) => t.id === UserType.Deleted) ?? u.authentication }
							: u
					) ?? null
				);
				toast.success("User deleted");
				setSelectedUser(null);
				setChanges(null);
			} else {
				toast.error("Failed to delete user");
			}
		} catch {
			toast.error("An unexpected error occurred");
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<PageModal
				titleText="Delete User"
				bodyText="Are you sure you want to delete this user? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={deleteUser}
				setShow={setShowDeleteUser}
				show={showDeleteUser}
			/>

			{selectedUser && (
				<TeamUserInspectionModal
					user={selectedUser}
					changes={changes}
					saving={saving}
					saveActive={saveActive}
					inputChange={inputChange}
					deleteChange={deleteChange}
					onCancel={cancelInspection}
					onSave={saveInspection}
					onDelete={() => setShowDeleteUser(true)}
				/>
			)}

			<div className="pb-8 pt-2">
				<div className="overflow-hidden rounded-xl border border-slate-100">
					{/* Column headers */}
					<div className={`${GRID} ${COLS} border-b border-slate-100 bg-slate-50/80 py-2 text-xs font-semibold text-slate-500`}>
						<div /> {/* avatar spacer */}
						<p>Name</p>
						<p className="hidden sm:block">Email</p>
						<p className="hidden lg:block">Username</p>
						<p className="hidden sm:block">Role</p>
						<p className="hidden lg:block">Last Active</p>
						<div className="min-w-[52px]" /> {/* actions spacer */}
					</div>

					{/* Body */}
					{users === null ? (
						Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
					) : users.length === 0 ? (
						<EmptyState />
					) : (
						users.map((user) => (
							<UserRow
								key={user.id}
								user={user}
								onEdit={() => setSelectedUser(user)}
							/>
						))
					)}
				</div>

				{/* Load more */}
				{users && users.length > 0 && users.length % 25 === 0 && (
					<div className="flex justify-center pt-4">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loadingMore ? "Loading…" : "Load more"}
						</button>
					</div>
				)}
			</div>
		</>
	);
};

export default UsersPageTeamUsers;
