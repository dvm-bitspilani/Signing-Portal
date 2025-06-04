import React from 'react';
import { Link } from 'react-router-dom';
import styles from "./Home.module.scss";
import Navbar from '../ComComponent/Navbar/Navbar';

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
    //? To be recieved via api upon signin
    

    return (
        <div>
            <Navbar />
            <div className={styles.homeContent}>
                <h1 className={styles.pageTitle}>Available Events</h1>
                <p className={styles.pageDesc}>Browse our curated list of events and select the ones that spark your interest.</p>
                <div className={styles.eventListContainer}>
                    {
                        eventList.map((event, index) =>
                            <div className={styles.eventItem} key={index}>
                                <div className={styles.eventLeft}>
                                    <div className={styles.eventTitle}>{event.name}</div>
                                    <div className={styles.eventDesc}>{event.description}</div>
                                </div>
                                <div className={styles.eventRight}>
                                    <Link className={styles.eventLink} to={event.redirectLink}>View Details</Link>
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