import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";

const LinksPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Links" router={router}>
			<h1>Links</h1>
		</TeamContainer>
	);
};

export default LinksPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Links",
		},
	};
};
