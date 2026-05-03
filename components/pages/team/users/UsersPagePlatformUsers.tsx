import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Image from "next/image";
import PageModal from "../../../general/PageModal";
import PlatformUserInspectionModal from "./PlatformUserInspectionModal";
import CreatePlatformUserModal from "./CreatePlatformUserModal";
import ValidMobileUser from "../../../../validators/mobileUser.validator";
import { MobileUser, MobileUserChanges } from "../../../../types";
import { reqUpdateMobileUser, reqGetMobileUsers } from "../../../../services/api/user.service";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
	Active: "bg-emerald-100 text-emerald-700",
	Suspended: "bg-amber-100 text-amber-700",
	Deactivated: "bg-red-100 text-red-600",
};

const MobileUserStatus = { Deactivated: 3 };

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID = "grid gap-x-4 items-center px-4";
const COLS = "grid-cols-[36px_1fr_auto] sm:grid-cols-[36px_1fr_1fr_96px_auto] lg:grid-cols-[36px_1fr_1fr_140px_96px_auto]";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
	return (
		<div className={`${GRID} ${COLS} border-b border-slate-50 py-3 last:border-b-0`}>
			<div className="h-7 w-7 animate-pulse rounded-full bg-slate-100" />
			<div className="h-3.5 w-28 animate-pulse rounded-md bg-slate-100" />
			<div className="hidden h-3.5 w-36 animate-pulse rounded-md bg-slate-100 sm:block" />
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
					<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
				</svg>
			</div>
			<p className="text-sm font-medium text-slate-700">No platform users</p>
			<p className="mt-1 text-xs text-slate-400">Create the first user to get started</p>
		</div>
	);
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({
	user,
	onEdit,
}: {
	user: MobileUser;
	onEdit: () => void;
}) {
	const badgeCls = STATUS_BADGE[user.status.name] ?? "bg-slate-100 text-slate-600";

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

			{/* NFC Identifier — lg+ */}
			<p className="hidden truncate font-mono text-xs text-slate-500 lg:block">{user.nfc_identifier}</p>

			{/* Status badge — sm+ */}
			<div className="hidden sm:flex items-center">
				<span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeCls}`}>
					{user.status.name}
				</span>
			</div>

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	showCreateUser?: boolean;
	setShowCreateUser?: (show: boolean) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const UsersPagePlatformUsers = ({
	showCreateUser = false,
	setShowCreateUser = () => {},
}: Props) => {
	const [users, setUsers] = useState<MobileUser[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	const [selectedUser, setSelectedUser] = useState<MobileUser | null>(null);
	const [changes, setChanges] = useState<MobileUserChanges | null>(null);
	const [saving, setSaving] = useState(false);
	const [showDeleteUser, setShowDeleteUser] = useState(false);

	// ── Data ─────────────────────────────────────────────────────────────────

	const initialize = async () => {
		setUsers(null);
		setOffset(0);
		const response = await reqGetMobileUsers({ limit: 25, offset: 0 });
		if (response.success) setUsers(response.data);
		else toast.error("Failed to load users");
	};

	const loadMore = async () => {
		setLoadingMore(true);
		const newOffset = offset + 25;
		try {
			const response = await reqGetMobileUsers({ limit: 25, offset: newOffset });
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
		setChanges((prev) => applyChange(prev, modifier) as MobileUserChanges);
	};

	const deleteChange = (key: string) => {
		setChanges((prev) => removeChange(prev, key) as MobileUserChanges | null);
	};

	const saveActive = !!(
		changes &&
		Object.keys(changes).length > 0 &&
		!ValidMobileUser(changes, true).error
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
		const { error, value } = ValidMobileUser(changes, true);
		if (error) {
			toast.error(error.message);
			return;
		}
		setSaving(true);
		const response = await reqUpdateMobileUser(selectedUser.id, value);
		if (response.success) {
			// In-place update — no list flash
			setUsers((prev) =>
				prev?.map((u) =>
					u.id === selectedUser.id ? { ...u, ...value } : u
				) ?? null
			);
			toast.success("User updated");
			setSelectedUser(null);
			setChanges(null);
			setSaving(false);
		} else {
			setSaving(false);
			toast.error("Failed to update user");
		}
	};

	const deleteUser = async () => {
		if (!selectedUser) return;
		const response = await reqUpdateMobileUser(selectedUser.id, {
			status: MobileUserStatus.Deactivated,
		});
		if (response.success) {
			setUsers((prev) => prev?.filter((u) => u.id !== selectedUser.id) ?? null);
			toast.success("User deleted");
			setSelectedUser(null);
			setChanges(null);
		} else {
			toast.error("Failed to delete user");
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<PageModal
				titleText="Delete Platform User"
				bodyText="Are you sure you want to delete this user? This action is irreversible."
				primaryText="Delete"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={deleteUser}
				setShow={setShowDeleteUser}
				show={showDeleteUser}
			/>

			{showCreateUser && (
				<CreatePlatformUserModal
					cancelHit={() => setShowCreateUser(false)}
					saveDone={() => {
						setShowCreateUser(false);
						initialize();
					}}
				/>
			)}

			{selectedUser && (
				<PlatformUserInspectionModal
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
						<p className="hidden lg:block">Student ID</p>
						<p className="hidden sm:block">Status</p>
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

export default UsersPagePlatformUsers;
