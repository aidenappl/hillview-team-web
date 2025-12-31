import { useEffect } from "react";
import PageContainer from "../components/general/PageContainer";
import { Logout } from "../services/logoutHandler";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

const LogoutPage = () => {
	const dispatch = useDispatch();
	const router = useRouter();

	useEffect(() => {
		Logout({
			dispatch: dispatch,
			router: router,
		});
	}, [dispatch, router]);

	return (
		<PageContainer>
			<h1>Logout</h1>
		</PageContainer>
	);
};

export default LogoutPage;
