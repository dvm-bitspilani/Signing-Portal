import axios from "axios";
import { apiBaseURL, merchBaseURL } from "../../global";
import { extractErrorMessage } from "../../assets/utils/errorHandling.js";
import { showErrorToast, showSuccessToast } from "../../assets/utils/toast.js";
import {
  useLoaderData,
  redirect,
  useSubmit,
  useActionData,
  useNavigation,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccessToken, getRefreshToken } from "../../assets/utils/auth.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import { Page, PageHeader, EmptyState, ErrorState, Price } from "@/components/Page";
import { cn } from "@/lib/utils";

const stamp = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

/**
 * A booking is physically a ticket stub, so the card is die-cut: the tear
 * separates what the event is from the counterfoil a volunteer reads at the
 * gate — the price you paid and the serial they ask you for.
 */
function Stub({
  kind,
  kindColor,
  title,
  lines = [],
  thumb,
  price,
  serial,
  cancelled,
  onCancel,
  cancelling,
  cancelLabel = "Cancel ticket",
}) {
  return (
    <article className={cn("stub flex flex-col", cancelled && "opacity-60")}>
      <div className="flex gap-3 p-4">
        {thumb && (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="size-14 shrink-0 rounded-md border border-border object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span
              className="label-mono"
              style={{ color: cancelled ? "var(--muted-foreground)" : kindColor }}
            >
              {kind}
            </span>
            <Badge variant={cancelled ? "cancelled" : "success"} size="sm">
              {cancelled ? "Void" : "Confirmed"}
            </Badge>
          </div>

          <h3
            className={cn(
              "mt-1.5 text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em]",
              cancelled && "line-through decoration-1",
            )}
          >
            {title}
          </h3>

          {lines.length > 0 && (
            <ul className="mt-2 space-y-1">
              {lines.map((line) => (
                <li
                  key={line}
                  className="numeral truncate text-xs text-muted-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="stub-tear mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-4">
        <Price amount={price} size="sm" />
        {serial != null && (
          <span className="numeral truncate text-xs tracking-wider text-muted-foreground">
            #{serial}
          </span>
        )}
      </div>

      {onCancel && !cancelled && (
        <div className="px-4 pb-4">
          <Button
            variant="quiet"
            size="sm"
            className="w-full"
            loading={cancelling}
            onClick={onCancel}
          >
            {cancelling ? "Cancelling" : cancelLabel}
          </Button>
        </div>
      )}
    </article>
  );
}

const StubGrid = ({ children }) => (
  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
    {children}
  </div>
);

function YourSignings() {
  const [pending, setPending] = useState(null);
  const eventData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (!actionData) return;
    if (actionData.isError) showErrorToast(actionData.message);
    else showSuccessToast(actionData.message);
  }, [actionData]);

  useEffect(() => {
    if (navigation.state === "idle") setPending(null);
  }, [navigation.state]);

  const cancel = (key, field, id) => {
    setPending(key);
    const formData = new FormData();
    formData.append(field, id);
    submit(formData, { method: "post", action: "/yoursignings" });
  };

  const eventTickets = eventData?.data?.non_comp_tickets || [];
  const profShowTickets = eventData?.data?.prof_show_tickets || [];
  const merchTickets = eventData?.data?.merch_tickets || [];

  const all = [...eventTickets, ...profShowTickets, ...merchTickets];
  const confirmed = all.filter((t) => !t.cancelled).length;
  const voided = all.length - confirmed;

  const meta = eventData?.isError
    ? "Unavailable"
    : all.length === 0
      ? "Nothing booked yet"
      : [
          `${confirmed} confirmed`,
          voided > 0 && `${voided} void`,
        ]
          .filter(Boolean)
          .join(" · ");

  const isPending = (key) => isSubmitting && pending === key;

  return (
    <Page>
      <PageHeader title="Your signings" meta={meta} />

      {eventData?.isError ? (
        <ErrorState title="Couldn't load your signings" body={eventData.message} />
      ) : all.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Nothing booked yet"
          body="Anything you sign up for shows up here with the ID you'll be asked for at the gate."
          action={
            <Button asChild size="sm">
              <Link to="/events">Browse events</Link>
            </Button>
          }
        />
      ) : (
        <Tabs
          defaultValue={
            eventTickets.length
              ? "events"
              : profShowTickets.length
                ? "prof_shows"
                : "merch"
          }
        >
          <TabsList>
            <TabsTrigger value="events">
              Events
              <span className="numeral text-xs opacity-60">
                {eventTickets.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="prof_shows">
              Prof shows
              <span className="numeral text-xs opacity-60">
                {profShowTickets.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="merch">
              Merch
              <span className="numeral text-xs opacity-60">
                {merchTickets.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {eventTickets.length ? (
              <StubGrid>
                {eventTickets.map((ticket, index) => {
                  const key = `non_comp-${index}`;
                  return (
                    <Stub
                      key={ticket.ticket_id || index}
                      kind="Event"
                      kindColor="var(--flame)"
                      title={ticket.non_comp_name}
                      lines={[stamp(ticket.time_slot), ticket.venue].filter(Boolean)}
                      price={ticket.price}
                      serial={ticket.ticket_id}
                      cancelled={ticket.cancelled}
                      cancelling={isPending(key)}
                      onCancel={
                        ticket.cancellable && !ticket.cancelled
                          ? () =>
                              cancel(key, "non_comp_ticket_id", ticket.ticket_id)
                          : null
                      }
                    />
                  );
                })}
              </StubGrid>
            ) : (
              <EmptyState
                title="No event tickets"
                body="Non-competitive events you sign up for land here."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/events">Browse events</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="prof_shows">
            {profShowTickets.length ? (
              <StubGrid>
                {profShowTickets.map((ticket, index) => {
                  const key = `prof_show-${index}`;
                  return (
                    <Stub
                      key={ticket.ticket_id || index}
                      kind="Prof show"
                      kindColor="var(--sky)"
                      title={ticket.show_name}
                      lines={[stamp(ticket.timestamp) && `Booked ${stamp(ticket.timestamp)}`].filter(Boolean)}
                      price={ticket.price}
                      serial={ticket.ticket_id}
                      cancelled={ticket.cancelled}
                      cancelling={isPending(key)}
                      onCancel={
                        ticket.cancellable && !ticket.cancelled
                          ? () =>
                              cancel(key, "prof_show_ticket_id", ticket.ticket_id)
                          : null
                      }
                    />
                  );
                })}
              </StubGrid>
            ) : (
              <EmptyState
                title="No prof show tickets"
                body="Headline show tickets land here."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/events">Browse prof shows</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="merch">
            {merchTickets.length ? (
              <StubGrid>
                {[...merchTickets]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((merch, index) => {
                    const key = `merch-${index}`;
                    const size = merch.size === "A" ? "One size" : merch.size;
                    return (
                      <Stub
                        key={merch.id || index}
                        kind="Merch"
                        kindColor="var(--brass)"
                        title={merch.merch_name}
                        thumb={merch.merch_image_url}
                        lines={[
                          [size && `Size ${size}`, merch.quantity && `Qty ${merch.quantity}`]
                            .filter(Boolean)
                            .join("  ·  "),
                          merch.timestamp && `Ordered ${stamp(merch.timestamp)}`,
                        ].filter(Boolean)}
                        price={merch.price}
                        serial={merch.id}
                        cancelled={merch.cancelled}
                        cancelling={isPending(key)}
                        cancelLabel="Cancel order"
                        onCancel={
                          merch.cancellable && !merch.cancelled
                            ? () => cancel(key, "merch_ticket_id", merch.id)
                            : null
                        }
                      />
                    );
                  })}
              </StubGrid>
            ) : (
              <EmptyState
                title="No merch orders"
                body="Anything you order from the merch store lands here."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/merch">Shop merch</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </Page>
  );
}

export default YourSignings;

export async function loader({ request }) {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (!refreshToken || !accessToken) {
    const url = new URL(request.url);
    const from = url.pathname + url.search + url.hash;
    return redirect(`/signin?redirectTo=${encodeURIComponent(from)}`);
  }

  try {
    const [ticketsResponse, merchResponse] = await Promise.all([
      axios.get(`${apiBaseURL}/api/tickets`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      axios
        .get(`${merchBaseURL}/user_merch`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .catch(() => ({ data: [] })), // Handle if merch endpoint fails
    ]);

    return {
      isError: false,
      data: {
        ...ticketsResponse.data,
        merch_tickets: merchResponse.data,
      },
      message: "Signings fetched successfully",
    };
  } catch (error) {
    return {
      isError: true,
      message: extractErrorMessage(error, "An error occurred while fetching signings"),
    };
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (!refreshToken || !accessToken) {
    const url = new URL(request.url);
    const from = url.pathname + url.search + url.hash;
    return redirect(`/signin?redirectTo=${encodeURIComponent(from)}`);
  }

  try {
    const nonCompTicketId = formData.get("non_comp_ticket_id");
    const profShowTicketId = formData.get("prof_show_ticket_id");
    const merchTicketId = formData.get("merch_ticket_id");

    if (nonCompTicketId) {
      await axios.post(
        `${apiBaseURL}/api/non-comp-cancel/${nonCompTicketId}/`,
        {
          access_token: accessToken,
          non_comp_ticket_id: nonCompTicketId,
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return {
        isError: false,
        message: "Ticket cancelled",
      };
    } else if (profShowTicketId) {
      await axios.post(
        `${apiBaseURL}/api/prof-show-cancel/${profShowTicketId}/`,
        {},
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return {
        isError: false,
        message: "Ticket cancelled",
      };
    } else if (merchTicketId) {
      await axios.post(
        `${apiBaseURL}/tickets-manager/cancel_merch/${merchTicketId}`,
        {},
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return {
        isError: false,
        message: "Order cancelled",
      };
    }

    return {
      isError: true,
      message: "Invalid cancellation request",
    };
  } catch (error) {
    return {
      isError: true,
      message: extractErrorMessage(error, "An error occurred while processing the cancellation"),
    };
  }
}
