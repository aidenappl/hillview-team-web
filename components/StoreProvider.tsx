import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { getStore } from "../redux/store";
import { setAuthLoading } from "../redux/user/slice";
import { LoadSessionFromStore } from "../services/sessionHandler";
import LoadingScreen from "./general/LoadingScreen";

// Module-level flag — persists across React StrictMode's double-invoke, resets on page reload.
// Ensures LoadSessionFromStore only runs once per app load.
let authInitialized = false;

function AppInitializer({ children }: { children: ReactNode }) {
	// If auth has already been initialized (e.g. StrictMode remount), start ready immediately
	const [isReady, setIsReady] = useState(authInitialized);

	useEffect(() => {
		if (authInitialized) return;
		authInitialized = true;

		const store = getStore();

		(async () => {
			const result = await LoadSessionFromStore({ dispatch: store.dispatch });

			// If auth failed, ensure loading state is cleared so the app doesn't stall
			if (!result?.success) {
				store.dispatch(setAuthLoading(false));
			}

			setIsReady(true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!isReady) {
		return <LoadingScreen />;
	}

	return <>{children}</>;
}

interface StoreProviderProps {
	children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
	const store = getStore();

	return (
		<Provider store={store}>
			<AppInitializer>{children}</AppInitializer>
		</Provider>
	);
}
