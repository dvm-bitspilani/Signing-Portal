import React, { useState } from "react";
import SignIn from "./pages/SignIn/SignIn.jsx";
import styles from "./App.module.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import { useContext, createContext } from "react";
import SignInContext from "./assets/store/SignInContext.jsx";

export const AppContext = createContext({});

const App = () => {
  const { isSignIn } = useContext(SignInContext);
  //* Use this for all other uses of contexts
  const [ globalAppStates, setGlobalAppStates ] = useState({});

  return (
    <BrowserRouter>
      <AppContext.Provider value={{globalAppStates, setGlobalAppStates}}>
        <div className={styles.app}>
          <Routes>
            <Route path="/" element={isSignIn ? <Home /> : <SignIn />} />
            //* Add Routes linked to other pages here
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
