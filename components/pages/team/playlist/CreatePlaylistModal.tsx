import { ChangeEventHandler, useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import { NewRequest } from "../../../../services/http/requestHandler";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import TeamModalTextarea from "../TeamModalTextarea";
import ValidPlaylist from "../../../../validators/playlist.validator";
import TeamModalList from "../TeamModalList";
import {
	GeneralNSM,
	GenerateGeneralNSM,
} from "../../../../models/generalNSM.model";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreatePlaylistModal = (props: Props) => {
	const [playlist, setPlaylist] = useState<any>({});
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(false);
	const [showImageLoader, setShowImageLoader] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<GeneralNSM[] | null>([]);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
	} = props;

	const inputChange = async (modifier: Object) => {
		setPlaylist({ ...playlist, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...playlist };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setPlaylist(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	const runCreatePlaylist = async () => {
		if (saving) return;
		let parsedPlaylist = ParsePlaylist({ ...playlist });
		let validator = ValidPlaylist(parsedPlaylist);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await NewRequest({
			method: "POST",
			route: "/core/v1.1/admin/playlist",
			body: validator.value,
			auth: true,
		});
		if (response.success) {
			console.log(response.data);
			toast.success("Playlist Created");
			setSaving(false);
			saveDone();
		} else {
			console.error(response);
			toast.error(response.message);
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
		let parsedPlaylist = ParsePlaylist({ ...playlist });
		let validator = ValidPlaylist(parsedPlaylist);
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
				value={playlist.route}
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
				value={playlist.banner_image}
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
							let files = e.target.files;
							setShowImageLoader(true);
							let result = await UploadImage({
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
								console.error(result);
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
						let videos = playlist.videos;
						videos.push(item);
						setPlaylist({
							...playlist,
							videos: videos,
						});
					} else {
						setPlaylist({
							...playlist,
							videos: [item],
						});
					}
				}}
				dropdown={
					searchResults
						? GenerateGeneralNSM(searchResults)
						: undefined
				}
				setDelayedValue={async (value: string): Promise<void> => {
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
				list={GenerateGeneralNSM(playlist.videos)}
				destructiveClick={(item) => {
					let index = playlist.videos
						.map((e: any) => e.id)
						.indexOf(item.id);
					if (index > -1) {
						console.log(playlist.videos.splice(index, 1));
						setPlaylist({
							...playlist,
							videos: playlist.videos.splice(index, 1),
						});
					}
				}}
				itemClick={(item) => {
					window.open(
						"https://hillview.tv/watch?v=" + item.id,
						"_blank"
					);
				}}
			/>
		</TeamModal>
	);
};

export default CreatePlaylistModal;
