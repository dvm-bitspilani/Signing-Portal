import axios from "axios";
import { apiBaseURL } from "../../global";
import { redirect } from "react-router";

export function getAccessToken() {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken;
}

export function getRefreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  return refreshToken;
}

export function UpdateAccessToken() {
    const refreshToken = getRefreshToken();
    console.log(refreshToken);
  if (!refreshToken) {
    console.error("No refresh token found");
    return null;
    }
    axios
    .post(
      `${apiBaseURL}/api/refresh/`,
      { refresh: refreshToken, headers: { accept: "application/json" } }
    )
        .then((response) => {
        console.log("Response from UpdateAccessToken:", response.data);
        if (response.data.access) {
          console.log(response.data)
        localStorage.setItem("accessToken", response.data.access);
        return response.data.access;
      } else {
        console.error("Failed to update access token");
        return null;
      }
    })
    .catch((error) => {
        console.error("Error updating access token:", error.response?.data || error.message);
      });
      
}

export function accessTokenDuration() {
    const accessTokenExpiry = localStorage.getItem("accessTokenExpiry");
    const expiryDate = new Date(accessTokenExpiry);
    const currentDate = new Date();
    return (expiryDate.getTime() - currentDate.getTime());
}

export function checkAccessToken() {
    const accessToken = getAccessToken();
    const duration = accessTokenDuration();
    if (!accessToken || duration <= 0) {
        UpdateAccessToken();
        return getAccessToken();
    }
    return accessToken;
}

export function refreshTokenDuration() {
    const refreshTokenExpiry = localStorage.getItem("refreshTokenExpiry");
    const expiryDate = new Date(refreshTokenExpiry);
    const currentDate = new Date();
    return (expiryDate.getTime() - currentDate.getTime());
}

export function checkRefreshToken() {
    const refreshToken = getRefreshToken();
    const duration = refreshTokenDuration();
    if (!refreshToken || duration <= 0) 
    {
        return "EXPIRED";
    }
    
    return refreshToken;
}

export function logoutAction() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiry");
    localStorage.removeItem("refreshTokenExpiry");
    return redirect("/signin");
}

export function checkauth() {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();
    if (!refreshToken) {
        return redirect("/signin");
    }
    return accessToken;
}