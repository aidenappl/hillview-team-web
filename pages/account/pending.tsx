import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { KillSession } from "../../services/sessionHandler";

const PendingPage = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	return (
		<div className="flex items-center justify-center w-full h-screen">
			<div className="hidden sm:block w-11 h-11 bg-[url(/logos/hillviewTVColor.png)] bg-contain bg-no-repeat absolute top-10 left-10"></div>
			<div className="grid grid-cols-1 w-[calc(100%-70px)] sm:w-[600px]">
				<h1 className="w-full text-4xl font-semibold text-center">
					Your account is Pending Approval
				</h1>
				<p className="ml-[auto] mr-[auto] text-center mt-6 text-gray-500">
					You are unable to access Hillview Team resources until your
					account is approved. Please contact a user with adequate
					permissions.
				</p>
				<button
					className="w-[120px] h-[42px] bg-[#0070F3] text-white font-medium rounded-md ml-auto mr-auto mt-12"
					onClick={() => {
						KillSession({ dispatch, router, navigate: true });
					}}
				>
					Logout
				</button>
			</div>
		</div>
	);
};

export default PendingPage;

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: "unauthorized",
			title: "Hillview Team - Pending",
		},
	};
};
