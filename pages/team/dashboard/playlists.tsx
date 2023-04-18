import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Playlist } from "../../../models/playlist.model";
import Image from "next/image";
import { NewRequest } from "../../../services/http/requestHandler";
import TeamModal from "../../../components/pages/team/TeamModal";
import TeamModalInput from "../../../components/pages/team/TeamModalInput";
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import {
	PlaylistStatus,
	PlaylistStatuses,
} from "../../../models/playlistStatus.model";
import toast from "react-hot-toast";
import PageModal from "../../../components/general/PageModal";
import TeamModalTabBar from "../../../components/pages/team/TeamModalTabBar";
import {
	GeneralNSN,
	GenerateGeneralNSN,
} from "../../../models/GeneralNSN.model";
import TeamModalList from "../../../components/pages/team/TeamModalList";
import { Video } from "../../../models/video.model";
import CreatePlaylistModal from "../../../components/pages/team/playlist/CreatePlaylistModal";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import TeamModalUploader from "../../../components/pages/team/TeamModalUploader";
import UploadImage from "../../../services/uploadHandler";

const PlaylistInspectorTabs = GenerateGeneralNSN(["General", "Videos"]);

const PlaylistsPage = () => {
	const router = useRouter();
	const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
	const [showConfirmDeletePlaylist, setShowConfirmDeletePlaylist] =
		useState<boolean>(false);

	// Playlist Inspector
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
		null
	);
	const [activePlaylistInspectorTab, setActivePlaylistInspectorTab] =
		useState<GeneralNSN>(PlaylistInspectorTabs[0]);
	const [searchResults, setSearchResults] = useState<Video[] | null>(null);
	const [showCreatePlaylist, setShowCreatePlaylist] =
		useState<boolean>(false);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);

	const initialize = async () => {
		setPlaylists(null);
		setActivePlaylistInspectorTab(PlaylistInspectorTabs[0]);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/playlists",
			params: {
				limit: 50,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setPlaylists(data);
		}
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

	const cancelPlaylistInspection = async () => {
		setSelectedPlaylist(null);
		setChanges(null);
		setSaving(false);
	};

	const savePlaylistInspection = async () => {
		if (changes && Object.keys(changes).length > 0) {
			setSaving(true);
			const response = await NewRequest({
				method: "PUT",
				route: "/core/v1.1/admin/playlist/" + selectedPlaylist!.id,
				body: {
					changes: changes,
				},
				auth: true,
			});
			if (response.success) {
				setSelectedPlaylist(null);
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
			setSelectedPlaylist(null);
		}
	};

	const archiveVideo = async () => {
		const response = await NewRequest({
			method: "PUT",
			route: "/core/v1.1/admin/playlist/" + selectedPlaylist!.id,
			body: {
				id: selectedPlaylist!.id,
				changes: {
					status: PlaylistStatus.Archived,
				},
			},
			auth: true,
		});
		if (response.success) {
			setSelectedPlaylist(null);
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

	useEffect(() => {
		initialize();
	}, []);

	useEffect(() => {
		console.log(changes);
	}, [changes]);

	return (
		<TeamContainer pageTitle="Playlists" router={router}>
			<PageModal
				titleText="Archive Video"
				bodyText="Are you sure you want to archive this video? This action is irreversible."
				primaryText="Archive"
				secondaryText="Cancel"
				cancelHit={() => {
					// do nothing
				}}
				actionHit={() => {
					archiveVideo();
				}}
				setShow={setShowConfirmDeletePlaylist}
				show={showConfirmDeletePlaylist}
			/>
			{showCreatePlaylist ? (
				<CreatePlaylistModal
					saveDone={() => {
						setShowCreatePlaylist(false);
						initialize();
					}}
					cancelHit={() => {
						setShowCreatePlaylist(false);
					}}
				/>
			) : null}
			{selectedPlaylist ? (
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={changes && Object.keys(changes).length > 0}
					cancelHit={() => cancelPlaylistInspection()}
					saveHit={() => savePlaylistInspection()}
					deleteHit={() => setShowConfirmDeletePlaylist(true)}
					destructiveText="Archive"
				>
					<TeamModalTabBar
						tabs={PlaylistInspectorTabs}
						activeTab={activePlaylistInspectorTab}
						setActiveTab={setActivePlaylistInspectorTab}
					/>
					{activePlaylistInspectorTab == PlaylistInspectorTabs[0] ? (
						<div className="flex gap-6 flex-col">
							<TeamModalInput
								title="Title"
								placeholder="Playlist Title"
								value={selectedPlaylist.name}
								setValue={(value: string) => {
									if (value != selectedPlaylist.name) {
										inputChange({ name: value });
									} else {
										deleteChange("name");
									}
								}}
							/>
							<TeamModalTextarea
								title="Description"
								placeholder="Playlist Description"
								value={selectedPlaylist.description}
								className="h-[150px]"
								setValue={(value: string) => {
									if (value != selectedPlaylist.description) {
										inputChange({ description: value });
									} else {
										deleteChange("description");
									}
								}}
							/>
							<TeamModalInput
								title="Route"
								placeholder="Playlist Source Route"
								value={selectedPlaylist.route}
								setValue={(value: string) => {
									if (value != selectedPlaylist.route) {
										inputChange({ route: value });
									} else {
										deleteChange("route");
									}
								}}
							/>
							<TeamModalSelect
								title="Status"
								values={PlaylistStatuses}
								value={selectedPlaylist.status}
								setValue={(value) => {
									if (
										value.id != selectedPlaylist.status.id
									) {
										inputChange({ status: value.id });
									} else {
										deleteChange("status");
									}
								}}
							/>
							<TeamModalInput
								title="Banner Image URL"
								placeholder="Playlist Banner Image URL"
								value={changes?.banner_image || selectedPlaylist.banner_image}
								setValue={(value: string) => {
									if (
										value != selectedPlaylist.banner_image
									) {
										inputChange({ banner_image: value });
									} else {
										deleteChange("banner_image");
									}
								}}
							/>
							<TeamModalUploader
								imageSource={
									changes?.banner_image ||
									selectedPlaylist.banner_image
								}
								altText={"Playlist Thumbnail"}
								showImageLoader={showImageLoader}
								onChange={async (e: any) => {
									if (e.target.files && e.target.files[0]) {
										let files = e.target.files;
										setShowImageLoader(true);
										let result = await UploadImage({
											image: files[0],
											route: "thumbnails/",
											id: selectedPlaylist.id,
										});
										if (result.success) {
											setShowImageLoader(false);
											inputChange({
												banner_image:
													result.data.data.url,
											});
										} else {
											console.error(result);
											toast.error(
												"Failed to upload image",
												{
													position: "top-center",
												}
											);
											setShowImageLoader(false);
										}
									}
								}}
							/>
						</div>
					) : null}
					{activePlaylistInspectorTab == PlaylistInspectorTabs[1] ? (
						<div className="flex gap-6 flex-col">
							<TeamModalInput
								title="Lookup Video"
								placeholder="Start typing a video..."
								value={""}
								dropdownClick={(item) => {
									setSearchResults(null);
									if (
										selectedPlaylist.videos.find(
											(v: Video) => v.id == item.id
										)
									) {
										toast.error("Video already added");
									} else {
										let arrChanges = changes?.add_videos;
										if (!arrChanges) {
											arrChanges = [];
										}
										arrChanges.push(item.id);
										inputChange({
											add_videos: arrChanges,
										});
										setSelectedPlaylist({
											...selectedPlaylist,
											videos: [
												item,
												...selectedPlaylist.videos,
											],
										});
									}
								}}
								dropdown={
									searchResults
										? GenerateGeneralNSN(searchResults)
										: undefined
								}
								setDelayedValue={async (
									value: string
								): Promise<void> => {
									if (value.length < 3) return;
									const response = await NewRequest({
										method: "GET",
										route: "/core/v1.1/admin/videos",
										params: {
											search: value,
											limit: 5,
											offset: 0,
										},
										auth: true,
									});
									if (response.success) {
										let data = response.data.data;
										setSearchResults(data);
									} else {
										setSearchResults(null);
										toast.error("Failed to search videos");
									}
								}}
								setValue={(value: string) => {
									if (value.length == 0) {
										setSearchResults(null);
									}
								}}
							/>
							<TeamModalList
								title={"Playlist Videos"}
								list={GenerateGeneralNSN(
									selectedPlaylist.videos
								)}
								destructiveClick={(item) => {
									// add to remove_videos
									if (
										changes?.add_videos?.indexOf(item.id) >
										-1
									) {
										// remove from add_videos
										let arrChanges = changes?.add_videos;
										if (arrChanges.length == 1) {
											deleteChange("add_videos");
										} else {
											if (!arrChanges) {
												arrChanges = [];
											}
											arrChanges.splice(
												arrChanges.indexOf(item.id),
												1
											);
											inputChange({
												add_videos: arrChanges,
											});
										}
									} else {
										// add to remove_videos
										if (
											changes?.remove_videos?.length == 1
										) {
											deleteChange("remove_videos");
										} else {
											let arr = [];
											if (changes?.remove_videos) {
												arr = changes.remove_videos;
											}
											arr.push(item.id);
											inputChange({
												remove_videos: arr,
											});
										}
									}
									setSelectedPlaylist({
										...selectedPlaylist,
										videos: selectedPlaylist.videos.filter(
											(video: Video) =>
												video.id != item.id
										),
									});
								}}
								itemClick={(item) => {
									window.open(
										"https://hillview.tv/watch?v=" +
											item.id,
										"_blank"
									);
								}}
							/>
						</div>
					) : null}
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System Playlists">
				<button
					className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
					onClick={() => {
						setShowCreatePlaylist(true);
					}}
				>
					Create Playlist
				</button>
			</TeamHeader>
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[300px]" />
				<p className="w-[calc(33%-170px)] font-semibold">Title</p>
				<p className="w-[calc(33%-170px)] font-semibold">Route</p>
				<p className="w-[calc(33%-170px)] font-semibold"># Videos</p>
				<div className="w-[200px]" />
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-scroll overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{playlists && playlists.length > 0 ? (
							playlists.map((playlist, index) => {
								return (
									<div
										key={index}
										className="flex items-center w-full h-[100px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="w-[300px] flex items-center justify-center">
											<div
												className="relative w-[130px] h-[75px] rounded-md overflow-hidden shadow-md border cursor-pointer"
												onClick={() => {
													document
														.getElementById(
															"open-playlist-" +
																playlist.id
														)
														?.click();
												}}
											>
												<Image
													fill
													style={{
														objectFit: "cover",
													}}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
													src={playlist.banner_image}
													alt={
														"video " + playlist.name
													}
												/>
											</div>
										</div>
										<p className="w-[calc(33%-170px)]">
											{playlist.name}
										</p>
										<p className="w-[calc(33%-170px)]">
											/{playlist.route}
										</p>
										<p className="w-[calc(33%-170px)]">
											{playlist.videos.length} Videos
										</p>
										<div className="w-[200px] flex gap-2 pr-10">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedPlaylist(
														playlist
													);
												}}
											>
												Inspect
											</button>
											<Link
												href={
													"https://hillview.tv/playlist/" +
													playlist.route
												}
												target="_blank"
												id={
													"open-playlist-" +
													playlist.id
												}
											>
												<button className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md">
													Open
												</button>
											</Link>
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

export default PlaylistsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Playlists",
		},
	};
};
