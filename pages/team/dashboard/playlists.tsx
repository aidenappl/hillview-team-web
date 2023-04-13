import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Spinner from "../../../components/general/Spinner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Playlist } from "../../../models/playlist.model";
import Image from "next/image";
import { NewRequest } from "../../../services/http/requestHandler";

const PlaylistsPage = () => {
	const router = useRouter();
	const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
		null
	);

	const initialize = async () => {
		setPlaylists(null);
		const response = await NewRequest({
			method: "GET",
			route: "/core/v1.1/admin/playlists",
			params: {
				limit: 50,
				offset: 0,
			},
			auth: true,
		});
		if (response.success) {
			let data = response.data.data;
			console.log(data);
			setPlaylists(data);
		}
	};

	useEffect(() => {
		initialize();
	}, []);

	return (
		<TeamContainer pageTitle="Playlists" router={router}>
			{/* Team Heading */}
			<TeamHeader title="System Playlists" />
			{/* Data Body */}
			<div className="flex items-center w-full h-[70px] flex-shrink-0 relative pr-4">
				<div className="w-[300px]" />
				<p className="w-1/2 font-semibold">Title</p>
				<p className="w-1/2 font-semibold">Route</p>
				<div className="w-[200px]" />
				<div className="w-full h-[1px] absolute bottom-0 right-0 bg-[#ebf0f6]" />
			</div>
			<div className="w-full h-[calc(100%-170px)] overflow-y-auto overflow-x-auto">
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<>
						{playlists && playlists.length > 0 ? (
							playlists.map((playlist, index) => {
								return (
									<div
										key={index}
										className="flex items-center w-full h-[100px] flex-shrink-0 hover:bg-slate-50"
									>
										<div className="w-[300px] flex items-center justify-center">
											<div
												className="relative w-[130px] h-[75px] rounded-md overflow-hidden shadow-md border cursor-pointer"
												onClick={() => {
													document
														.getElementById(
															"open-playlist-" +
																playlist.id
														)
														?.click();
												}}
											>
												<Image
													fill
													style={{
														objectFit: "cover",
													}}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw,  33vw"
													src={playlist.banner_image}
													alt={
														"video " + playlist.name
													}
												/>
											</div>
										</div>
										<p className="w-1/2">{playlist.name}</p>
										<p className="w-1/2">
											{playlist.route}
										</p>
										<div className="w-[200px] flex gap-2 pr-10">
											<button
												className="px-4 text-sm py-1.5 bg-blue-600 hover:bg-blue-800 transition text-white rounded-md"
												onClick={() => {
													setSelectedPlaylist(
														playlist
													);
												}}
											>
												Inspect
											</button>
											<Link
												href={
													"https://hillview.tv/playlist/" +
													playlist.route
												}
												target="_blank"
												id={
													"open-playlist-" +
													playlist.id
												}
											>
												<button className="px-4 text-sm py-1.5 bg-slate-600 hover:bg-slate-800 transition text-white rounded-md">
													Open
												</button>
											</Link>
										</div>
									</div>
								);
							})
						) : (
							<div className="w-full h-[100px] flex items-center justify-center">
								<Spinner />
							</div>
						)}
					</>
				</div>
			</div>
		</TeamContainer>
	);
};

export default PlaylistsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Playlists",
		},
	};
};
