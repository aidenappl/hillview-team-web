import { useEffect, useState } from "react";

interface Props {
	url: string;
	show?: boolean;
	onCurrentTime?: (time: number) => void;
	onCloseHit?: () => void;
	onSelectFrame?: (time: number) => void;
}

export const FrameGrabber = (props: Props) => {
	const {
		url,
		onCurrentTime = () => {},
		show = false,
		onCloseHit = () => {},
		onSelectFrame = () => {},
	} = props;

	const [currentTime, setCurrentTime] = useState<number>(0);

	useEffect(() => {
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				onCloseHit();
			}
		});
	}, []);

	return (
		<>
			{show && (
				<div className="full-center bg-white p-10 w-[150%] z-10 shadow-md rounded-md">
					<div className="flex flex-col mb-7">
						<h2 className="text-xl font-semibold">
							Frame Selector
						</h2>
						<p className="text-sm">
							Scrub to a part of the video you want to select as
							the thumbnail.
						</p>
					</div>
					<video
						src={url}
						controls
						className="w-full"
						onTimeUpdate={(e: any) => {
							onCurrentTime(e.target.currentTime);
							setCurrentTime(e.target.currentTime);
						}}
					/>
					<div className="flex justify-end gap-2">
						<button
							onClick={onCloseHit}
							className={
								"mt-10 w-[70px] h-[36px] flex items-center justify-center text-white font-medium rounded-md text-sm bg-slate-600 hover:bg-slate-700"
							}
						>
							<span>Close</span>
						</button>
						<button
							onClick={() => {
								onSelectFrame(currentTime);
							}}
							className={
								"mt-10 w-[120px] h-[36px] flex items-center justify-center text-white font-medium rounded-md text-sm bg-blue-600 hover:bg-blue-700"
							}
						>
							<span>Select Frame</span>
						</button>
					</div>
				</div>
			)}
		</>
	);
};
