import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";

const SettingsPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Settings" router={router}>
			<h1>Settings</h1>
		</TeamContainer>
	);
};

export default SettingsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Settings",
		},
	};
};
