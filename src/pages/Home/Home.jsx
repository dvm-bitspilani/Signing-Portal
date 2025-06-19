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

export const eventList = [
  {
    name: "Tech Innovatiors Summit",
    description:
      "Explore the latest trends in technology with industry leaders and innovators.",
    price: "Rs. 500",
    dateAndTime: "Sat, 30 May 2025, 10:00 AM",
    redirectLink: "./EventDetails/0",
  },
  {
    name: "Tech Innovatiors Summit",
    description:
      "Explore the latest trends in technology with industry leaders and innovators.",
    price: "Rs. 500",
    dateAndTime: "Sat, 31 May 2025, 10:00 AM",
    redirectLink: "./EventDetails/1",
  },
];

function Home() {
  const [eventList, setEventList] = useState([]);
  const refreshToken = getRefreshToken();
  const accessToken = useLoaderData();

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
    return;
    axios
      .get(`${apiBaseURL}/api/tickets`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log(response);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.homeContent}>
        <h1 className={styles.pageTitle}>Available Events</h1>
        <p className={styles.pageDesc}>
          Browse our curated list of events and select the ones that spark your
          interest.
        </p>
        <div className={styles.eventListContainer}>
          {eventList.map((event, index) => (
            <div className={styles.eventItem} key={index}>
              <div className={styles.eventLeft}>
                <div className={styles.eventTitle}>{event.name}</div>
                <div className={styles.eventDesc}>{event.description}</div>
              </div>
              <div className={styles.eventRight}>
                <Link className={styles.eventLink} to={event.redirectLink}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
