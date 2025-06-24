import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventDetails.module.scss";
import axios from "axios";
import Navbar from "../ComComponent/Navbar/Navbar";
import { apiBaseURL } from "../../global";
import { getAccessToken } from "../../assets/utils/auth.js";

function EventDetails() {
  const { eventType, eventIndex } = useParams();
  const accessToken = getAccessToken();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [ticketCounts, setTicketCounts] = useState({});
  const [openSlotIds, setOpenSlotIds] = useState([]); 

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
        setError("Event not found or unauthorized.");
        setLoading(false);
      });
  }, [eventType, eventIndex, accessToken]);

  const handleTicketCount = (ticketId, delta) => {
    setTicketCounts((prev) => {
      const next = { ...prev };
      next[ticketId] = Math.max(0, (next[ticketId] || 0) + delta);
      return next;
    });
  };

  const handleSlotToggle = (slotId) => {
  setOpenSlotIds(prev => {
    if (prev.includes(slotId)) {
      return prev.filter(id => id !== slotId);
    } else {
      return [...prev, slotId];
    }
  });
};

  const handleBuyTickets = async () => {
    if (!event || !event.slot_details) return;
    let anySelected = false;
    for (const slot of event.slot_details) {
      if (!slot.is_openforsignings) continue;
      for (const tt of slot.ticket_types || []) {
        const count = ticketCounts[tt.ticket_type_id] || 0;
        if (count > 0) {
          anySelected = true;
          try {
            const formData = new FormData(); // backend expects FormData content type
            formData.append("tickets", count);

            await axios.post(
              `${apiBaseURL}/api/non-comp-ticket/${tt.ticket_type_id}/buy/`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  accept: "application/json",
                },
              }
            );
          } catch (err) {
            alert(
              `Failed for ${tt.ticket_type_name}: ` +
                (err.response?.data?.error || "Purchase failed.")
            );
            return;
          }
        }
      }
    }
    if (!anySelected) return alert("Select at least one ticket.");
    alert("Tickets purchased successfully!");
    navigate("/yoursignings");
  };

  if (loading) return <div>Loading...</div>;
  if (error || !event) return <div>{error || "Event not found."}</div>;

  // prof-show layout
  if (eventType === "prof-show") {
    const renderTickets = () => {
      const tickets = [
        {
          ticket_type_id: "profshow",
          ticket_type_name: "General Admission",
          price: event.price,
        },
      ];
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
          <button
            className={styles.buyTicketsButton}
            onClick={async () => {
              const count = ticketCounts["profshow"] || 0;
              if (count < 1) return alert("Select at least one ticket.");
              try {
                const formData = new FormData(); // backend expects FormData content type
                formData.append("ticket", count);

                await axios.post(
                  `${apiBaseURL}/api/prof-show/${eventIndex}/buy/`,
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      accept: "application/json",
                    },
                  }
                );
                alert("Tickets purchased successfully!");
                navigate("/yoursignings");
              } catch (err) {
                alert(err.response?.data?.error || "Purchase failed.");
              }
            }}
          >
            Buy Ticket
          </button>
        </div>
      );
    };

    const renderAbout = () => (
      <div className={styles.aboutContent}>
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
      </div>
    );

    // for prof shows
    return (
      <div style={{ position: "relative" }}>
        <Navbar />
        <div className={styles.eventDetailsContent}>
          <div className={styles.eventTitle}>{event.name}</div>
          <div className={styles.eventDateAndTime}>{event.start_time || ""}</div>
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

  // for non-comp events
  return (
    <div style={{ position: "relative" }}>
      <Navbar />
      <div className={styles.eventDetailsContent}>
        <div className={styles.eventTitle}>{event.non_comp_name}</div>
        <div className={styles.eventDateAndTime}>
          {event.slot_details && event.slot_details[0]?.start_time}
        </div>
        <div className={styles.eventDetailsContainer}>
          <div className={styles.tabContent} style={{ paddingTop: 0 }}>
            <div className={styles.aboutContent}>
              <div className={styles.aboutSection}>
                <div className={styles.aboutLabel}>Description</div>
                <div className={styles.aboutValue}>{event.description}</div>
              </div>
              <div className={styles.aboutSection}>
                <div className={styles.aboutLabel}>Slots</div>
                <div className={styles.aboutSlots}>
                  {event.slot_details && event.slot_details.length > 0 ? (
                    event.slot_details.map((slot) => (
                      <div key={slot.slot_id} className={styles.slotBoxWrapper}>
                        <button
                          className={styles.slotBox}
                          style={{
                            opacity: slot.is_openforsignings ? 1 : 0.5,
                            cursor: slot.is_openforsignings
                              ? "pointer"
                              : "not-allowed",
                            width: "100%",
                            textAlign: "left",
                            background: "#23272f",
                            border: "none",
                            borderRadius: "10px",
                            padding: "1rem",
                            marginBottom: "0.5rem",
                          }}
                          onClick={() => handleSlotToggle(slot.slot_id)}
                        >
                          <div>
                            <strong>Venue:</strong> {slot.venue}
                          </div>
                          <div>
                            <strong>Start:</strong> {slot.start_time}
                          </div>
                          <div>
                            <strong>End:</strong> {slot.end_time}
                          </div>
                        </button>
                        {openSlotIds.includes(slot.slot_id) && (
                          <div className={styles.ticketsContent}>
                            {slot.is_openforsignings ? (
                              slot.ticket_types && slot.ticket_types.length > 0 ? (
                                slot.ticket_types.map((tt) => (
                                  <div
                                    className={styles.ticketItem}
                                    key={tt.ticket_type_id}
                                  >
                                    <div className={styles.ticketInfo}>
                                      <div>{tt.ticket_type_name}</div>
                                      <div className={styles.ticketPrice}>
                                        ₹{tt.price}
                                      </div>
                                    </div>
                                    <div className={styles.ticketCounter}>
                                      <button
                                        onClick={() =>
                                          handleTicketCount(
                                            tt.ticket_type_id,
                                            -1
                                          )
                                        }
                                      >
                                        -
                                      </button>
                                      <span className={styles.counterValue}>
                                        {ticketCounts[tt.ticket_type_id] || 0}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleTicketCount(
                                            tt.ticket_type_id,
                                            1
                                          )
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div>No tickets available.</div>
                              )
                            ) : (
                              <div style={{ color: "#888", padding: "1rem 0" }}>
                                Signings not open for this slot.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div>No slots available.</div>
                  )}
                </div>
              </div>
              <button
                className={styles.buyTicketsButton}
                style={{ marginTop: "2rem", alignSelf: "flex-end" }}
                onClick={handleBuyTickets}
              >
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;