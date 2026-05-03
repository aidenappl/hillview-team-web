import { useRouter } from "next/router";
import { useState } from "react";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";
import Button from "../../../components/general/Button";
import UsersPagePlatformUsers from "../../../components/pages/team/users/UsersPagePlatformUsers";
import UsersPageTeamUsers from "../../../components/pages/team/users/UsersPageTeamUsers";

type Tab = "Team" | "Platform";

const TABS: Tab[] = ["Team", "Platform"];

const UsersPage = () => {
	const router = useRouter();
	const [tab, setTab] = useState<Tab>("Team");
	const [showCreateUser, setShowCreateUser] = useState(false);

	const tabSwitcher = (size: "sm" | "md") => (
		<div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
			{TABS.map((t) => (
				<button
					key={t}
					onClick={() => setTab(t)}
					className={[
						"rounded-md font-medium transition-colors",
						size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-1 text-xs",
						tab === t
							? "bg-blue-600 text-white shadow-sm"
							: "text-slate-600 hover:text-slate-900",
					].join(" ")}
				>
					{t}
				</button>
			))}
		</div>
	);

	return (
		<TeamContainer pageTitle="Users" router={router}>
			{/* Header — desktop */}
			<div className="hidden sm:block">
				<TeamHeader title={tab === "Team" ? "Team Users" : "Platform Users"}>
					<div className="flex items-center gap-3 h-full">
						{tab === "Platform" && (
							<Button onClick={() => setShowCreateUser(true)}>Create User</Button>
						)}
						{tabSwitcher("md")}
					</div>
				</TeamHeader>
			</div>

			{/* Header — mobile */}
			<div className="flex sm:hidden items-center justify-between py-3">
				{tabSwitcher("sm")}
				{tab === "Platform" && (
					<Button onClick={() => setShowCreateUser(true)}>New User</Button>
				)}
			</div>

			{tab === "Platform" && (
				<UsersPagePlatformUsers
					showCreateUser={showCreateUser}
					setShowCreateUser={setShowCreateUser}
				/>
			)}
			{tab === "Team" && <UsersPageTeamUsers />}
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
