import React from "react";
import SignIn from "./pages/SignIn/SignIn.jsx";
import styles from "./App.module.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import { useContext } from "react";
import SignInContext from "./assets/store/SignInContext.jsx";

const App = () => {
  const { isSignIn } = useContext(SignInContext);
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={isSignIn ? <Home /> : <SignIn />} />
          //? Add Routes linked to other pages here
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
