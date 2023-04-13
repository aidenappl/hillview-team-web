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
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import TeamModalTextarea from "../../../components/pages/team/TeamModalTextarea";
import { VideoStatuses } from "../../../models/videoStatus.model";
import toast from "react-hot-toast";

const PlaylistsPage = () => {
	const router = useRouter();
	const [playlists, setPlaylists] = useState<Playlist[] | null>(null);

	// Video Inspector
	const [saving, setSaving] = useState<boolean>(false);
	const [changes, setChanges] = useState<any>(null);
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
		null
	);

	const initialize = async () => {
		setPlaylists(null);
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
					id: selectedPlaylist!.id,
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

	useEffect(() => {
		initialize();
	}, []);

	return (
		<TeamContainer pageTitle="Playlists" router={router}>
			{selectedPlaylist ? (
				<TeamModal
					className="gap-6"
					loader={saving}
					saveActive={changes && Object.keys(changes).length > 0}
					cancelHit={() => cancelPlaylistInspection()}
					saveHit={() => savePlaylistInspection()}
					deleteHit={() => setShowConfirmDeleteVideo(true)}
					destructiveText="Archive"
				>
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
					<TeamModalInput
						title="Banner Image URL"
						placeholder="Playlist Banner Image URL"
						value={selectedPlaylist.banner_image}
						setValue={(value: string) => {
							if (value != selectedPlaylist.banner_image) {
								inputChange({ banner_image: value });
							} else {
								deleteChange("banner_image");
							}
						}}
					/>
				</TeamModal>
			) : null}
			{/* Team Heading */}
			<TeamHeader title="System Playlists" />
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[300px]" />
				<p className="w-1/2 font-semibold">Title</p>
				<p className="w-1/2 font-semibold">Route</p>
				<div className="w-[200px]" />
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
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
										<p className="w-1/2">{playlist.name}</p>
										<p className="w-1/2">
											/{playlist.route}
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
