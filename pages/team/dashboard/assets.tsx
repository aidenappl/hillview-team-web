import { useRouter } from "next/router";
import TeamContainer from "../../../components/pages/team/TeamContainer";
import TeamHeader from "../../../components/pages/team/TeamHeader";

const AssetsPage = () => {
	const router = useRouter();
	return (
		<TeamContainer pageTitle="Assets" router={router}>
			{/* Team Heading */}
			<TeamHeader title="System Assets" />
			{/* Data Content */}
			<div className="w-full h-[calc(100%-100px)] overflow-y-auto overflow-x-auto">
				{/* Table Header */}
				<div className="flex justify-between items-center w-full h-[70px] flex-shrink-0">
					<div className="w-[110px]" />
					<p>Asset</p>
					<p>Identifier</p>
					<p>Device Type</p>
					<p>Status</p>
					<div />
				</div>
				{/* Table Body */}
				<div className="w-full h-[calc(100%-70px)]">
					<div className="flex justify-between items-center w-full h-[70px] flex-shrink-0">
						<div className="w-[110px]"></div>
						<p>Asset</p>
						<p>Identifier</p>
						<p>Device Type</p>
						<p>Status</p>
						<div />
					</div>
				</div>
			</div>
		</TeamContainer>
	);
};

export default AssetsPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "admin",
			title: "Hillview Team - Assets",
		},
	};
};
