import { Link, useNavigate, useLoaderData } from "react-router-dom";
import styles from "./Home.module.scss";
import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { AppContext } from "../../App";
import { useContext, useEffect, useState } from "react";
import { apiBaseURL } from "../../global";
import {
    getRefreshToken,
    UpdateAccessToken,
    logoutAction,
    accessTokenDuration,
    refreshTokenDuration,
    checkAccessToken,
    checkRefreshToken,
} from "../../assets/utils/auth.js";

function Home() {
    const [activeTab, setActiveTab] = useState(0);
    const [eventList, setEventList] = useState(null);
    const [profShowList, setProfShowList] = useState(null);
    const refreshToken = getRefreshToken();
    const accessToken = useLoaderData();
    const eventContGap = 30;
    const [emptyEventsMsg, setEmptyEventsMsg] = useState("Please wait while we load the list of available events.");
    const [emptyProfShowMsg, setEmptyProfShowMsg] = useState("Please wait while we load the list of available prof shows.");

    const navigate = useNavigate();
    useEffect(() => {
        if (!refreshToken || !accessToken) {
            logoutAction();
            navigate("/signin");
            return;
        }

        checkAccessToken();

        if (checkRefreshToken() === "EXPIRED") {
            logoutAction();
            navigate("/signin");
            return;
        }

        const accessTokenTimer = setTimeout(() => {
            UpdateAccessToken();
        }, accessTokenDuration());

        const refreshTokenTimer = setTimeout(() => {
            if (checkRefreshToken() === "EXPIRED") {
                logoutAction();
                navigate("/signin");
            }
        }, refreshTokenDuration());

        return () => {
            clearTimeout(accessTokenTimer);
            clearTimeout(refreshTokenTimer);
        };
    }, [refreshToken, accessToken]);

    useEffect(() => {
        axios.get(`${apiBaseURL}/api/shows`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }}
        ).then((response) => {
            if (response.data.non_comp_events.length == 0) setEmptyEventsMsg("Looks like there are no available events at this moment.")
            else setEventList(response.data.non_comp_events.reverse());

            if (response.data.prof_shows.length == 0) setEmptyProfShowMsg("Looks like there are no available prof shows at this moment")
            else setProfShowList(response.data.prof_shows.reverse());

        }).catch((errResponse) => {
            setEmptyEventsMsg(`Something went wrong in recieveing the available events.`);
            setEmptyProfShowMsg(`Something went wrong in recieving the available prof shows.`);
            console.log(errResponse)
        })

        const eventContElem = document.getElementById("eventCont");
        eventContElem.addEventListener("scrollend", (event) => {
            setActiveTab(Math.round(eventContElem.scrollLeft/(eventContElem.clientWidth + eventContGap)))
        })
    }, [])

    useEffect(() => {
        const eventContElem = document.getElementById("eventCont");
        eventContElem.scrollTo({left: activeTab*(eventContElem.clientWidth + eventContGap), behavior: "smooth"});
    }, [activeTab])

    return (
        <div>
            <Navbar />
            <div className={styles.homeContent}>
                <h1 className={styles.pageTitle}>Available Events</h1>
                <p className={styles.pageDesc}>Browse our curated list of events and select the ones that spark your interest.</p>
                <div className={styles.tabContainer}>
                    <button onClick={() => setActiveTab(0)} className={`${styles.tab} ${activeTab == 0 ? styles.active : ''}`}>Prof Shows</button>
                    <button onClick={() => setActiveTab(1)} className={`${styles.tab} ${activeTab == 1 ? styles.active : ''}`}>Events</button>
                </div>
                <div id="eventCont" className={styles.eventContainer}>
                    <div className={styles.eventListContainer}>
                        {profShowList?.map((show, index) => (
                            <div className={styles.eventItem} key={index}>
                                <div className={styles.eventLeft}>
                                    <div className={styles.eventTitle}>{show.name}</div>
                                    <div className={styles.eventDesc}>{show.description}</div>
                                </div>
                                <div className={styles.eventRight}>
                                    <Link className={styles.eventLink} to={`/EventDetails/prof-show/${show.id}`}>
                                    View Details
                                    </Link>
                                </div>
                            </div>
                        )) ||
                        <div className={styles.emptyContentMessage}>{emptyProfShowMsg}</div>}
                    </div>
                    <div className={styles.eventListContainer}>
                        {eventList?.map((event, index) => (
                            <div className={styles.eventItem} key={index}>
                                <div className={styles.eventLeft}>
                                    <div className={styles.eventTitle}>{event.name}</div>
                                    <div className={styles.eventDesc}>{event.description}</div>
                                </div>
                                <div className={styles.eventRight}>
                                    <Link className={styles.eventLink} to={`/EventDetails/non-comp/${event.id}`}>
                                    View Details
                                    </Link>
                                </div>
                            </div>
                        )) ||
                        <div className={styles.emptyContentMessage}>{emptyEventsMsg}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
