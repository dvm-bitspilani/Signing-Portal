import { React, useContext } from "react";
import styles from "./SignIn.module.scss";
import Navbar from "../ComComponent/Navbar/Navbar";
import googleLogo from "/googleLogo.svg";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useSignIn } from "../../assets/store/SignInContext";
import { redirect, useNavigate, useSubmit } from "react-router-dom";
import { AppContext } from "../../App";
import { setStateItem, apiBaseURL, setStateItems } from "../../global";
import axios from "axios";

const SignIn = () => {
  const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  const { signIn } = useSignIn();
  const submit = useSubmit();
  const handleLoginSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse);

    setGlobalAppStates({
      credentials: jwtDecode(credentialResponse.credential),
    });

    submit(
      { c: credentialResponse.credential },
      { method: "post", action: "/signin" }
    );
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
      </div>
      <footer>Made with &#x2764;&#xfe0f; by DVM, BITS Pilani</footer>
    </div>
  );
};

export default SignIn;

// export async function loginAction({ request }) {
//   const formData = await request.formData();
//   console.log("Form Data:", formData);
//   const credentialResponse = formData.get("c");
//   console.log("Credential Response:", credentialResponse);

//   axios
//     .post(
//       `${apiBaseURL}/api/auth/`,
//       {
//         token: credentialResponse,
//       },
//       {
//         headers: {
//           accept: "application/json",
//         },
//       }
//     )
//     .then((response) => {
//       console.log("Login successful:", response.data);
//       localStorage.setItem("accessToken", response.data.tokens.access);
//       localStorage.setItem("refreshToken", response.data.tokens.refresh);
//       const accessTokenExpiry = new Date();
//       accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1);
//       localStorage.setItem(
//         "accessTokenExpiry",
//         accessTokenExpiry.toISOString()
//       );
//       const refreshTokenExpiry = new Date();
//       refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
//       localStorage.setItem(
//         "refreshTokenExpiry",
//         refreshTokenExpiry.toISOString()
//       );
//       return redirect("/");
//     })
//     .catch((error) => {
//       return redirect("/signin");
//     });
//   return redirect("/");
// }
