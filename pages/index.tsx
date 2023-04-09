/* eslint-disable react/no-unescaped-entities */
import PageContainer from "../components/general/PageContainer";
import LineBreakText from "../components/general/LineBreakText";
import GoogleLoginButton from "../components/pages/GoogleLoginButton";
import LoginInputText from "../components/pages/LoginInputText";
import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const login = () => {
    console.log("Login");
  };

  return (
    <PageContainer className="flex">
      {/* Left Container */}
      <div className="xl:w-1/2 md:w-4/5 w-full h-full items-center justify-center flex">
        <div className="sm:w-[500px] w-full px-5 sm:px-0">
          <h2 className="text-3xl font-bold tracking-tight">Login ✌️</h2>
          <p className="mt-1 pb-10">
            Let's get things rolling! Get started below...
          </p>
          <GoogleLoginButton />
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
          <a className="text-blue-600 font-medium float-right mt-4">
            Forgot Password?
          </a>
          <button
            className="w-full bg-blue-600 text-white py-4 rounded-xl mt-9"
            onClick={login}
          >
            Login
          </button>
        </div>
      </div>
      {/* Right Container */}
      <div className="xl:w-1/2 md:w-1/5 w-[50px] hidden sm:block h-full bg-[url('/backgrounds/login.jpeg')] bg-cover bg-no-repeat bg-center"></div>
    </PageContainer>
  );
};

export default LoginPage;
