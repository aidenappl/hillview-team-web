import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useEffect, useState } from "react";
import { Link } from "../../../models/link.model";
import PageModal from "../../../components/general/PageModal";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import toast from "react-hot-toast";
import CreateLinkModal from "../../../components/pages/team/link/CreateLinkModal";

import { UpdateLink } from "../../../hooks/UpdateLink";
import { QueryLinks } from "../../../hooks/QueryLinks";
const GRID_TEMPLATE = "grid-cols-[20%_30%_20%_10%_20%]";

const LinksPage = () => {
	const router = useRouter();
	const [links, setLinks] = useState<Link[] | null>(null);
	const [showConfirmDeleteLink, setShowConfirmDeleteLink] =
		useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0);

	// Link Inspector
	const [selectedLink, setSelectedLink] = useState<Link | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);
	const [showCreateLink, setShowCreateLink] = useState<boolean>(false);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setLinks(null);
		setOffset(0);
		const response = await QueryLinks({ limit: 20, offset: 0 });
		if (response.success) {
			setLinks(response.data);
		}
	};

	const loadMore = async () => {
		const newOffset = offset + 20;
		setOffset(newOffset);
		const response = await QueryLinks({ limit: 20, offset: newOffset });
		if (response.success) {
			setLinks((prev) => [...(prev ?? []), ...response.data]);
		}
	};

	const cancelLinkInspection = async () => {
		setSelectedLink(null);
		setChanges(null);
		setSaving(false);
	};

	const inputChange = async (modifier: Object) => {
		setChanges((prev: any) => ({ ...(prev ?? {}), ...modifier }));
	};

	const deleteChange = async (key: string, forcedObj?: any) => {
		const obj = forcedObj ? { ...forcedObj } : { ...(changes ?? {}) };
		if (key in obj) {
			delete obj[key];
			setChanges(obj);
			return;
		}
		const [head, ...rest] = key.split(".");
		if (typeof obj[head] === "object" && obj[head] !== null) {
			await deleteChange(rest.join("."), obj[head]);
			setChanges({ ...obj, [head]: obj[head] });
		}
	};

	const saveLinkInspection = async () => {
		if (changes && Object.keys(changes).length > 0 && selectedLink) {
			setSaving(true);
			const response = await UpdateLink(selectedLink.id, changes);
			if (response.success) {
				setSelectedLink(null);
				setChanges(null);
				setSaving(false);
				initialize();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", { position: "top-center" });
			}
		} else {
			setSelectedLink(null);
		}
	};

	const archiveLink = async () => {
		if (!selectedLink) return;
		const response = await UpdateLink(selectedLink.id, { active: false });
		if (response.success) {
			setSelectedLink(null);
			setChanges(null);
			setSaving(false);
			initialize();
		} else {
			console.error(response);
			setSaving(false);
			toast.error("Failed to save changes", { position: "top-center" });
		}
	};

	return (
		<TeamContainer pageTitle="Links" router={router}>
			<PageModal
				titleText="Archive Link"
				bodyText="Are you sure you want to archive this link? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {}}
				actionHit={archiveLink}
				setShow={setShowConfirmDeleteLink}
				show={showConfirmDeleteLink}
			/>

			{showCreateLink ? (
				<CreateLinkModal
					cancelHit={() => setShowCreateLink(false)}
					saveHit={() => {
						setShowCreateLink(false);
						initialize();
					}}
				/>
			) : null}

			{selectedLink ? (
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={!!(changes && Object.keys(changes).length > 0)}
					cancelHit={cancelLinkInspection}
					saveHit={saveLinkInspection}
					deleteHit={() => setShowConfirmDeleteLink(true)}
					destructiveText="Archive"
				>
					<TeamModalInput
						title="Route"
						placeholder="Link Route... e.g. /about"
						value={selectedLink.route}
						setValue={(value: string) => {
							value = value.replaceAll("/", "");
							if (value !== selectedLink.route) inputChange({ route: value });
							else deleteChange("route");
						}}
					/>
					<TeamModalInput
						title="Destination URL"
						placeholder="Link Destination URL"
						value={selectedLink.destination}
						setValue={(value: string) => {
							if (value !== selectedLink.destination)
								inputChange({ destination: value });
							else deleteChange("destination");
						}}
					/>
				</TeamModal>
			) : null}

			{/* Team Heading */}
			<TeamHeader title="Custom Links">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => setShowCreateLink(true)}
				>
					Create Link
				</button>
			</TeamHeader>

			{/* Grid Header Row */}
			<div
				className={`grid ${GRID_TEMPLATE} items-center w-full h-[70px] flex-shrink-0 relative pr-4 text-sm`}
			>
				<p className="font-semibold">Route</p>
				<p className="font-semibold">Destination</p>
				<p className="font-semibold">Creator</p>
				<p className="font-semibold">Clicks</p>
				<div /> {/* Actions spacer */}
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>

			{/* Body */}
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				<div className="w-full h-[calc(100%-70px)]">
					{links && links.length > 0 ? (
						<>
							{links.map((link) => (
								<div
									key={link.id}
									className={`grid ${GRID_TEMPLATE} items-center w-full h-[70px] flex-shrink-0 hover:bg-slate-50 text-sm`}
								>
									{/* Route */}
									<p className="pr-10 truncate">/{link.route}</p>

									{/* Destination */}
									<a
										className="break-all overflow-ellipsis line-clamp-2 overflow-hidden text-blue-600 font-medium pr-10"
										href={link.destination}
										target="_blank"
										rel="noopener noreferrer"
										title={link.destination}
									>
										{link.destination}
									</a>

									{/* Creator */}
									<p className="pr-10 truncate">{link.creator.name}</p>

									{/* Clicks */}
									<p className="pr-10">{link.clicks}</p>

									{/* Actions */}
									<div className="flex justify-end pr-10 gap-3">
										<button
											className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
											onClick={() => setSelectedLink(link)}
										>
											Inspect
										</button>
										<button
											className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md"
											onClick={(e) => {
												navigator.clipboard.writeText(
													"https://hillview.tv/" + link.route
												);
												const btn = e.currentTarget as HTMLButtonElement;
												const prev = btn.innerText;
												btn.innerText = "Copied!";
												setTimeout(() => {
													btn.innerText = prev;
												}, 2000);
											}}
										>
											Copy
										</button>
									</div>
								</div>
							))}

							{/* Load more */}
							<div className="w-full h-[150px] flex items-center justify-center">
								<button
									onClick={loadMore}
									className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
								>
									Load More
								</button>
							</div>
						</>
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

export default LinksPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Links",
		},
	};
};
