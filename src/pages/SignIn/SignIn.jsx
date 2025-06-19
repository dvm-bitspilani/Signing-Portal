import { React, useContext } from "react";
import styles from "./SignIn.module.scss";
import Navbar from "../ComComponent/Navbar/Navbar";
import googleLogo from "/googleLogo.svg";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useSignIn } from "../../assets/store/SignInContext";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { setStateItem, apiBaseURL, setStateItems } from "../../global";
import axios from "axios";

const SignIn = () => {
  const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const handleLoginSuccess = (credentialResponse) => {
    //console.log("Login Success: currentUser:", credentialResponse, jwtDecode(credentialResponse.credential));
    axios.post(`${apiBaseURL}/api/auth/`, {
        token: credentialResponse.credential
      }, {
        headers: {
          accept: 'application/json'
        }
    }).then((response) => {
      //* `tokens` is object containing `access` and `refresh` tokens
      setGlobalAppStates(setStateItems(globalAppStates, {
        credentials: jwtDecode(credentialResponse.credential),
        tokens: response.data.tokens
      }))

      localStorage.setItem("isLoggedIn", true);
      signIn();
      navigate("/"); // Redirect to home page after successful login
    })
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
