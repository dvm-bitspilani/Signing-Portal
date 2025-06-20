import { Link } from 'react-router-dom';
import styles from "./Home.module.scss";
import Navbar from '../ComComponent/Navbar/Navbar';
import axios from 'axios';
import { AppContext } from '../../App';
import { useContext, useEffect, useState } from 'react';
import { apiBaseURL } from '../../global';

export const eventList = [
    {
        name: "Tech Innovatiors Summit",
        description: "Explore the latest trends in technology with industry leaders and innovators.",
        price: "Rs. 500",
        dateAndTime: "Sat, 30 May 2025, 10:00 AM", 
        redirectLink: "./EventDetails/0"
    },
    {
        name: "Tech Innovatiors Summit",
        description: "Explore the latest trends in technology with industry leaders and innovators.",
        price: "Rs. 500",
        dateAndTime: "Sat, 31 May 2025, 10:00 AM", 
        redirectLink: "./EventDetails/1"
    }
]

function Home() {

    const {globalAppStates, setGlobalAppStates} = useContext(AppContext);
    const accessToken = globalAppStates.tokens.access;
    const [eventList, setEventList] = useState([]);
    const [profShowList, setProfShowList] = useState([]);

    useEffect(() => {
        axios.get(`${apiBaseURL}/api/shows`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }}
        ).then((response) => {
            // console.log(response, response.data.prof_shows.concat(response.data.non_comp_events));
            setEventList(response.data.non_comp_events);
            setProfShowList(response.data.prof_shows);
        })
    }, [])

    return (
        <div>
            <Navbar />
            <div className={styles.homeContent}>
                <h1 className={styles.pageTitle}>Available Events</h1>
                <p className={styles.pageDesc}>Browse our curated list of events and select the ones that spark your interest.</p>
                <div className={styles.eventListContainer}>
                    {
                        profShowList.map((show, index) =>
                            <div className={styles.eventItem} key={index}>
                                <div className={styles.eventLeft}>
                                    <div className={styles.eventTitle}>{show.name}</div>
                                    <div className={styles.eventDesc}>{show.description}</div>
                                </div>
                                <div className={styles.eventRight}>
                                    <Link className={styles.eventLink} to={`/EventDetails/prof-show/${show.id}`}>View Details</Link>
                                </div>
                            </div>
                        )
                    }
                    {
                        eventList.map((event, index) =>
                            <div className={styles.eventItem} key={index}>
                                <div className={styles.eventLeft}>
                                    <div className={styles.eventTitle}>{event.name}</div>
                                    <div className={styles.eventDesc}>{event.description}</div>
                                </div>
                                <div className={styles.eventRight}>
                                    <Link className={styles.eventLink} to={`/EventDetails/non-comp/${event.id}`}>View Details</Link>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Home