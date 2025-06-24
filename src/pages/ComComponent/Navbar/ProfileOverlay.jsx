import { React, use, useContext } from "react";
import styles from "./Navbar.module.scss";
import { AppContext } from "../../../App";
import SignInContext from "../../../assets/store/SignInContext";
import { useRouteLoaderData, useSubmit } from "react-router-dom";
import { getUserDetails } from "../../../assets/utils/auth";

export default function ProfileOverlay({children, className}) {
  const submit = useSubmit();
  // const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  // console.log(globalAppStates);
  
  const token = useRouteLoaderData("root");
  const {username, profilePicURL} = getUserDetails();

  function signOut() {
    // setGlobalAppStates({ credentials: null });
    submit({ token }, { method: "post", action: "/logout" });
    // googleLogout(); // Uncomment if using Google OAuth
  }

  return (
    <div className={`${styles.profileContent} ${className}`}>
      <div className={styles.profilePicWrapper}>
        <img
          className={styles.profileImage}
          src={profilePicURL || "/default-profile.png"}
          alt="Profile"
        />{" "}
      </div>
      <div className={styles.profileContentBottom}>
        <p className={styles.profileGreeting}>Welcome,</p>
        <h2 className={styles.profileUsername}>
          {username || "Guest"}
        </h2>{" "}
      </div>
      {children}
      <div className={styles.logoutWrapper}>
        <button className={styles.logoutBtn} onClick={signOut}>
          Logout
        </button>
      </div>
    </div>
  );
}
