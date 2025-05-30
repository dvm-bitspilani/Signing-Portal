import React from "react";
import { Link } from "react-router-dom";
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
          <div className={styles.signInStatus}>
            <Link className={styles.navlink} to=".">Home</Link>
            <Link className={styles.navlink} to=".">Your Signings</Link>
            <Link className={styles.navlink} to=".">Contact</Link>
            <Link className={styles.logoutBtn} to=".">Logout</Link> {/*? Will change it later to show user profile (name) & logout btn instead */}
          </div>
        ) : (
          <div className={styles.signInStatus}>
            <Link className={styles.navlink} to=''>Contacts</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
