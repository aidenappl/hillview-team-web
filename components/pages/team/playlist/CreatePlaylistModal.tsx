import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";

import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import TeamModalTextarea from "../TeamModalTextarea";
import ValidPlaylist from "../../../../validators/playlist.validator";
import TeamModalList from "../TeamModalList";
import { GenerateGeneralNSM } from "../../../../models/generalNSM.model";
import { reqCreatePlaylist } from "../../../../services/api/playlist.service";
import { reqGetVideos } from "../../../../services/api/video.service";
import { Video, PlaylistInput } from "../../../../types";
import { removeChange, applyChange } from "../../../../utils/changeTracking";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreatePlaylistModal = (props: Props) => {
	const [playlist, setPlaylist] = useState<Partial<Omit<PlaylistInput, 'videos'>> & { videos?: Video[] }>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<Video[] | null>([]);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = (modifier: Record<string, any>) => {
		setPlaylist((prev) => applyChange(prev, modifier) as typeof prev);
	};

	const deleteChange = (key: string) => {
		setPlaylist((prev) => (removeChange(prev, key) ?? {}) as typeof prev);
	};

	const runCreatePlaylist = async () => {
		if (saving) return;
		const parsedPlaylist = ParsePlaylist({ ...playlist });
		const validator = ValidPlaylist(parsedPlaylist);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await reqCreatePlaylist(validator.value);
		if (response.success) {
			toast.success("Playlist Created");
			setSaving(false);
			saveDone();
		} else {
			toast.error(response.error_message);
		}
	};

	const ParsePlaylist = (given: any) => {
		if (given?.videos) {
			given.videos = given.videos.map((video: any) => {
				return video.id;
			});
		}
		return given;
	};

	useEffect(() => {
		setPlaylist({
			banner_image: "https://content.hillview.tv/thumbnails/default.jpg",
		});
	}, []);

	useEffect(() => {
		const parsedPlaylist = ParsePlaylist({ ...playlist });
		const validator = ValidPlaylist(parsedPlaylist);
		if (validator.error) {
			setSaveActive(false);
		} else {
			setSaveActive(true);
		}
	}, [playlist]);

	return (
		<TeamModal
			className="gap-6"
			showDestructive={false}
			loader={saving}
			saveActive={saveActive}
			cancelHit={() => {
				cancelHit();
			}}
			saveHit={() => {
				runCreatePlaylist();
				saveHit();
			}}
		>
			<TeamModalInput
				title="Title"
				placeholder="Enter the Title of the playlist..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							name: value,
						});
					} else {
						deleteChange("name");
					}
				}}
			/>
			<TeamModalInput
				title="Route"
				placeholder="Enter the Route of the playlist... (e.g. hillviewShow)"
				value={playlist.route || ""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						value = value.replaceAll(" ", "-").replaceAll("/", "");
						inputChange({
							route: value,
						});
					} else {
						deleteChange("route");
					}
				}}
			/>
			<TeamModalTextarea
				title="Description"
				required
				placeholder="Enter a description for this playlist..."
				value={""}
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							description: value,
						});
					} else {
						deleteChange("description");
					}
				}}
			/>
			<TeamModalInput
				title="Thumbnail URL"
				placeholder="Enter the Thumbnail URL of the playlist..."
				value={playlist.banner_image || ""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							banner_image: value,
						});
					} else {
						deleteChange("banner_image");
					}
				}}
			/>
			{playlist.banner_image ? (
				<TeamModalUploader
					imageSource={playlist.banner_image}
					altText={"Playlist Thumbnail"}
					showImageLoader={showImageLoader}
					onChange={async (e: any) => {
						if (e.target.files && e.target.files[0]) {
							const files = e.target.files;
							setShowImageLoader(true);
							const result = await UploadImage({
								image: files[0],
								route: "thumbnails/",
								id: 0,
							});
							if (result.success) {
								setShowImageLoader(false);
								inputChange({
									banner_image: result.data.data.url,
								});
							} else {
								toast.error("Failed to upload image", {
									position: "top-center",
								});
								setShowImageLoader(false);
							}
						}
					}}
				/>
			) : null}
			<TeamModalInput
				title="Lookup Video"
				placeholder="Start typing a video..."
				value={""}
				dropdownClick={(item) => {
					if (playlist.videos) {
						const videos = playlist.videos;
						videos.push(item as any);
						setPlaylist({
							...playlist,
							videos: videos,
						});
					} else {
						setPlaylist({
							...playlist,
							videos: [item as any],
						});
					}
				}}
				dropdown={searchResults ? GenerateGeneralNSM(searchResults) : undefined}
				setDelayedValue={async (value: string): Promise<void> => {
					if (value.length < 3) return;
					const response = await reqGetVideos({
						search: value,
						limit: 5,
						offset: 0,
					});
					if (response.success) {
						const data = response.data;
						setSearchResults(data);
					} else {
						setSearchResults(null);
						toast.error("Failed to search videos");
					}
				}}
				setValue={(value: string) => {
					if (value.length === 0) {
						setSearchResults(null);
					}
				}}
			/>
			<TeamModalList
				title={"Playlist Videos"}
				list={GenerateGeneralNSM(playlist.videos ?? [])}
				destructiveClick={(item) => {
					const index = playlist.videos!.map((e: any) => e.id).indexOf(item.id);
					if (index > -1) {
						playlist.videos!.splice(index, 1);
						setPlaylist({
							...playlist,
							videos: [...playlist.videos!],
						});
					}
				}}
				itemClick={(item) => {
					window.open("https://hillview.tv/watch?v=" + item.id, "_blank");
				}}
			/>
		</TeamModal>
	);
};

export default CreatePlaylistModal;
