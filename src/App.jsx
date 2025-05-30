import React from "react";
import SignIn from "./pages/SignIn/SignIn.jsx";
import styles from "./App.module.scss";
import { SignInProvider } from "./assets/store/SignInContext.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <SignInProvider>
        <div className={styles.app}>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route index element={<Home />} />
            //? Add Routes linked to other pages here

          </Routes>
        </div>
      </SignInProvider>
    </BrowserRouter>
  );
};

export default App;
