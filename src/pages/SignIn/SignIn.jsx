import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { apiBaseURL } from "../../global";
import axios from "axios";
import {
  handleApiErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../assets/utils/toast.js";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "../../components/theme-toggle";
import { BrandMark } from "../ComComponent/Navbar/Navbar";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    const loadingToastId = showLoadingToast("Signing you in…");

    axios
      .post(
        `${apiBaseURL}/api/auth/`,
        { token: credentialResponse.credential },
        { headers: { accept: "application/json" } },
      )
      .then((response) => {
        setIsLoading(false);
        dismissToast(loadingToastId);

        const claims = jwtDecode(credentialResponse.credential);
        localStorage.setItem("username", claims.name);
        localStorage.setItem("profilePicURL", claims.picture);

        localStorage.setItem("accessToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);

        const accessTokenExpiry = new Date();
        accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1);
        localStorage.setItem("accessTokenExpiry", accessTokenExpiry.toISOString());

        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
        localStorage.setItem("refreshTokenExpiry", refreshTokenExpiry.toISOString());

        navigate(redirectTo, { replace: true });
      })
      .catch((error) => {
        setIsLoading(false);
        dismissToast(loadingToastId);
        handleError(error);
      });
  };

  const handleError = (error) => {
    handleApiErrorToast(
      error,
      "Sign in with your BITS email. If it still won't work, check the Help page.",
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        {/* The one orchestrated moment in the app: mark, wordmark, the Oasis
            stripe drawing across, then the control. */}
        <div className="w-full max-w-[19rem]">
          <div className="rise" style={{ "--delay": "0ms" }}>
            <BrandMark className="size-14 rounded-lg" />
          </div>

          <h1
            className="display rise mt-6 text-[2.1rem] uppercase leading-[0.95]"
            style={{ "--delay": "80ms" }}
          >
            Oasis
            <br />
            Signings
          </h1>

          <p
            className="label-mono rise mt-3 text-muted-foreground"
            style={{ "--delay": "140ms" }}
          >
            BITS Pilani · Pilani campus
          </p>

          <div
            className="brand-rule draw mt-7 h-0.5 w-full"
            style={{ "--delay": "200ms" }}
            aria-hidden="true"
          />

          <div className="rise mt-7" style={{ "--delay": "280ms" }}>
            {isLoading ? (
              <div>
                <Skeleton className="h-10 w-full rounded-full" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Checking your account…
                </p>
              </div>
            ) : (
              <>
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={handleError}
                  auto_select
                  shape="pill"
                  theme="outline"
                  text="continue_with"
                  size="large"
                  width="304"
                  logo_alignment="center"
                />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Use your{" "}
                  <span className="numeral text-foreground">
                    @pilani.bits-pilani.ac.in
                  </span>{" "}
                  address. Personal accounts won't get through.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 py-8">
        <p className="label-mono text-center text-muted-foreground">
          Built by DVM
        </p>
      </footer>
    </div>
  );
};

export default SignIn;
