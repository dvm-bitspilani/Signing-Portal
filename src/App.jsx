import { useState, useContext, createContext, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import styles from "./App.module.scss";

import SignInContext from "./assets/store/SignInContext.jsx";

import SignIn from "./pages/SignIn/SignIn.jsx";
import Home from "./pages/Home/Home.jsx";
import EventDetails from "./pages/EventDetails/EventDetails.jsx";
import YourSignings from "./pages/YourSignings/YourSignings.jsx";
import { jwtDecode } from "jwt-decode";
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
    <AppContext.Provider value={{ globalAppStates, setGlobalAppStates }}>
      <GoogleOAuthProvider clientId="993693860464-5p8rfdqpp8svqhdhviaian2i0kkpqt78.apps.googleusercontent.com">
        <div className={styles.app}>
          <RouterProvider router={router} />
        </div>
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export default App;
