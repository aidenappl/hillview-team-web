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
		<PageContainer className="flex">
			{/* Left Navigation */}
			<TeamNavbar router={props.router}/>
			{/* Top Navigation */}
			<div className="w-[calc(100%-250px)] lg:w-[calc(100%-290px)] xl:w-[calc(100%-325px)] 2xl:w-[calc(100%-350px)] h-full flex flex-col px-[40px]">
				<TeamTopNav pageTitle={props.pageTitle} />
				{/* Page Content */}
				<div className="w-full h-[calc(100%-160px)]">
					{props.children}
				</div>
			</div>
		</PageContainer>
	);
};

export default TeamContainer;
