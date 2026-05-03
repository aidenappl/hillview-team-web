import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { GetAccountLander } from "../services/accountLander";
import { selectUser, selectLoggedIn } from "../redux/user/slice";
import PageHead from "../components/PageHead";
import ErrorBoundary from "../components/general/ErrorBoundary";
import StoreProvider from "../components/StoreProvider";
import { User } from "../types";
config.autoAddCss = false;

interface PageProps {
	protected?: boolean;
	allowAuthenticatedUsers?: boolean;
	requireAccountStatus?: string;
	title?: string;
	[key: string]: any;
}

interface GlobalAuthProps {
	children: any;
	pageProps: PageProps;
}

// GlobalAuth checks authorization synchronously from Redux state.
// StoreProvider guarantees auth has been resolved before this ever renders,
// so loggedIn/user are already correct on first render — no async needed.
const GlobalAuth = ({ children, pageProps }: GlobalAuthProps) => {
	const user = useSelector(selectUser);
	const loggedIn = useSelector(selectLoggedIn);
	const router = useRouter();

	const isProtected = pageProps.protected !== false; // default: true
	const allowAuthUsers = pageProps.allowAuthenticatedUsers !== false; // default: true
	const requireStatus = pageProps.requireAccountStatus ?? null;

	const isAuthorized = useMemo<boolean>(() => {
		if (!isProtected) {
			// Unprotected page (e.g. login, status pages)
			// Redirect logged-in users away only if the page explicitly disallows them
			if (loggedIn && !allowAuthUsers) return false;
			return true;
		}
		// Protected page — must be logged in
		if (!loggedIn || !user) return false;
		// Optional: restrict to a specific account status
		if (requireStatus && requireStatus !== user.authentication.short_name) {
			return false;
		}
		return true;
	}, [loggedIn, user, isProtected, allowAuthUsers, requireStatus]);

	useEffect(() => {
		if (!isAuthorized) {
			const lander = GetAccountLander(user);
			const query: Record<string, string> = {};
			if (lander === "/") {
				query.redirect = router.asPath;
			}
			router.replace({ pathname: lander, query });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthorized]);

	if (!isAuthorized) return null;
	return children;
};

const AppContent = ({ Component, pageProps }: AppProps) => {
	return (
		<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
			<PageHead title={pageProps.title} />
			<Toaster
				position="bottom-left"
				toastOptions={{
					style: {
						maxWidth: "40%",
						width: "fit-content",
					},
				}}
			/>
			<GlobalAuth pageProps={pageProps}>
				<ErrorBoundary>
					<Component {...pageProps} />
				</ErrorBoundary>
			</GlobalAuth>
		</GoogleOAuthProvider>
	);
};

const App = (props: AppProps) => {
	return (
		<StoreProvider>
			<AppContent {...props} />
		</StoreProvider>
	);
};

export default App;
