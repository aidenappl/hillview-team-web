import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import {
	GeneralNSM,
	GenerateGeneralNSM,
} from "../../../models/generalNSM.model";
import { useState } from "react";
import UsersPagePlatformUsers from "../../../components/pages/team/users/UsersPagePlatformUsers";
import UsersPageTeamUsers from "../../../components/pages/team/users/UsersPageTeamUsers";

type PageStates = "Platform" | "Team";

const UsersPage = () => {
	const router = useRouter();

	const pages = GenerateGeneralNSM(["Team", "Platform"]);
	const [pageState, setPageState] = useState<PageStates>("Team");

	return (
		<TeamContainer pageTitle="Users" router={router}>
			<TeamHeader title={"Platform Users"}>
				<div className="w-[150px]">
					<TeamModalSelect
						values={pages}
						value={pages[0]}
						setValue={(value): void => {
							setPageState(value.name as PageStates);
						}}
					/>
				</div>
			</TeamHeader>
			{pageState === "Platform" ? <UsersPagePlatformUsers /> : null}
			{pageState === "Team" ? <UsersPageTeamUsers /> : null}
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
