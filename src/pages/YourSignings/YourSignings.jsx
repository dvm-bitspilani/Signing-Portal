import styles from "./YourSignings.module.scss";
// import { eventData } from "./eventData";
import Navbar from "../ComComponent/Navbar/Navbar";
import ErrorModal from "../ComComponent/ErrorModal/ErrorModal";

import axios from "axios";
import { apiBaseURL } from "../../global";
import {
  useLoaderData,
  redirect,
  useSubmit,
  useActionData,
  useNavigation,
} from "react-router";
import { useState } from "react";
import { getAccessToken, getRefreshToken } from "../../assets/utils/auth.js";

function YourSignings() {
  const [errorModal, setErrorModal] = useState(true);
  const eventData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <div>
      {actionData && actionData.isError && errorModal && (
        <ErrorModal onClick={() => setErrorModal(false)}>
          <p>{actionData.message}</p>
        </ErrorModal>
      )}
      <Navbar />
      <div className={styles.tableContainer}>
        <h1 className={styles.pageTitle}>Your Signings</h1>
        {eventData?.isError && (
          <div className={styles.errorMessage}>
            <h2>WHOOPS!</h2>
            <p>
              {eventData.message ||
                "An error occurred while fetching signings."}
            </p>
          </div>
        )}
        {!eventData?.isError &&
          (eventData.data.prof_show_tickets ||
            eventData.data.non_comp_tickets) && (
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Price</th>
                  {/* <th>Time Slot</th> */}
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {eventData.data.prof_show_tickets?.map((event, index) => (
                  <tr key={index}>
                    <td>{event.show_name}</td>
                    <td>&#x20B9;{event.price}</td>
                    {/* <td>{event.timeSlot}</td> */}
                    <td>
                      <button
                        className={`${styles.status} ${
                          event.cancelled ? styles.cancelled : styles.confirmed
                        }`}
                      >
                        {event.cancelled ? "Cancelled" : "Confirmed"}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`${styles.cancel} ${
                          event.cancelled || !event.cancellable || isSubmitting
                            ? styles.disabled
                            : ""
                        }`}
                        disabled={
                          event.cancelled || !event.cancellable || isSubmitting
                        }
                        onClick={() => {
                          if (event.cancelled) return;
                          setErrorModal(true);
                          const formData = new FormData();
                          formData.append(
                            "prof_show_ticket_id",
                            event.ticket_id
                          );
                          submit(formData, {
                            method: "post",
                            action: "/yoursignings",
                          });
                        }}
                      >
                        {event.cancellable
                          ? isSubmitting
                            ? "Cancelling"
                            : "Cancel"
                          : "Can't Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
                {eventData.data.non_comp_tickets?.map((event, index) => (
                  <tr key={index}>
                    <td>{event.non_comp_name}</td>
                    <td>&#x20B9;{event.price}</td>
                    {/* <td>{event.timeSlot}</td> */}
                    <td>
                      <button
                        className={`${styles.status} ${
                          event.cancelled ? styles.cancelled : styles.confirmed
                        }`}
                      >
                        {event.cancelled ? "Cancelled" : "Confirmed"}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`${styles.cancel} ${
                          event.cancelled || !event.cancellable || isSubmitting
                            ? styles.disabled
                            : ""
                        }`}
                        disabled={
                          event.cancelled || !event.cancellable || isSubmitting
                        }
                        onClick={() => {
                          if (event.cancelled) return;
                          setErrorModal(true);
                          const formData = new FormData();
                          formData.append(
                            "non_comp_ticket_id",
                            event.ticket_id
                          );
                          submit(formData, {
                            method: "post",
                            action: "/yoursignings",
                          });
                        }}
                      >
                        {event.cancellable
                          ? isSubmitting
                            ? "Cancelling"
                            : "Cancel"
                          : "Can't Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        {!eventData?.isError &&
          !eventData.data.prof_show_tickets &&
          !eventData.data.non_comp_tickets && (
            <div className={styles.errorMessage}>
              <h2>No Signings Found</h2>
              <p>You have not signed up for any events yet.</p>
            </div>
          )}
      </div>
    </div>
  );
}

export default YourSignings;

export async function loader() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (!refreshToken || !accessToken) {
    redirect("/signin");
    return { isError: true, message: "Token is missing" };
  }

  try {
    const response = await axios.get(`${apiBaseURL}/api/tickets`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return {
      isError: false,
      data: response.data,
      message: "Signings fetched successfully",
    };
  } catch (error) {
    return {
      isError: true,
      message:
        error.response?.data || "An error occurred while fetching signings",
    };
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (!refreshToken || !accessToken) {
    redirect("/signin");
    return { isError: true, message: "Token is missing" };
  }

  try {
    if (formData.has("prof_show_ticket_id")) {
      const response = await axios.post(
        `${apiBaseURL}/api/prof-show-cancel/${formData.get(
          "prof_show_ticket_id"
        )}/`,
        {
          access_token: accessToken,
          prof_show_ticket_id: formData.get("prof_show_ticket_id"),
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } else {
      const response = await axios.post(
        `${apiBaseURL}/api/non-comp-cancel/${formData.get(
          "non_comp_ticket_id"
        )}/`,
        {
          access_token: accessToken,
          non_comp_ticket_id: formData.get("non_comp_ticket_id"),
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }
    return {
      isError: false,
      message: "Ticket cancelled successfully",
    };
  } catch (error) {
    return {
      isError: true,
      message:
        error.response?.data || "An error occurred while cancelling the ticket",
    };
  }
}
