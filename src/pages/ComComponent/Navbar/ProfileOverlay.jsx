import { React, useContext } from 'react'
import styles from "./Navbar.module.scss";
import { AppContext } from '../../../App';
import SignInContext from '../../../assets/store/SignInContext';

export default function ProfileOverlay() {
    
    const { globalAppStates, setGlobalAppStates } = useContext(AppContext);  
    const { signOut } = useContext(SignInContext);

    return (
        <div className={styles.profileContent}>
            <div className={styles.profilePicWrapper}>
                <img className={styles.profileImage} src={globalAppStates.credentials.picture}></img>
            </div>
            <hr className={styles.profileContentDivider} />
            <div className={styles.profileContentBottom}>
                <p className={styles.profileGreeting}>Welcome,</p>
                <h2 className={styles.profileUsername}>{globalAppStates.credentials.name}</h2>
            </div>
            <div className={styles.logoutWrapper}>
                <button className={styles.logoutBtn} onClick={signOut}>Logout</button>
            </div>
        </div>
    )
}
