import React from "react";
import { useParams } from "react-router-dom";
import styles from "./EventDetails.module.scss";
import { eventList } from "../Home/Home.jsx";
import Navbar from '../ComComponent/Navbar/Navbar';

function EventDetails() {
  const { eventIndex } = useParams();
  const event = eventList[eventIndex];

  return (
    <div>
      <Navbar />
      <div className={styles.eventDetailsContent}>
        <h1 className={styles.eventTitle}>{event.name}</h1>
        <p className={styles.eventDateAndTime}>{event.dateAndTime}</p>
      </div>
    </div>
    
  );
}

export default EventDetails;
// Note: The eventList is imported from Home.jsx for demonstration purposes.
