import { useEffect, useState } from "react";
import TeamModal from "../TeamModal";
import Button from "../../../general/Button";
import Image from "next/image";
import { Spotlight, Video } from "../../../../types";
import TeamModalInput from "../TeamModalInput";
import { on } from "events";
import { GenerateGeneralNSM } from "../../../../models/generalNSM.model";
import { useSpotlight } from "../../../../hooks/videos/useSpotlight";
import Spinner from "../../../general/Spinner";
import toast from "react-hot-toast";

interface Props {
	cancelHit?: () => void;
	saveHit?: () => void;
	saveDone?: () => void;
	spotlightedVideos: Spotlight[] | null;
	onSearchVideos: (search: string) => Promise<Video[]>;
}

interface VideoSpotlightItemProps {
	spot: Spotlight;
	editing?: boolean;
	onClick?: (spotlight: Spotlight) => void;
	onSearch: (search: string) => Promise<Video[]>;
	setNewVideo?: (video: Video) => void;
}

const VideoSpotlight = (props: VideoSpotlightItemProps) => {
	const {
		editing = false,
		spot,
		onClick = () => {},
		setNewVideo = () => {},
	} = props;

	const [searchValue, setSearchValue] = useState<string>("");
	const [searchResults, setSearchResults] = useState<Video[]>([]);
	return (
		<div className="flex items-center gap-1">
			{spot.video ? (
				<div className="flex flex-col w-full h-fit">
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
							{!editing ? (
								<Button className="text-xs" onClick={() => onClick(spot)}>
									Change Video
								</Button>
							) : null}
						</div>
					</div>
					{editing ? (
						<div className="mt-3 w-full bg-slate-100 rounded-sm h-fit p-3 items-center">
							<p className="text-md font-semibold">Edit Spotlight Slot</p>
							<i className="text-sm">
								Search for a new video to replace this position in the
								spotlight.
							</i>
							<TeamModalInput
								className="mt-3"
								value={searchValue}
								placeholder="Search for a video..."
								title="Spotlighted Video"
								delay={150}
								setValue={async (value) => {
									if (value.length == 0) {
										setSearchResults([]);
									}
									setSearchValue(value);
								}}
								setDelayedValue={async (value) => {
									if (value.length == 0) {
										setSearchResults([]);
										return;
									}
									const results = await props.onSearch(value);
									setSearchResults(results);
								}}
								dropdownClick={(item) => {
									const found = searchResults.find((v) => v.id == item.id);
									if (found) {
										setNewVideo(found);
									}
								}}
								dropdown={GenerateGeneralNSM(searchResults)}
							/>
						</div>
					) : null}
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
	const [activeSpotlightSlot, setActiveSpotlightSlot] =
		useState<Spotlight | null>(null);
	const [changes, setChanges] = useState<Spotlight[]>([]);

	const { updateSpotlight } = useSpotlight();

	const {
		cancelHit = () => {},
		saveHit = () => {},
		saveDone = () => {},
		spotlightedVideos,
	} = props;

	const runUpdateSpotlight = async () => {
		if (changes.length > 0) {
			setSaving(true);
			changes.forEach(async (change) => {
				await updateSpotlight(change);
			});
			setSaving(false);
			saveDone();
		} else {
			saveDone();
		}
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
					saveHit();
					runUpdateSpotlight();
				}}
			>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<h2 className="text-[#101827] font-medium text-xl">
							Spotlighted Videos
						</h2>
						<div className="flex flex-col gap-2">
							{spotlightedVideos != null && spotlightedVideos.length > 0 ? (
								spotlightedVideos.map((spot: any) =>
									!activeSpotlightSlot ||
									activeSpotlightSlot.video_id === spot.video_id ? (
										<VideoSpotlight
											key={spot.video_id}
											spot={spot}
											editing={activeSpotlightSlot?.video_id === spot.video_id}
											onClick={(v) => {
												setActiveSpotlightSlot(v);
											}}
											setNewVideo={(v) => {
												if (!v) return;
												if (
													spotlightedVideos.find((s) => s.video_id === v.id)
												) {
													toast.error(
														"This video is already spotlighted in another slot."
													);
													return;
												}
												spot.video = v;
												spot.video_id = v.id;
												if (
													changes.find((s) => s.rank === spot.rank) ===
													undefined
												) {
													setChanges((prev) => [...prev, spot]);
												} else {
													setChanges((prev) =>
														prev.filter((s) => s.rank !== spot.rank)
													);
													setChanges((prev) => [...prev, spot]);
												}
											}}
											onSearch={props.onSearchVideos}
										/>
									) : null
								)
							) : (
								<div className="flex justify-center py-10">
									<Spinner />
								</div>
							)}
						</div>
					</div>
				</div>
			</TeamModal>
		</>
	);
};

export default SpotlightedVideosModal;
