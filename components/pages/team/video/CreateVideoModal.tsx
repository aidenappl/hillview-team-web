import { ChangeEventHandler, useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import { NewRequest } from "../../../../services/http/requestHandler";
import toast from "react-hot-toast";
import TeamModalInput from "../TeamModalInput";
import TeamModalUploader from "../TeamModalUploader";
import UploadImage from "../../../../services/uploadHandler";
import TeamModalTextarea from "../TeamModalTextarea";
import ValidVideo from "../../../../validators/video.validator";
import TeamModalList from "../TeamModalList";
import {
	GeneralNSM,
	GenerateGeneralNSM,
} from "../../../../models/generalNSM.model";
import TeamModalDropzone from "../TeamModalDropzone";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
}

const CreateVideoModal = (props: Props) => {
	const [video, setVideo] = useState<any>({});
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
		setVideo({ ...video, ...modifier });
	};

	const deleteChange = async (key: string, forcedArr?: any) => {
		let splitKey = key.split(".");
		let newChanges;
		if (forcedArr) {
			newChanges = { ...forcedArr };
		} else {
			newChanges = { ...video };
		}
		for (var k in newChanges) {
			if (k == key) {
				delete newChanges[key];
				setVideo(newChanges);
			} else if (typeof newChanges[k] === "object" && splitKey[0] == k) {
				deleteChange(splitKey[1], newChanges[k]);
			}
		}
	};

	const runCreateVideo = async () => {
		if (saving) return;
		let validator = ValidVideo(video);
		if (validator.error) {
			toast.error(validator.error!.message);
			return;
		}
		setSaving(true);
		const response = await NewRequest({
			method: "POST",
			route: "/core/v1.1/admin/video",
			body: validator.value,
			auth: true,
		});
		if (response.success) {
			console.log(response.data);
			toast.success("Video Created");
			setSaving(false);
			saveDone();
		} else {
			console.error(response);
			toast.error(response.message);
		}
	};

	useEffect(() => {
		setVideo({
			banner_image: "https://content.hillview.tv/thumbnails/default.jpg",
		});
	}, []);

	useEffect(() => {
		let validator = ValidVideo(video);
		if (validator.error) {
			setSaveActive(false);
		} else {
			setSaveActive(true);
		}
	}, [video]);

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
				runCreateVideo();
				saveHit();
			}}
		>
			<TeamModalInput
				title="Title"
				placeholder="Enter the Title of the video..."
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
			<TeamModalTextarea
				title="Description"
				className="h-[200px]"
				placeholder="Enter the Description of the video..."
				value={""}
				required
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
				title="Source URL"
				placeholder="Enter the Source URL of the video..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							url: value,
						});
					} else {
						deleteChange("url");
					}
				}}
			/>
			<TeamModalDropzone/>
			<TeamModalInput
				title="Thumbnail URL"
				placeholder="Enter the Thumbnail URL of the video..."
				value={""}
				required
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							thumbnail: value,
						});
					} else {
						deleteChange("thumbnail");
					}
				}}
			/>
			<TeamModalInput
				title="Download URL"
				placeholder="Enter the Download URL of the video..."
				value={""}
				setValue={(value: string): void => {
					if (value.length > 0) {
						inputChange({
							thumbnail: value,
						});
					} else {
						deleteChange("thumbnail");
					}
				}}
			/>
		</TeamModal>
	);
};

export default CreateVideoModal;
