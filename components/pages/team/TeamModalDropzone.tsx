import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm } from "@fortawesome/pro-duotone-svg-icons";
import Spinner from "../../general/Spinner";

interface Props {
	title?: string;
	progress?: number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	state?: DropzoneStates;
	uploadStatus?: "progress" | "label";
	progressLabel?: string;
}

export type DropzoneStates = "default" | "loading";

const TeamModalDropzone = (props: Props) => {
	const {
		onChange = () => {},
		state = "default",
		progress = 0,
		uploadStatus = "progress",
		progressLabel = "Processing...",
	} = props;

	return (
		<div className="flex flex-col gap-2 w-full relative">
			{props.title ? (
				<label className="font-medium text-[#101827] flex gap-1">
					{props.title}
				</label>
			) : null}
			<div
				className="cursor-pointer w-full h-[150px] flex items-center justify-center rounded-lg border border-dashed border-gray-900/25 hover:border-gray-900/50"
				onClick={() => {
					document.getElementById("file-upload")?.click();
				}}
			>
				{state == "default" ? (
					<div className="text-center">
						<FontAwesomeIcon
							icon={faPhotoFilm}
							className="text-4xl text-blue-500"
						/>
						<div className="mt-4 flex text-sm leading-6 text-gray-600 text-center justify-center">
							<label
								htmlFor="file-upload"
								className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
								id="file-upload-label"
							>
								<span>Upload a file</span>
								<input
									id="file-upload"
									name="file-upload"
									type="file"
									accept="video/mp4,video/x-m4v"
									className="sr-only"
									onChange={onChange}
								/>
							</label>
						</div>
						<p className="text-xs leading-5 text-gray-600">
							MP4s or M4Vs up to 5GB
						</p>
					</div>
				) : null}
				{state == "loading" ? (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						{uploadStatus == "progress" ? (
							<p>{progress}% Complete</p>
						) : null}
						{uploadStatus == "label" ? (
							<p>{progressLabel}</p>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default TeamModalDropzone;
