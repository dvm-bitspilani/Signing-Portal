import { useState, createContext } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import Footer from "./components/Footer.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";

import SignInContext from "./assets/store/SignInContext.jsx";

import SignIn from "./pages/SignIn/SignIn.jsx";
import Events from "./pages/Events/Events.jsx";
import Merch from "./pages/Merch/Merch.jsx";
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

const Layout = () => {
  const location = useLocation();
  const hideFooter = location.pathname === "/signin";
  const hideBottomNav = location.pathname === "/signin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area with bottom padding on mobile for bottom nav */}
      <main className={`flex-1 ${!hideBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>

      {/* Footer - hidden on sign-in, and on mobile when bottom nav is visible */}
      {!hideFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
};

const App = () => {
  const [globalAppStates, setGlobalAppStates] = useState({ credentials: null });

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Merch />,
          id: "root",
          loader: checkauth,
        },
        {
          path: "/events",
          element: <Events />,
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
      ],
    },
  ]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="signings-portal-theme">
      <AppContext.Provider value={{ globalAppStates, setGlobalAppStates }}>
        <GoogleOAuthProvider clientId="650062736141-pb64o0ubh8ejek13gogejjb9t5r6sdf0.apps.googleusercontent.com/">
          <RouterProvider router={router} />
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              className: "!bg-background !text-foreground !border-border",
            }}
          />
        </GoogleOAuthProvider>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
