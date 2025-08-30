import Spinner from "../../../general/Spinner";
import Button from "../../../general/Button";
import Link from "next/link";
import Image from "next/image";
import { Video } from "../../../../types";

type Props = {
	videos: Video[] | null;
	onInspect: (v: Video) => void;
	onPublish: (v: Video) => void;
	onLoadMore: () => void;
	loadingMore: boolean;
};

export const VideosTable = ({
	videos,
	onInspect,
	onPublish,
	onLoadMore,
	loadingMore,
}: Props) => {
	return (
		<div className="w-full h-[calc(100%-100px)] md:h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
			{/* Header Row */}
			<div className="text-sm grid grid-cols-[1fr_80px] sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-6 items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="hidden md:block w-[200px] xl:w-[250px]" />
				<p className="font-semibold">Title</p>
				<p className="hidden font-semibold xl:block">Downloads</p>
				<p className="hidden font-semibold md:block">Views</p>
				<p className="hidden font-semibold md:block">Status</p>
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>

			{/* Body */}
			<div className="w-full h-[calc(100%-70px)]">
				{videos && videos.length > 0 ? (
					<>
						{videos.map((video) => (
							<VideoRow
								key={video.id}
								video={video}
								onInspect={() => onInspect(video)}
								onPublish={() => onPublish(video)}
							/>
						))}
						<div className="w-full h-[80px] sm:h-[150px] flex items-center justify-center">
							<Button onClick={onLoadMore} disabled={loadingMore}>
								{loadingMore ? "Loading..." : "Load More"}
							</Button>
						</div>
					</>
				) : (
					<div className="w-full h-[100px] flex items-center justify-center">
						<Spinner />
					</div>
				)}
			</div>
		</div>
	);
};

function VideoRow({
	video,
	onInspect,
	onPublish,
}: {
	video: Video;
	onInspect: () => void;
	onPublish: () => void;
}) {
	return (
		<div
			className="text-sm relative grid grid-cols-[1fr_80px] sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-6 items-center w-full h-[50px] sm:h-[100px] flex-shrink-0 hover:bg-slate-50 cursor-pointer"
			onClick={onInspect}
		>
			{/* Thumbnail */}
			<div className="items-center justify-center hidden px-2 md:flex">
				<div
					className="relative w-[130px] h-[75px] rounded-md overflow-hidden shadow-md border cursor-pointer"
					onClick={(e) => {
						e.stopPropagation();
						document.getElementById("watch-video-" + video.uuid)?.click();
					}}
				>
					<Image
						fill
						style={{ objectFit: "cover" }}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
						src={video.thumbnail}
						alt={"video " + video.title}
					/>
				</div>
			</div>

			{/* Title */}
			<p className="pr-2">{video.title}</p>

			{/* Downloads */}
			<p className="hidden pr-2 xl:block">
				{video.downloads} {video.downloads === 1 ? "download" : "downloads"}
			</p>

			{/* Views */}
			<p className="hidden pr-2 md:block">{video.views} views</p>

			{/* Status */}
			<p className="text-right sm:text-left">
				<span
					className={
						"sm:px-3 sm:py-1.5 sm:text-sm sm:rounded-md px-2 py-1 rounded text-xs " +
						(video.status.short_name == "public"
							? "text-white bg-green-500"
							: video.status.short_name == "unlisted"
							? "text-white bg-green-700"
							: "text-white bg-slate-500")
					}
				>
					{video.status.name}
				</span>
			</p>

			{/* Actions */}
			<div className="absolute right-0 justify-end hidden gap-2 pr-2 sm:flex">
				<Button
					onClick={(e) => {
						e.stopPropagation();
						onInspect();
					}}
				>
					Inspect
				</Button>
				{video.status.short_name != "draft" && (
					<Link
						href={"https://hillview.tv/watch?v=" + video.uuid}
						target="_blank"
						className="hidden lg:block"
						id={"watch-video-" + video.uuid}
						onClick={(e) => e.stopPropagation()}
					>
						<Button variant="secondary">Watch</Button>
					</Link>
				)}
				{video.status.short_name != "public" && (
					<Button
						onClick={(e) => {
							e.stopPropagation();
							onPublish();
						}}
					>
						Publish
					</Button>
				)}
			</div>
		</div>
	);
}
