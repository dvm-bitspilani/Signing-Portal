import { useState, useContext, createContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import styles from "./App.module.scss";

import SignInContext from "./assets/store/SignInContext.jsx";

import SignIn from "./pages/SignIn/SignIn.jsx";
import Home from "./pages/Home/Home.jsx";
import EventDetails from "./pages/EventDetails/EventDetails.jsx";
import YourSignings from "./pages/YourSignings/YourSignings.jsx";

export const AppContext = createContext({});

const App = () => {
  const { isSignIn } = useContext(SignInContext);
  const [globalAppStates, setGlobalAppStates] = useState({});

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ globalAppStates, setGlobalAppStates }}>
        <div className={styles.app}>
          <Routes>
            <Route path="/" element={isSignIn ? <Home /> : <SignIn />} />
            <Route path="/yoursignings" element={isSignIn ? <YourSignings /> : <SignIn />} />
            <Route path="/EventDetails/:eventIndex" element={<EventDetails />} />
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;