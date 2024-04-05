import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import TeamModalSelect from "../../../components/pages/team/TeamModalSelect";
import { GenerateGeneralNSM } from "../../../models/generalNSM.model";
import { useState } from "react";
import UsersPagePlatformUsers from "../../../components/pages/team/users/UsersPagePlatformUsers";
import UsersPageTeamUsers from "../../../components/pages/team/users/UsersPageTeamUsers";

type PageStates = "Platform" | "Team";

const UsersPage = () => {
	const router = useRouter();

	const pages = GenerateGeneralNSM(["Team", "Platform"]);
	const [pageState, setPageState] = useState<PageStates>("Team");
	const [showCreateUser, setShowCreateUser] = useState<boolean>(false);

	return (
		<TeamContainer pageTitle="Users" router={router}>
			<TeamHeader title={"Platform Users"}>
				<div className="flex gap-4 items-center h-full">
					{pageState === "Platform" ? (
						<button
							className="px-5 text-sm py-2 bg-blue-800 hover:bg-blue-900 transition text-white rounded-sm"
							onClick={() => {
								setShowCreateUser(true);
							}}
						>
							Create User
						</button>
					) : null}
					<div className="w-[150px] h-fit">
						<TeamModalSelect
							values={pages}
							value={pages[0]}
							setValue={(value): void => {
								setPageState(value.name as PageStates);
							}}
						/>
					</div>
				</div>
			</TeamHeader>
			{pageState === "Platform" ? (
				<UsersPagePlatformUsers
					showCreateUser={showCreateUser}
					setShowCreateUser={setShowCreateUser}
				/>
			) : null}
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
