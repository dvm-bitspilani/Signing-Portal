import { React, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { apiBaseURL } from "../../global";
import axios from "axios";
import { handleApiErrorToast, showLoadingToast, dismissToast } from "../../assets/utils/toast.js";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo") || "/";
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    const loadingToastId = showLoadingToast("Signing you in...");

    axios
      .post(
        `${apiBaseURL}/api/auth/`,
        {
          token: credentialResponse.credential,
        },
        {
          headers: {
            accept: "application/json",
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        dismissToast(loadingToastId);

        localStorage.setItem(
          "username",
          jwtDecode(credentialResponse.credential).name
        );
        localStorage.setItem(
          "profilePicURL",
          jwtDecode(credentialResponse.credential).picture
        );

        localStorage.setItem("accessToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);
        const accessTokenExpiry = new Date();
        accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1);
        localStorage.setItem(
          "accessTokenExpiry",
          accessTokenExpiry.toISOString()
        );
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
        localStorage.setItem(
          "refreshTokenExpiry",
          refreshTokenExpiry.toISOString()
        );
        navigate(redirectTo, { replace: true });
      })
      .catch((error) => {
        setIsLoading(false);
        dismissToast(loadingToastId);
        handleError(error);
      });
  };

  const handleError = (error) => {
    handleApiErrorToast(error, "Please use your BITS email ID to sign in. If your BITS email ID is not working, please contact support.");
  };

  return (
    <div className="min-h-screen bg-app-gradient flex flex-col">
      {/* Minimal header with theme toggle */}
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Logo and Branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                <img 
                  src="https://res.cloudinary.com/dhrbeqvcw/image/upload/v1760900997/logo2_r7itzj.png" 
                  alt="BITS Oasis Logo" 
                  className="relative h-20 w-20"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Signings Portal
              </h1>
              <p className="text-muted-foreground mt-1">
                BITS Pilani, Pilani Campus
              </p>
            </div>
          </div>

          {/* Sign In Card */}
          <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 px-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Welcome</span>
                </div>
                <h2 className="text-xl font-semibold">
                  Sign in to continue
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access events, merchandise, and your bookings
                </p>
              </div>
              
              {isLoading ? (
                <div className="space-y-4 py-2">
                  <Skeleton className="h-11 w-full rounded-full" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Authenticating...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Google Sign-In Button Container */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleLoginSuccess}
                      onError={handleError}
                      auto_select={true}
                      shape="pill"
                      theme="outline"
                      text="continue_with"
                      size="large"
                      width="280"
                      logo_alignment="center"
                    />
                  </div>
                  
                  {/* Info Alert */}
                  <Alert className="border-border bg-muted/50">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs text-muted-foreground ml-2">
                      Use your official <span className="font-medium text-foreground">@pilani.bits-pilani.ac.in</span> email address
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <p className="text-center text-xs text-muted-foreground px-4">
            By signing in, you agree to our event booking terms and conditions. 
            Your data is secured and used only for fest activities.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ by <span className="font-medium">DVM</span>, BITS Pilani
        </p>
      </footer>
    </div>
  );
};

export default SignIn;
