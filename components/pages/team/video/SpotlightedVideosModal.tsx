import { useState } from "react";
import TeamModal from "../TeamModal";
import Button from "../../../general/Button";
import Image from "next/image";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
	spotlightedVideos: any;
	onSearchVideos?: (search: string) => void;
}

interface VideoSpotlightItemProps {
	spot: any;
}

const VideoSpotlight = (props: VideoSpotlightItemProps) => {
	const { spot } = props;
	return (
		<div className="flex items-center gap-1">
			{spot.video ? (
				<div className="w-full bg-slate-100 rounded-sm h-fit p-3 grid grid-cols-[auto_1fr_auto] gap-3 items-center">
					{/* Preview Icon */}
					<div className="h-[60px] w-[100px] rounded-md overflow-hidden relative">
						<Image src={spot.video.thumbnail} alt={spot.video.title} fill />
					</div>
					{/* Text Details */}
					<div className="flex flex-col">
						<p className="text-sm font-semibold">Position {spot.rank}</p>
						<p className="text-sm">{spot.video.title}</p>
					</div>
					{/* Action Buttons */}
					<div className="flex items-center justify-end">
						<Button>Change Video</Button>
					</div>
				</div>
			) : (
				<button className="px-2 text-xs py-1 bg-slate-500 hover:bg-slate-700 transition text-white rounded-md font-medium">
					Add Video
				</button>
			)}
		</div>
	);
};

const SpotlightedVideosModal = (props: Props) => {
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(true);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
		spotlightedVideos,
		onSearchVideos = () => {},
	} = props;

	const runUpdateSpotlight = async () => {
		setSaving(true);
	};

	return (
		<>
			<TeamModal
				className="gap-6"
				showDestructive={false}
				loader={saving}
				saveActive={saveActive}
				cancelHit={() => {
					cancelHit();
				}}
				saveHit={() => {
					runUpdateSpotlight();
					saveHit();
				}}
			>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<h2 className="text-[#101827] font-medium text-xl">
							Spotlighted Videos
						</h2>
						<input
							type="text"
							placeholder={"Search Videos..."}
							onChange={(e) => {
								onSearchVideos(e.target.value);
							}}
						/>
						<div className="flex flex-col gap-2">
							{spotlightedVideos != null && spotlightedVideos.length > 0 ? (
								spotlightedVideos.map((spot: any) => (
									<VideoSpotlight key={spot.key} spot={spot} />
								))
							) : (
								<option value={""}>No Videos</option>
							)}
						</div>
					</div>
				</div>
			</TeamModal>
		</>
	);
};

export default SpotlightedVideosModal;
