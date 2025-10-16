import { useState, createContext } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import Footer from "./components/Footer.jsx";

import SignInContext from "./assets/store/SignInContext.jsx";

import SignIn from "./pages/SignIn/SignIn.jsx";
import Home from "./pages/Home/Home.jsx";
import EventDetails from "./pages/EventDetails/EventDetails.jsx";
import YourSignings from "./pages/YourSignings/YourSignings.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { loginAction } from "./pages/SignIn/SignIn.jsx";
import { logoutAction, checkauth, checkLogin } from "./assets/utils/auth.js";
import {
  loader as yoursigningsloader,
  action as yoursigningsaction,
} from "./pages/YourSignings/YourSignings.jsx";

export const AppContext = createContext({});

const App = () => {
  const [globalAppStates, setGlobalAppStates] = useState({ credentials: null });

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      id: "root",
      loader: checkauth,
    },
    {
      path: "/signin",
      element: <SignIn />,
      loader: checkLogin,
      // action: loginAction,
    },
    {
      path: "/yoursignings",
      element: <YourSignings />,
      loader: yoursigningsloader,
      action: yoursigningsaction,
    },
    {
      path: "/contact",
      element: <Contact />,
      loader: checkauth,
    },
    {
      path: "/EventDetails/:eventType/:eventIndex",
      element: <EventDetails />,
      loader: checkauth,
    },
    {
      path: "/logout",
      action: logoutAction,
    },
  ]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="signings-portal-theme">
      <AppContext.Provider value={{ globalAppStates, setGlobalAppStates }}>
        <GoogleOAuthProvider clientId="993693860464-5p8rfdqpp8svqhdhviaian2i0kkpqt78.apps.googleusercontent.com">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <RouterProvider router={router} />
            </div>
            <Footer />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </div>
        </GoogleOAuthProvider>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
