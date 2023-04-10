import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";

const UsersPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Users" router={router}>
			<h1>Users</h1>
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
