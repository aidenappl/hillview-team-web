import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";

const PlaylistsPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Playlists" router={router}>
			<h1>Playlists</h1>
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
