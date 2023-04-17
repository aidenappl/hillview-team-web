import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";

const UsersPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Users" router={router}>
			<TeamHeader title={"Platform Users - Under Construction (sorry)"}/>
		</TeamContainer>
	);
};

export default UsersPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Users",
		},
	};
};
