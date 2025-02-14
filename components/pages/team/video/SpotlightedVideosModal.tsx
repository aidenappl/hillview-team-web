import { useState } from "react";
import TeamModal from "../TeamModal";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
	spotlightedVideos: any;
}

const SpotlightedVideosModal = (props: Props) => {
	const [saving, setSaving] = useState<boolean>(false);
	const [saveActive, setSaveActive] = useState<boolean>(true);

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
		spotlightedVideos,
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
						<div className="flex flex-col gap-2">
							{spotlightedVideos != null &&
							spotlightedVideos.length > 0 ? (
								spotlightedVideos.map((spot: any) => (
									<div
										key={spot.rank}
										className="flex items-center gap-1"
									>
										<p className="font-semibold">
											#{spot.rank} -{" "}
										</p>
										{spot.video ? (
											<div className="flex gap-2 items-center">
												{spot.video.title}
												<button className="px-2 text-xs py-1 bg-slate-500 hover:bg-slate-700 transition text-white rounded-md font-medium">
													Change Video
												</button>
											</div>
										) : (
											<button className="px-2 text-xs py-1 bg-slate-500 hover:bg-slate-700 transition text-white rounded-md font-medium">
												Add Video
											</button>
										)}
									</div>
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
