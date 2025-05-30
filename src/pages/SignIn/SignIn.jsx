import React from "react";
import styles from "./SignIn.module.scss";
import Navbar from "../ComComponent/Navbar/Navbar";
import googleLogo from "/googleLogo.svg";
import { GoogleLogin } from "@react-oauth/google";
import { useSignIn } from "../../assets/store/SignInContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const handleLoginSuccess = (credentialResponse) => {
    console.log("Login Success: currentUser:", credentialResponse);
    localStorage.setItem("isLoggedIn", true);
    signIn();
    navigate("/"); // Redirect to home page after successful login
  };
  return (
    <div className={styles.signInContainer}>
      <Navbar />
      <div className={styles.signInContent}>
        <h1 className={styles.title}>Signing Portal</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          auto_select={true}
          shape="pill"
          theme="filled_black"
          text="Continue With Google"
          size="large"
        />
        {/* <button>
          <div className={styles.googleLogo}>
            <img src={googleLogo} alt="" />
          </div>
          <div>Continue with Google</div>
        </button> */}
      </div>
      <footer>Made with &#x2764;&#xfe0f; by DVM, BITS Pilani</footer>
    </div>
  );
};

export default SignIn;
