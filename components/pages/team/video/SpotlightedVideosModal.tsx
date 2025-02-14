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
					<div className="flex flex-col gap-1">
						<h2 className="text-[#101827] font-semibold text-sm">
							Spotlighted Videos
						</h2>
						{spotlightedVideos != null &&
						spotlightedVideos.length > 0 ? (
							spotlightedVideos.map((spot: any) => (
								<div key={spot.rank}>#{spot.rank} - {spot.video.title}</div>
							))
						) : (
							<option value={""}>No Videos</option>
						)}
					</div>
				</div>
			</TeamModal>
		</>
	);
};

export default SpotlightedVideosModal;
