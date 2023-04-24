import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import { useEffect, useState } from "react";
import { NewRequest } from "../../../services/http/requestHandler";
import { Link } from "../../../models/link.model";
import PageModal from "../../../components/general/PageModal";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import toast from "react-hot-toast";
import CreateLinkModal from "../../../components/pages/team/link/CreateLinkModal";

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
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/links",
			params: {
				limit: 20,
				offset: offset,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setLinks(data);
		}
	};

	const loadMore = async () => {
		let newOffset = offset + 20;
		setOffset(newOffset);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/links",
			params: {
				limit: 20,
				offset: newOffset,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setLinks([...links!, ...data]);
		}
	};

	const cancelLinkInspection = async () => {
		setSelectedLink(null);
		setChanges(null);
		setSaving(false);
	};

	const inputChange = async (modifier: Object) => {
		setChanges({ ...changes, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...changes };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setChanges(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	const saveLinkInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await NewRequest({
				method: "PUT",
				route: "/core/v1.1/admin/link/" + selectedLink!.id,
				body: {
					id: selectedLink!.id,
					changes: changes,
				},
				auth: true,
			});
			if (response.success) {
				setSelectedLink(null);
				setChanges(null);
				setSaving(false);
				initialize();
			} else {
				console.error(response);
				setSaving(false);
				toast.error("Failed to save changes", {
					position: "top-center",
				});
			}
		} else {
			setSelectedLink(null);
		}
	};

	const archiveLink = async () => {
		const response = await NewRequest({
			method: "PUT",
			route: "/core/v1.1/admin/link/" + selectedLink!.id,
			body: {
				changes: {
					active: false,
				},
			},
			auth: true,
		});
		if (response.success) {
			setSelectedLink(null);
			setChanges(null);
			setSaving(false);
			initialize();
		} else {
			console.error(response);
			setSaving(false);
			toast.error("Failed to save changes", {
				position: "top-center",
			});
		}
	};

	return (
		<TeamContainer pageTitle="Links" router={router}>
			<PageModal
				titleText="Archive Link"
				bodyText="Are you sure you want to archive this link? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {
					// do nothing
				}}
				actionHit={() => {
					archiveLink();
				}}
				setShow={setShowConfirmDeleteLink}
				show={showConfirmDeleteLink}
			/>
			{showCreateLink ? (
				<CreateLinkModal
					cancelHit={() => {
						setShowCreateLink(false);
					}}
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
					saveActive={changes && Object.keys(changes).length > 0}
					cancelHit={() => cancelLinkInspection()}
					saveHit={() => saveLinkInspection()}
					deleteHit={() => setShowConfirmDeleteLink(true)}
					destructiveText="Archive"
				>
					<TeamModalInput
						title="Route"
						placeholder="Link Route... e.g. /about"
						value={selectedLink.route}
						setValue={(value: string) => {
							value = value.replaceAll("/", "");
							if (value != selectedLink.route) {
								inputChange({ route: value });
							} else {
								deleteChange("route");
							}
						}}
					/>
					<TeamModalInput
						title="Destination URL"
						placeholder="Link Destination URL"
						value={selectedLink.destination}
						setValue={(value: string) => {
							if (value != selectedLink.destination) {
								inputChange({ destination: value });
							} else {
								deleteChange("destination");
							}
						}}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="Custom Links">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => {
						setShowCreateLink(true);
					}}
				>
					Create Link
				</button>
			</TeamHeader>
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<p className="w-[20%] font-semibold">Route</p>
				<p className="w-[40%] font-semibold">Destination</p>
				<p className="w-[10%] font-semibold">Creator</p>
				<p className="w-[20%] font-semibold">Clicks</p>
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{links && links.length > 0 ? (
							links.map((link, index) => {
								return (
									<div
										key={index}
										className="flex items-center w-full h-[70px] flex-shrink-0 hover:bg-slate-50"
									>
										<p className="w-[20%] pr-10">
											/{link.route}
										</p>
										<a
											className="w-[40%] break-all overflow-ellipsis line-clamp-2 overflow-hidden text-blue-600 font-medium pr-10"
											href={link.destination}
											target="_blank"
										>
											{link.destination}
										</a>
										<p className="w-[10%] pr-10">
											{link.creator.name}
										</p>
										<p className="w-[10%] pr-10">
											{link.clicks}
										</p>
										<div className="w-[20%] flex justify-end pr-10 gap-3">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedLink(link);
												}}
											>
												Inspect
											</button>
											<button
												className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md"
												onClick={(e: any) => {
													navigator.clipboard.writeText(
														"https://hillview.tv/" +
															link.route
													);
													e.target.innerHTML =
														"Copied!";
													setTimeout(() => {
														e.target.innerHTML =
															"Copy";
													}, 2000);
												}}
											>
												Copy
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
						{links && links.length > 0 ? (
							<div className="w-full h-[150px] flex items-center justify-center">
								<button
									onClick={loadMore}
									className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
								>
									Load More
								</button>
							</div>
						) : null}
					</>
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
