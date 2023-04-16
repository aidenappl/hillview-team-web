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

const LinksPage = () => {
	const router = useRouter();
	const [links, setLinks] = useState<Link[] | null>(null);
	const [showConfirmDeleteLink, setShowConfirmDeleteLink] =
		useState<boolean>(false);

	// Link Inspector
	const [selectedLink, setSelectedLink] = useState<Link | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);

	useEffect(() => {
		initialize();
	}, []);

	const initialize = async () => {
		setLinks(null);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/links",
			params: {
				limit: 50,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setLinks(data);
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
			<TeamHeader title="Custom Links" />
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<p className="w-1/3 font-semibold">Route</p>
				<p className="w-1/3 font-semibold">Destination</p>
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
										<p className="w-1/3">/{link.route}</p>
										<a
											className="w-1/3 break-all overflow-ellipsis line-clamp-2 overflow-hidden text-blue-600 font-medium"
											href={link.destination}
											target="_blank"
										>
											{link.destination}
										</a>
										<div className="w-1/3 flex justify-end pr-10 gap-3">
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
