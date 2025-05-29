import React from "react";
import styles from "./SignIn.module.scss";
import Navbar from "../ComComponent/Navbar/Navbar";
import googleLogo from "/googleLogo.svg"; // Assuming you have a Google logo image in your assets

const SignIn = () => {
  return (
    <div className={styles.signInContainer}>
      <Navbar />
      <div className={styles.signInContent}>
        <h1 className={styles.title}>Signing Portal</h1>
        <button>
          <div className={styles.googleLogo}>
            <img src={googleLogo} alt="" />
          </div>
          <div>Continue with Google</div>
        </button>
      </div>
      <footer>Made with &#x2764;&#xfe0f; by DVM, BITS Pilani</footer>
    </div>
  );
};

export default SignIn;
