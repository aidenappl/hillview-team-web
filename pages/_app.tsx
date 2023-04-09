import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LoadSessionFromStore } from "../services/sessionHandler";
import { wrapper } from "../redux/store";
config.autoAddCss = false;

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
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </>
  );
}


export default wrapper.withRedux(App)