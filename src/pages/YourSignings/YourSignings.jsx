import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { apiBaseURL } from "../../global";
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
import { Ticket, Calendar, IndianRupee, AlertCircle, CheckCircle, XCircle } from "lucide-react";

function YourSignings() {
  const [currentEvent, setcurrentEvent] = useState("A-1");
  const [currentMerch, setCurrentMerch] = useState("merch-1");
  const eventData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
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

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-subheading flex items-center gap-2 group-hover:text-primary transition-colors">
                <Ticket className="h-5 w-5 text-primary" />
                {ticket.non_comp_name}
              </CardTitle>
              <CardDescription className="text-body-small">
                Non-Competitive Event
              </CardDescription>
            </div>
            {getStatusBadge(ticket.cancelled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              <span className="font-medium">₹{ticket.price}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Ticket ID: {ticket.ticket_id}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="text-caption">
              {canCancel ? "Cancellation available" : ticket.cancelled ? "Ticket cancelled" : "Cannot be cancelled"}
            </div>
            <Button
              variant={canCancel ? "destructive" : "secondary"}
              size="sm"
              disabled={!canCancel || isSubmitting}
              onClick={() => canCancel && handleCancelTicket(ticket.ticket_id, index)}
              className="min-w-[100px] transition-all duration-300 hover:scale-105"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Cancelling
                </div>
              ) : canCancel ? (
                "Cancel"
              ) : (
                "Can't Cancel"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MerchCard = ({ merch, index }) => {
    const isProcessing = isSubmitting && currentMerch === `merch-${index}`;
    const canCancel = merch.cancellable && !merch.cancelled;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-subheading flex items-center gap-2 group-hover:text-primary transition-colors">
                <Ticket className="h-5 w-5 text-purple-600" />
                {merch.merch_name}
              </CardTitle>
              <CardDescription className="text-body-small">
                Merchandise {merch.size_name ? `• Size: ${merch.size_name}` : ''}
              </CardDescription>
            </div>
            {getStatusBadge(merch.cancelled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              <span className="font-medium">₹{merch.price}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Qty: {merch.quantity}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="text-caption">
              {canCancel ? "Cancellation available" : merch.cancelled ? "Merch cancelled" : "Cannot be cancelled"}
            </div>
            <Button
              variant={canCancel ? "destructive" : "secondary"}
              size="sm"
              disabled={!canCancel || isSubmitting}
              onClick={() => canCancel && handleCancelMerch(merch.id, index)}
              className="min-w-[100px] transition-all duration-300 hover:scale-105"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Cancelling
                </div>
              ) : canCancel ? (
                "Cancel"
              ) : (
                "Can't Cancel"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Ticket className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-heading-tertiary mb-2">No Signings Found</h3>
      <p className="text-body text-muted-foreground max-w-md mb-6">
        You haven't signed up for any events yet. Browse available events to get started.
      </p>
      <Button asChild className="transition-all duration-300 hover:scale-105">
        <a href="/">Browse Events</a>
      </Button>
    </div>
  );

  const ErrorState = ({ message }) => (
    <Alert className="border-red-600/30 bg-red-600/10 max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-300">
        <div className="space-y-2">
          <p className="font-semibold">WHOOPS!</p>
          <p>{message || "An error occurred while fetching signings."}</p>
        </div>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-heading-primary mb-4 flex items-center justify-center gap-3">
              <Ticket className="h-10 w-10 text-primary" />
              Your Signings
            </h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Manage your event registrations
            </p>
          </div>

          {/* Content */}
          {eventData?.isError ? (
            <ErrorState message={eventData.message} />
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              {actionData && !actionData.isError && (
                <Alert className="border-green-600/30 bg-green-600/10 max-w-2xl mx-auto">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    {actionData.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Events */}
              {eventData.data.non_comp_tickets && eventData.data.non_comp_tickets.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-heading-secondary">Your Event Tickets</h2>
                    <Badge variant="outline">
                      {eventData.data.non_comp_tickets.length} ticket{eventData.data.non_comp_tickets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {eventData.data.non_comp_tickets.map((ticket, index) => (
                      <TicketCard 
                        key={index} 
                        ticket={ticket} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Merch */}
              {eventData.data.merch_tickets && eventData.data.merch_tickets.length > 0 && (
                <div className="space-y-6 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-heading-secondary">Your Merch</h2>
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
                      {eventData.data.merch_tickets.length} item{eventData.data.merch_tickets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {eventData.data.merch_tickets.map((merch, index) => (
                      <MerchCard 
                        key={index} 
                        merch={merch} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State - show only if both are empty */}
              {(!eventData.data.non_comp_tickets || eventData.data.non_comp_tickets.length === 0) && 
               (!eventData.data.merch_tickets || eventData.data.merch_tickets.length === 0) && (
                <EmptyState />
              )}
            </div>
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
      axios.get(`${apiBaseURL}/tickets-manager/user_merch`, {
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
