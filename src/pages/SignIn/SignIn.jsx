import { React, useState } from "react";
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
import { compileString } from "sass";
import ErrorModal from "../ComComponent/ErrorModal/ErrorModal.jsx";

const SignIn = () => {
  // const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);

    //console.log("Login Success: currentUser:", credentialResponse, jwtDecode(credentialResponse.credential));
    axios
      .post(
        `${apiBaseURL}/api/auth/`,
        {
          token: credentialResponse.credential,
        },
        {
          headers: {
            accept: "application/json",
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        //* `tokens` is object containing `access` and `refresh` tokens
        // setGlobalAppStates(
        //   setStateItems(globalAppStates, {
        //     credentials: jwtDecode(credentialResponse.credential),
        //     tokens: response.data.tokens,
        //   })
        // );

        localStorage.setItem(
          "username",
          jwtDecode(credentialResponse.credential).name
        );
        localStorage.setItem(
          "profilePicURL",
          jwtDecode(credentialResponse.credential).picture
        );

        localStorage.setItem("accessToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);
        const accessTokenExpiry = new Date();
        accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1);
        localStorage.setItem(
          "accessTokenExpiry",
          accessTokenExpiry.toISOString()
        );
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
        localStorage.setItem(
          "refreshTokenExpiry",
          refreshTokenExpiry.toISOString()
        );
        navigate("/"); // Redirect to home page after successful login
      })
      .catch((error) => {
        setIsLoading(false);
        handleError(error);
      });
  };

  const handleError = (error) => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.signInContainer}>
      {isLoading && (
        <ErrorModal isLoading={isLoading} onClick={handleCloseModal}>
          Signing In...
        </ErrorModal>
      )}
      {isModalOpen && (
        <ErrorModal onClick={handleCloseModal}>
          Please Use BITS Email ID to Sign In. If your BITS email ID is not
          Working, Please us the Contacts page to voice your Problems.
        </ErrorModal>
      )}
      <Navbar />
      <div className={styles.signInContent}>
        <h1 className={styles.title}>Signing Portal</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleError}
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
