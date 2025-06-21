import React, { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import styles from "./EventDetails.module.scss";
import axios from "axios";
import Navbar from "../ComComponent/Navbar/Navbar";
import { apiBaseURL } from "../../global";
import { getAccessToken } from "../../assets/utils/auth.js";

function EventDetails() {
  const { eventType, eventIndex } = useParams();
  const accessToken = getAccessToken();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [ticketCounts, setTicketCounts] = useState({});

  useEffect(() => {
    let endpoint = "";
    if (eventType === "prof-show") {
      endpoint = `/api/prof-show/${eventIndex}/`;
    } else if (eventType === "non-comp") {
      endpoint = `/api/non-comp/${eventIndex}/`;
    } else {
      setError("Invalid event type.");
      setLoading(false);
      return;
    }

    axios
      .get(`${apiBaseURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })
      .then((response) => {
        setEvent(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("git not found or unauthorized.");
        setLoading(false);
      });
  }, [eventType, eventIndex, accessToken]);

  // ticket counter
  const handleTicketCount = (ticketId, delta) => {
    setTicketCounts((prev) => {
      const next = { ...prev };
      next[ticketId] = Math.max(0, (next[ticketId] || 0) + delta);
      return next;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error || !event) return <div>{error || "Event not found."}</div>;

  const renderTickets = () => {
  // single ticket type for prof-show, multiple for non-comp
    const tickets =
      (eventType === "prof-show")
        ? [
            {
              ticket_type_id: "profshow",
              ticket_type_name: "General Admission",
              price: event.price,
            },
          ]
        : (event.slot_details || [])
            .flatMap(slot => slot.ticket_types || []);

    if (!tickets.length) return <div>No tickets available.</div>;

    return (
      <div className={styles.ticketsContent}>
        {tickets.map((tt) => (
          <div className={styles.ticketItem} key={tt.ticket_type_id}>
            <div className={styles.ticketInfo}>
              <div>{tt.ticket_type_name}</div>
              <div className={styles.ticketPrice}>₹{tt.price}</div>
            </div>
            <div className={styles.ticketCounter}>
              <button onClick={() => handleTicketCount(tt.ticket_type_id, -1)}>
                -
              </button>
              <span className={styles.counterValue}>
                {ticketCounts[tt.ticket_type_id] || 0}
              </span>
              <button onClick={() => handleTicketCount(tt.ticket_type_id, 1)}>
                +
              </button>
            </div>
          </div>
        ))}
        <button className={styles.buyTicketsButton}>Buy Ticket</button>
      </div>
    );
  };

  
  const renderAbout = () => (
    <div className={styles.aboutContent}>
      {eventType === "prof-show" ? (
        <>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>Artist:</div>
            <div className={styles.aboutValue}>{event.Artist}</div>
          </div>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>Description:</div>
            <div className={styles.aboutValue}>{event.description}</div>
          </div>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>Start Time:</div>
            <div className={styles.aboutValue}>{event.start_time}</div>
          </div>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>End Time:</div>
            <div className={styles.aboutValue}>{event.end_time}</div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>Description</div>
            <div className={styles.aboutValue}>{event.description}</div>
          </div>
          <div className={styles.aboutSection}>
            <div className={styles.aboutLabel}>Slots</div>
            <div className={styles.aboutSlots}>
              {event.slot_details && event.slot_details.length > 0 ? (
                event.slot_details.map((slot) => (
                  <div className={styles.slotBox} key={slot.slot_id}>
                    <div>
                      <strong>Venue:</strong> {slot.venue}
                    </div>
                    <div>
                      <strong>Start:</strong> {slot.start_time}
                    </div>
                    <div>
                      <strong>End:</strong> {slot.end_time}
                    </div>
                    <div>
                      <strong>Open for Signings:</strong>{" "}
                      {slot.is_openforsignings ? "Yes" : "No"}
                    </div>
                    
                  </div>
                ))
              ) : (
                <div>No slots available.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Navbar />
      <div className={styles.eventDetailsContent}>
        <div className={styles.eventTitle}>
          {eventType === "prof-show" ? event.name : event.non_comp_name}
        </div>
        <div className={styles.eventDateAndTime}>
          {event.start_time ||
            (event.slot_details && event.slot_details[0]?.start_time) ||
            ""}
        </div>
        <div className={styles.eventDetailsContainer}>
          <div className={styles.tabContainer}>
            <button
              className={activeTab === "about" ? styles.activeTab : ""}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
            <button
              className={activeTab === "tickets" ? styles.activeTab : ""}
              onClick={() => setActiveTab("tickets")}
            >
              Tickets
            </button>
          </div>
          <hr className={styles.separatorLine} />
          <div className={styles.tabContent}>
            {activeTab === "about" && renderAbout()}
            {activeTab === "tickets" && renderTickets()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;  