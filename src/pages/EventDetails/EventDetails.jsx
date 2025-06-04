import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./EventDetails.module.scss";
import { eventList } from "../Home/Home.jsx";
import Navbar from '../ComComponent/Navbar/Navbar';

function EventDetails() {
  const { eventIndex } = useParams();
  const event = eventList[eventIndex];
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div>
      <Navbar />
      <div className={styles.eventDetailsContent}>
        <h1 className={styles.eventTitle}>{event.name}</h1>
        <p className={styles.eventDateAndTime}>{event.dateAndTime}</p>
        <div className={styles.eventDetailsContainer}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === "about" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "tickets" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("tickets")}
            >
              Tickets
            </button>
            
          </div>

          <hr className={styles.separatorLine} />

          <div className={styles.tabContent}>
            {activeTab === "about" && (
              <div className={styles.aboutContent}>
                <p>{event.description}</p>
                <p><strong>Price:</strong> {event.price}</p> {/* Add additional info */}
              </div>
            )}
            {activeTab === "tickets" && (
              <div className={styles.ticketsContent}>
                <h3>Tickets</h3>
                <div className={styles.ticketContainer}>
                  <div className={styles.ticketItem}>
                    <div className={styles.ticketInfo}>
                      <p className={styles.ticketType}>General Admission</p>
                      <p className={styles.ticketPrice}>{event.price}</p>
                    </div>
                    <div className={styles.ticketCounter}>
                      <button className={styles.counterButton}>-</button>
                      <span className={styles.counterValue}>0</span> {/* Replace with dynamic value */}
                      <button className={styles.counterButton}>+</button>
                    </div>
                  </div>
                  {/* Add more ticket types as needed */}
                </div>
                <button className = {styles.buyTicketsButton}>Buy Ticket</button>
                   {/* Replace with dynamic data */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default EventDetails;
// Note: The eventList is imported from Home.jsx for demonstration purposes.
