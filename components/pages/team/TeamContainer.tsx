import { NextRouter } from "next/router";
import PageContainer from "../../general/PageContainer";
import TeamNavbar from "./TeamNavbar";
import TeamTopNav from "./TeamTopNav";

interface Props {
	children: React.ReactNode;
	pageTitle: string;
	router: NextRouter;
}

const TeamContainer = (props: Props) => {
	return (
		<PageContainer className="flex overflow-hidden">
			{/* Sidebar */}
			<TeamNavbar router={props.router} />
			{/* Main content */}
			<div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden px-5 md:px-10">
				<TeamTopNav pageTitle={props.pageTitle} />
				<div className="flex-1 overflow-y-auto">
					{props.children}
				</div>
			</div>
		</PageContainer>
	);
};

export default TeamContainer;
