import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm } from "@fortawesome/pro-duotone-svg-icons";
import Spinner from "../../general/Spinner";
import {
	faCheck,
	faCheckCircle,
	faExclamationCircle,
} from "@fortawesome/pro-solid-svg-icons";

interface Props {
	onClick?: () => void;
	title?: string;
	progress?: number;
	encodingProgress?: number;
	state?: DropzoneStates;
}

export type DropzoneStates =
	| "none"
	| "dna"
	| "in-progress"
	| "finishing-up"
	| "status-checks"
	| "status-rolling"
	| "done"
	| "failed";

const TeamModalDropzone = (props: Props) => {
	const {
		onClick = () => {},
		state = "none",
		progress = 0,
		encodingProgress = 0,
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
					if (state == "none") onClick();
				}}
			>
				{state == "none" && (
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
							</label>
						</div>
						<p className="text-xs leading-5 text-gray-600">
							MP4s, and M4Vs up to 5GB
						</p>
					</div>
				)}
				{state == "dna" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						<p>Initializing...</p>
					</div>
				)}
				{state == "in-progress" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						<p>{progress}% Complete</p>
						<p>Uploading...</p>
					</div>
				)}
				{state == "finishing-up" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						<p>Finishing Up</p>
					</div>
				)}
				{state == "status-checks" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						<p>Checking status...</p>
					</div>
				)}
				{state == "status-rolling" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<Spinner />
						<p>{encodingProgress}% Complete</p>
						<p>Encoding...</p>
					</div>
				)}
				{state == "done" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<FontAwesomeIcon
							icon={faCheckCircle}
							className="text-blue-600 text-xl"
						/>
						<p>Done</p>
					</div>
				)}
				{state == "failed" && (
					<div className="text-center flex flex-col justify-center items-center gap-3">
						<FontAwesomeIcon
							icon={faExclamationCircle}
							className="text-red-600 text-xl"
						/>
						<p>Failed</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TeamModalDropzone;
