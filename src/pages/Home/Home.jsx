import { Link } from 'react-router-dom';
import styles from "./Home.module.scss";
import Navbar from '../ComComponent/Navbar/Navbar';

function Home() {
    //? To be recieved via api upon signin
    const eventList = [
        {
            name: "Tech Innovatiors Summit",
            description: "Explre the latest trends in technology with incudtry leaders and innovators.",
            price: "Rs. 500",
            redirectLink: "./"
        },
        {
            name: "Tech Innovatiors Summit",
            description: "Explre the latest trends in technology with incudtry leaders and innovators.",
            price: "Rs. 500",
            redirectLink: "./"
        }
    ]

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