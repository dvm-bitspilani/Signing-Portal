import React from "react";
import SignIn from "./pages/SignIn/SignIn.jsx";
import styles from "./App.module.scss";
import { SignInProvider } from "./assets/store/SignInContext.jsx";

const App = () => {
  return (
    <SignInProvider>
      <div className={styles.app}>
        <SignIn></SignIn>
      </div>
    </SignInProvider>
  );
};

export default App;
