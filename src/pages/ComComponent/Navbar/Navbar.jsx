import React from "react";
import styles from "./Navbar.module.scss";
import Logo from "/Logo.svg";
import { useContext } from "react";
import SignInContext from "../../../assets/store/SignInContext";

const Navbar = () => {
  const { isSignIn } = useContext(SignInContext);

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftHalf}>
        <div className={styles.logo}>
          <img src={Logo} alt="Logo" />
        </div>
        <div className={styles.title}>Signings Portal</div>
      </div>
      <div className={styles.rightHalf}>
        {isSignIn ? (
          <div className={styles.signInStatus}></div>
        ) : (
          <div className={styles.signInStatus}>
            <a href="">Contacts</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
