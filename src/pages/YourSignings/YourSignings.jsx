import Navbar from "../ComComponent/Navbar/Navbar";
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
} from "react-router";
import { useState, useEffect } from "react";
import { getAccessToken, getRefreshToken } from "../../assets/utils/auth.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Calendar, IndianRupee, AlertCircle, CheckCircle, XCircle, MapPin, ShoppingBag, Package, Sparkles } from "lucide-react";

function YourSignings() {
  const [currentEvent, setcurrentEvent] = useState("A-1");
  const [currentMerch, setCurrentMerch] = useState("merch-1");
  const eventData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Count active items
  const activeEventsCount = eventData?.data?.non_comp_tickets?.filter(t => !t.cancelled).length || 0;
  const activeMerchCount = eventData?.data?.merch_tickets?.filter(m => !m.cancelled).length || 0;
  const totalActiveCount = activeEventsCount + activeMerchCount;

  // Show toast notifications for action results
  useEffect(() => {
    if (actionData?.isError) {
      showErrorToast(actionData.message);
    } else if (actionData && !actionData.isError) {
      showSuccessToast(actionData.message);
    }
  }, [actionData]);

  const getStatusBadge = (cancelled) => {
    if (cancelled) {
      return (
        <Badge variant="cancelled" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="flex items-center gap-1 animate-pulse-glow">
        <CheckCircle className="h-3 w-3" />
        Confirmed
      </Badge>
    );
  };

  const handleCancelTicket = (ticketId, index) => {
    setcurrentEvent(`non_comp-${index}`);
    const formData = new FormData();
    formData.append(`non_comp_ticket_id`, ticketId);
    submit(formData, {
      method: "post",
      action: "/yoursignings",
    });
  };

  const handleCancelMerch = (merchTicketId, index) => {
    setCurrentMerch(`merch-${index}`);
    const formData = new FormData();
    formData.append(`merch_ticket_id`, merchTicketId);
    submit(formData, {
      method: "post",
      action: "/yoursignings",
    });
  };

  const TicketCard = ({ ticket, index }) => {
    const isProcessing = isSubmitting && currentEvent === `non_comp-${index}`;
    const canCancel = ticket.cancellable && !ticket.cancelled;

    // Format timestamp
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    // Format time slot
    const formatTimeSlot = (timeSlot) => {
      if (!timeSlot) return '';
      const date = new Date(timeSlot);
      return date.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <Card className={`group card-interactive border animate-fade-in-up ${ticket.cancelled ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2 group-hover:text-primary transition-colors truncate">
                <div className="shrink-0 p-1.5 rounded-lg bg-primary/10">
                  <Ticket className="h-4 w-4 text-primary" />
                </div>
                <span className="truncate">{ticket.non_comp_name}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Event Registration
              </CardDescription>
            </div>
            {getStatusBadge(ticket.cancelled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Event Details Grid */}
          <div className="grid gap-2 text-sm">
            {ticket.time_slot && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatTimeSlot(ticket.time_slot)}</span>
              </div>
            )}
            {ticket.venue && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{ticket.venue}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Price and ID */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              {ticket.price > 0 ? (
                <>
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="font-semibold">{ticket.price}</span>
                </>
              ) : (
                <Badge variant="success" size="sm">Free</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              #{ticket.ticket_id}
            </span>
          </div>

          {/* Timestamp */}
          {ticket.timestamp && (
            <p className="text-xs text-muted-foreground">
              Booked {formatTimestamp(ticket.timestamp)}
            </p>
          )}
          
          {/* Cancel Button */}
          {canCancel && (
            <>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => handleCancelTicket(ticket.ticket_id, index)}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </div>
                ) : (
                  "Cancel Ticket"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const MerchCard = ({ merch, index }) => {
    const isProcessing = isSubmitting && currentMerch === `merch-${index}`;
    const canCancel = merch.cancellable && !merch.cancelled;
    const displaySize = merch.size === "A" ? "Universal" : merch.size;

    // Format timestamp
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <Card className={`group card-interactive border animate-fade-in-up ${merch.cancelled ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2 group-hover:text-primary transition-colors truncate">
                <div className="shrink-0 p-1.5 rounded-lg bg-warning/10">
                  <ShoppingBag className="h-4 w-4 text-warning" />
                </div>
                <span className="truncate">{merch.merch_name}</span>
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-2">
                <span>Merchandise</span>
                {displaySize && (
                  <>
                    <span>•</span>
                    <span>Size: {displaySize}</span>
                  </>
                )}
                {merch.quantity && (
                  <>
                    <span>•</span>
                    <span>Qty: {merch.quantity}</span>
                  </>
                )}
              </CardDescription>
            </div>
            {getStatusBadge(merch.cancelled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Merch Image */}
          {merch.merch_image_url && (
            <div className="relative w-full aspect-4/3 bg-muted rounded-lg overflow-hidden">
              <img 
                src={merch.merch_image_url} 
                alt={merch.merch_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}

          <Separator />

          {/* Price */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              {merch.price > 0 ? (
                <>
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="font-semibold">{merch.price}</span>
                </>
              ) : (
                <Badge variant="success" size="sm">Free</Badge>
              )}
            </div>
            {merch.quantity && merch.quantity > 1 && (
              <span className="text-muted-foreground text-xs">
                ×{merch.quantity} items
              </span>
            )}
          </div>

          {/* Timestamp */}
          {merch.timestamp && (
            <p className="text-xs text-muted-foreground">
              Ordered {formatTimestamp(merch.timestamp)}
            </p>
          )}
          
          {/* Cancel Button */}
          {canCancel && (
            <>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => handleCancelMerch(merch.id, index)}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </div>
                ) : (
                  "Cancel Order"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type = "all" }) => {
    const config = {
      all: {
        icon: <Package className="h-8 w-8 text-muted-foreground" />,
        title: "No Bookings Yet",
        description: "You haven't made any bookings. Browse events and merchandise to get started.",
        ctaText: "Explore Merch",
        ctaLink: "/",
      },
      events: {
        icon: <Ticket className="h-8 w-8 text-muted-foreground" />,
        title: "No Event Tickets",
        description: "You haven't registered for any events yet.",
        ctaText: "Browse Events",
        ctaLink: "/events",
      },
      merch: {
        icon: <ShoppingBag className="h-8 w-8 text-muted-foreground" />,
        title: "No Merchandise Orders",
        description: "You haven't ordered any merchandise yet.",
        ctaText: "Shop Merch",
        ctaLink: "/",
      },
    };

    const { icon, title, description, ctaText, ctaLink } = config[type];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="rounded-2xl bg-muted/50 p-4 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {description}
        </p>
        <Button asChild size="sm">
          <a href={ctaLink}>{ctaText}</a>
        </Button>
      </div>
    );
  };

  const ErrorState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="rounded-2xl bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {message || "An error occurred while fetching your bookings."}
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Prepare data
  const eventTickets = eventData?.data?.non_comp_tickets || [];
  const merchTickets = eventData?.data?.merch_tickets || [];
  const hasEvents = eventTickets.length > 0;
  const hasMerch = merchTickets.length > 0;

  return (
    <div className="min-h-screen bg-app-gradient">
      <Navbar />
      
      <div className="pt-20 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Your Bookings
              </h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Manage your event registrations and merchandise orders
            </p>
          </div>

          {/* Stats Summary */}
          {!eventData?.isError && totalActiveCount > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Card className="border-0 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeEventsCount}</p>
                    <p className="text-xs text-muted-foreground">Active Events</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-warning/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <ShoppingBag className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeMerchCount}</p>
                    <p className="text-xs text-muted-foreground">Merch Orders</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content */}
          {eventData?.isError ? (
            <ErrorState message={eventData.message} />
          ) : !hasEvents && !hasMerch ? (
            <EmptyState type="all" />
          ) : (
            <Tabs defaultValue={hasEvents ? "events" : "merch"} className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Events
                  {hasEvents && (
                    <Badge variant="secondary" size="sm" className="ml-1">
                      {eventTickets.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="merch" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Merchandise
                  {hasMerch && (
                    <Badge variant="secondary" size="sm" className="ml-1">
                      {merchTickets.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="mt-0">
                {hasEvents ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {eventTickets.map((ticket, index) => (
                      <TicketCard key={ticket.ticket_id || index} ticket={ticket} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="events" />
                )}
              </TabsContent>

              <TabsContent value="merch" className="mt-0">
                {hasMerch ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...merchTickets]
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((merch, index) => (
                        <MerchCard key={merch.id || index} merch={merch} index={index} />
                      ))}
                  </div>
                ) : (
                  <EmptyState type="merch" />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
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
      axios.get(`${merchBaseURL}/user_merch`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => ({ data: [] })) // Handle if merch endpoint fails
    ]);
    
    return {
      isError: false,
      data: {
        ...ticketsResponse.data,
        merch_tickets: merchResponse.data
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
        message: "Ticket cancelled successfully",
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
        message: "Merch cancelled successfully",
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
