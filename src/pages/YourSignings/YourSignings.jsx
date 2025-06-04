import styles from "./YourSignings.module.scss";
import { eventData } from "./eventData";
import Navbar from "../ComComponent/Navbar/Navbar";

function YourSignings() {
  return (
    <div>
      <Navbar />
      <div className={styles.tableContainer}>
        <h1 className={styles.pageTitle}>Your Signings</h1>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Price</th>
              <th>Time Slot</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {eventData.map((event, index) => (
              <tr key={index}>
                <td>{event.name}</td>
                <td>${event.price}</td>
                <td>{event.timeSlot}</td>
                <td>
                  <button
                    className={`${styles.status} ${
                      styles[event.status.toLowerCase()]
                    }`}
                  >
                    {event.status}
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.cancel} ${
                      event.status === "Confirmed" ? "" : styles.disabled
                    }`}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YourSignings;
