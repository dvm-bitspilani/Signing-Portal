import { React, useState } from "react";
import Navbar from "../ComComponent/Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { apiBaseURL } from "../../global";
import axios from "axios";
import { handleApiErrorToast, showLoadingToast, dismissToast } from "../../assets/utils/toast.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

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
    // Use the API error handling to show the actual error message from the server
    // If it's a BITS email validation error, the API should return the appropriate message
    handleApiErrorToast(error, "Please use your BITS email ID to sign in. If your BITS email ID is not working, please contact support.");
  };  return (
    <div className="min-h-screen bg-app-gradient flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-heading-primary mb-2">
              Signings Portal
            </h1>
            <p className="text-body-large text-muted-foreground">
              Sign in to access events and prof shows
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="border shadow-lg backdrop-blur-sm bg-card/80">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-heading-secondary">
                Welcome Back
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <div className="text-center">
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleLoginSuccess}
                      onError={handleError}
                      auto_select={true}
                      shape="pill"
                      theme="filled_black"
                      text="Continue With Google"
                      size="large"
                      width="300"
                    />
                  </div>
                  
                  <Alert className="border-primary/30 bg-primary/10">
                    <AlertDescription className="text-primary text-body-small">
                      Make sure to use your official BITS Pilani email address for authentication.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <br />
          <br /><br /><br />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-caption flex items-center justify-center gap-2">
          Made with <Heart className="h-4 w-4 text-red-500" /> by DVM, BITS Pilani
        </p>
      </footer>
    </div>
  );
};

export default SignIn;
