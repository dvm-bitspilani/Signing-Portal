import { useState, useContext, createContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import styles from "./App.module.scss";

import SignInContext from "./assets/store/SignInContext.jsx";

import SignIn from "./pages/SignIn/SignIn.jsx";
import Home from "./pages/Home/Home.jsx";
import EventDetails from "./pages/EventDetails/EventDetails.jsx";
import YourSignings from "./pages/YourSignings/YourSignings.jsx";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const AppContext = createContext({});

const App = () => {
  const { isSignIn } = useContext(SignInContext);
  const [globalAppStates, setGlobalAppStates] = useState({});
  
  return (
    <BrowserRouter>
      <AppContext.Provider value={{ globalAppStates, setGlobalAppStates }}>
        <GoogleOAuthProvider clientId="993693860464-5p8rfdqpp8svqhdhviaian2i0kkpqt78.apps.googleusercontent.com">
          <div className={styles.app}>
            <Routes>
              <Route path="/" element={isSignIn ? <Home /> : <SignIn />} />
              <Route path="/yoursignings" element={isSignIn ? <YourSignings /> : <SignIn />} />
              <Route path="/EventDetails/:eventIndex" element={<EventDetails />} />
            </Routes>
          </div>
        </GoogleOAuthProvider>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;