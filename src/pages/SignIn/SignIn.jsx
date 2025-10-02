import { React, useState } from "react";
import Navbar from "../ComComponent/Navbar/Navbar";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { apiBaseURL } from "../../global";
import axios from "axios";
import { showErrorToast, showLoadingToast, dismissToast } from "../../assets/utils/toast.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        
        // Redirect to the original location or home
        const from = location.state?.from || "/";
        navigate(from);
      })
      .catch((error) => {
        setIsLoading(false);
        dismissToast(loadingToastId);
        handleError(error);
      });
  };

  const handleError = () => {
    showErrorToast("Please use your BITS email ID to sign in. If your BITS email ID is not working, please contact support.");
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex flex-col">
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
              <CardDescription className="text-body">
                Use your BITS email to continue
              </CardDescription>
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
          <div className="text-center space-y-4">
            <div className="text-body-small text-muted-foreground">
              <p>Having trouble signing in?</p>
              <button className="text-primary hover:text-primary/80 underline transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
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
