import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";

const CheckoutsPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Checkouts" router={router}>
			<TeamHeader title="System Assets"/>
		</TeamContainer>
	);
};

export default CheckoutsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Checkouts",
		},
	};
};
