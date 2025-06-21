import { React, use, useContext } from "react";
import styles from "./Navbar.module.scss";
import { AppContext } from "../../../App";
import SignInContext from "../../../assets/store/SignInContext";
import { useRouteLoaderData, useSubmit } from "react-router-dom";

export default function ProfileOverlay() {
  const submit = useSubmit();
  const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  // console.log(globalAppStates);
  const token = useRouteLoaderData("root");

  function signOut() {
    setGlobalAppStates({ credentials: null });
    submit({ token }, { method: "post", action: "/logout" });
    // googleLogout(); // Uncomment if using Google OAuth
  }

  return (
    <div className={styles.profileContent}>
      <div className={styles.profilePicWrapper}>
        <img
          className={styles.profileImage}
          src={globalAppStates.credentials?.picture || "/default-profile.png"}
          alt="Profile"
        />{" "}
      </div>
      <hr className={styles.profileContentDivider} />
      <div className={styles.profileContentBottom}>
        <p className={styles.profileGreeting}>Welcome,</p>
        <h2 className={styles.profileUsername}>
          {globalAppStates.credentials?.name || "Guest"}
        </h2>{" "}
      </div>
      <div className={styles.logoutWrapper}>
        <button className={styles.logoutBtn} onClick={signOut}>
          Logout
        </button>
      </div>
    </div>
  );
}
