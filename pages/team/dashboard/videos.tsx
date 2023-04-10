import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";

const VideosPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Videos" router={router}>
			<h1>Videos</h1>
		</TeamContainer>
	);
};

export default VideosPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Videos",
		},
	};
};
