/* eslint-disable react/no-unescaped-entities */
import PageContainer from "../components/general/PageContainer";
import LineBreakText from "../components/general/LineBreakText";
import GoogleLoginButton from "../components/pages/GoogleLoginButton";
import LoginInputText from "../components/pages/LoginInputText";
import { useState } from "react";
import Spinner from "../components/general/Spinner";
import { CodeResponse, useGoogleLogin } from "@react-oauth/google";
import { InitializeSession } from "../services/sessionHandler";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { GetAccountLander } from "../services/accountLander";
import { FetchAPI } from "../services/http/requestHandler";
import toast from "react-hot-toast";
import { GoogleAuthResponse } from "../types";

const LoginPage = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loadingGoogle, setGoogleLoading] = useState<boolean>(false);
	const [loadingLocal, setLoadingLocal] = useState<boolean>(false);

	const router = useRouter();
	const dispatch = useDispatch();

	const googleLogin = () => {
		console.log("Google Login");
		setGoogleLoading(true);
		triggerLoginWindow();
	};

	const localLogin = async (): Promise<void> => {
		if (email && password && !loadingLocal && !loadingGoogle) {
			setLoadingLocal(true);
			const response = await FetchAPI<any>({
				url: "/auth/v1.1/local",
				method: "POST",
				data: {
					email,
					password,
				},
			});
			console.log(response);

			if (response.success) {
				let data = response.data;
				const initializerResp = await InitializeSession({
					accessToken: data.accessToken,
					refreshToken: data.refreshToken,
					user: data.user,
					dispatch,
				});
				if (initializerResp.success) {
					if (router.query.redirect) {
						router.push(router.query.redirect as string);
						setLoadingLocal(false);
					} else {
						router.push(GetAccountLander(data.user));
						setLoadingLocal(false);
					}
				}
			} else {
				console.error("Error");
				setLoadingLocal(false);
			}
		} else {
			console.error("Error");
			setLoadingLocal(false);
		}
	};

	const handleGoogleResponse = async (
		tokenResponse: Omit<
			CodeResponse,
			"error" | "error_description" | "error_uri"
		>
	): Promise<void> => {
		if (tokenResponse.code && !loadingLocal) {
			const response = await FetchAPI<GoogleAuthResponse>({
				url: "/auth/v1.1/google",
				method: "POST",
				data: {
					google_code: tokenResponse.code,
					redirect_uri: process.env.NEXT_PUBLIC_BASE_URL,
				},
			});

			if (response.success) {
				let data = response.data;
				const initializerResp = await InitializeSession({
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
					user: data.user,
					dispatch,
				});
				if (initializerResp.success) {
					if (router.query.redirect) {
						router.push(router.query.redirect as string);
						// setGoogleLoading(false);
					} else {
						router.push(GetAccountLander(data.user));
						// setGoogleLoading(false);
					}
				}
			} else {
				console.error("Error");
				toast.error(response.error_message);
			}
		}
	};

	const triggerLoginWindow = useGoogleLogin({
		onSuccess: (tokenResponse) => handleGoogleResponse(tokenResponse),
		onError(errorResponse) {
			console.error(errorResponse);
			setGoogleLoading(false);
		},
		onNonOAuthError(nonOAuthError) {
			console.error(nonOAuthError);
			setGoogleLoading(false);
		},
		flow: "auth-code",
	});

	return (
		<PageContainer className="flex">
			{/* Left Container */}
			<div className="xl:w-1/2 md:w-4/5 w-full h-full items-center justify-center flex">
				<div className="sm:w-[500px] w-full px-5 sm:px-0">
					<h2 className="text-3xl font-bold tracking-tight">Login ✌️</h2>
					<p className="mt-1 pb-10">
						Let's get things rolling! Get started below...
					</p>
					<GoogleLoginButton loading={loadingGoogle} onClick={googleLogin} />
					<LineBreakText text="or Sign in with Email" />
					<LoginInputText
						value={email}
						placeholder="Enter your email..."
						label="Email"
						wrapperClassName="mt-10"
						setValue={setEmail}
					/>
					<LoginInputText
						value={password}
						type="password"
						placeholder="Enter your password..."
						label="Password"
						wrapperClassName="mt-4"
						setValue={setPassword}
					/>
					<a className="text-blue-600 font-medium float-right mt-4 cursor-pointer">
						Forgot Password?
					</a>
					<button
						className="w-full bg-blue-600 text-white py-4 rounded-xl mt-9 relative h-[56px]"
						onClick={localLogin}
					>
						{loadingLocal ? (
							<Spinner wrapperClass="full-center" size={25} style="light" />
						) : (
							"Login"
						)}
					</button>
				</div>
			</div>
			{/* Right Container */}
			<div className="xl:w-1/2 md:w-1/5 w-[50px] hidden sm:block h-full bg-[url('/backgrounds/login.jpeg')] bg-cover bg-no-repeat bg-center"></div>
		</PageContainer>
	);
};

export async function getStaticProps() {
	return {
		props: {
			protected: false,
			allowAuthenticatedUsers: false,
		},
	};
}

export default LoginPage;
