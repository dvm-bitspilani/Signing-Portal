import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SignInProvider } from "./assets/store/SignInContext.jsx";

const clientId =
  "984333563728-dlu8i3smh7dm7guu6alg20rgft9g7v0m.apps.googleusercontent.com";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <SignInProvider>
        <App />
      </SignInProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
