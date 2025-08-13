import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	LoadSessionFromStore,
	SessionInService,
} from "../services/sessionHandler";
import { wrapper } from "../redux/store";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { GetAccountLander } from "../services/accountLander";
import { selectUser } from "../redux/user/slice";
import PageHead from "../components/PageHead";
config.autoAddCss = false;

interface RouteGuardParams {
	children: any;
	componentProps: any;
}

interface GlobalAuthProps {
	user: User;
	protected?: boolean;
	allowAuthenticatedUsers?: boolean;
	requireAccountStatus?: string;
	requireAccountGrant?: string;
}

const AuthCheck = async (opts: GlobalAuthProps) => {
	let session = await SessionInService();
	let { user } = opts;
	if (opts.protected) {
		// is there a session?
		if (session) {
			// Continue - Check if required account status & grants are met
			if (
				opts.requireAccountStatus &&
				opts.requireAccountStatus !== user.authentication.short_name
			) {
				return false;
			}
			if (
				opts.requireAccountGrant &&
				opts.requireAccountGrant !== user.authentication.short_name
			) {
				return false;
			}
			return true;
		} else {
			// Redirect to login
			return false;
		}
	} else {
		if (session && !opts.allowAuthenticatedUsers) {
			// Page is not protected but does not allow authenticated users
			return false;
		}
		return true;
	}
};

const GlobalAuth = (props: RouteGuardParams) => {
	const { children, componentProps } = props;
	const [authorized, setAuthorized] = useState(false);

	const user = useSelector(selectUser);
	const router = useRouter();

	let opts: GlobalAuthProps = {
		allowAuthenticatedUsers:
			typeof componentProps.allowAuthenticatedUsers !== "undefined"
				? componentProps.allowAuthenticatedUsers
				: true,
		protected:
			typeof componentProps.protected !== "undefined"
				? componentProps.protected
				: true,
		requireAccountStatus: componentProps.requireAccountStatus || null,
		requireAccountGrant: componentProps.requireAccountGrant || null,
		user: user,
	};

	useEffect(() => {
		AuthCheck(opts).then((result) => {
			setAuthorized(result);
			if (result === false) {
				let query = {} as any;
				let lander = GetAccountLander(user);
				console.log(lander);
				if (lander === "/") {
					query.redirect = router.asPath;
				}
				router.replace({
					pathname: lander,
					query: query,
				});
			}
		});
	}, [router]);

	return authorized && children;
};

const App = ({ Component, pageProps }: AppProps) => {
	const [loading, setLoading] = useState(true);
	const [hasInitialized, setInitialization] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		init(dispatch);
	}, [dispatch]);

	const init = async (dispatch: any) => {
		try {
			if (hasInitialized) return true;
			const response = await LoadSessionFromStore({ dispatch });
			if (response) {
				setLoading(false);
				setInitialization(true);
			}
			return true;
		} catch (error) {
			throw error;
		}
	};

	return (
		<>
			<GoogleOAuthProvider
				clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
			>
				<PageHead title={pageProps.title} />
				<Toaster
					position="bottom-left"
					toastOptions={{
						className: "",
						style: {
							maxWidth: "40%",
							width: "fit-content",
						},
					}}
				/>
				{!loading ? (
					<GlobalAuth componentProps={pageProps}>
						<Component {...pageProps} />{" "}
					</GlobalAuth>
				) : null}
			</GoogleOAuthProvider>
		</>
	);
};

export default wrapper.withRedux(App);
