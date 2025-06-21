import { React, useEffect, useState } from "react";
import { Link, useRouteLoaderData } from "react-router-dom";
import styles from "./Navbar.module.scss";
import Logo from "/Logo.svg";
import { useContext } from "react";
import SignInContext from "../../../assets/store/SignInContext";
import ProfileOverlay from "./ProfileOverlay";
import { AppContext } from "../../../App";
import { getAccessToken } from "../../../assets/utils/auth";

//* Add path to your pages to both links in desktop view (line 52-53) and mobile view (line 75-76)

const Navbar = () => {
  const mobileBreakpoint = 720;
  const { globalAppStates } = useContext(AppContext);
  const { isSignIn } = useContext(SignInContext);
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    window.innerWidth < mobileBreakpoint
  );
  const token = getAccessToken();

  const handleWindowResize = () =>
    setIsMobileView(window.innerWidth < mobileBreakpoint);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftHalf}>
        <Link to="./" className={styles.logoLink}>
          <div className={styles.logo}>
            <img src={Logo} alt="Logo" />
          </div>
          <div className={styles.title}>Signings Portal</div>
        </Link>
      </div>
      <div className={styles.rightHalf}>
        {token ? (
          <div className={styles.signInStatus}>
            {isMobileView ? (
              <button
                className={styles.menuBtn}
                onClick={() => setIsMenuOpened(true)}
              >
                <div className={styles.menuBar}></div>
                <div className={styles.menuBar}></div>
                <div className={styles.menuBar}></div>
              </button>
            ) : (
              <>
                <Link className={styles.navlink} to="/">
                  Home
                </Link>
                <Link className={styles.navlink} to="/yoursignings">
                  Your Signings
                </Link>
                <Link className={styles.navlink} to=".">
                  Contact
                </Link>
                <button
                  className={styles.profileBtn}
                  onClick={() => setIsMenuOpened(true)}
                >
                  <img
                    className={styles.navProfileImg}
                    src={
                      globalAppStates.credentials?.picture ||
                      "/default-profile.png"
                    }
                  />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.signInStatus}>
            <Link className={styles.navlink} to="">
              Contacts
            </Link>
          </div>
        )}
      </div>
      {token ? (
        <div
          className={
            isMenuOpened ? styles.profileOverlayShow : styles.profileOverlay
          }
        >
          <div
            className={styles.profileOverlayBg}
            style={isMobileView ? { backgroundColor: "#000000" } : null}
            onClick={() => setIsMenuOpened(false)}
          ></div>
          {isMobileView ? (
            <div className={styles.sideMenu}>
              <ProfileOverlay />
              <div className={styles.menuNavlinkContainer}>
                <Link to="/" className={styles.navlink}>
                  Home
                </Link>
                <Link to="/yoursignings" className={styles.navlink}>
                  Your Signings
                </Link>
                <Link to="." className={styles.navlink}>
                  Contact
                </Link>
              </div>
            </div>
          ) : (
            <ProfileOverlay />
          )}
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
