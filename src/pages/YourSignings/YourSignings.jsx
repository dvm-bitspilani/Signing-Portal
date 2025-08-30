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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Ticket, Calendar, IndianRupee, AlertCircle, CheckCircle, XCircle } from "lucide-react";

function YourSignings() {
  const [errorModal, setErrorModal] = useState(true);
  const [currentEvent, setcurrentEvent] = useState("A-1");
  const eventData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

  const handleCancelTicket = (ticketId, ticketType, index) => {
    setErrorModal(true);
    setcurrentEvent(`${ticketType}-${index}`);
    const formData = new FormData();
    formData.append(`${ticketType}_ticket_id`, ticketId);
    submit(formData, {
      method: "post",
      action: "/yoursignings",
    });
  };

  const TicketCard = ({ ticket, index, type }) => {
    const isProcessing = isSubmitting && currentEvent === `${type}-${index}`;
    const canCancel = ticket.cancellable && !ticket.cancelled;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-subheading flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                {type === 'prof_show' ? ticket.show_name : ticket.non_comp_name}
              </CardTitle>
              <CardDescription className="text-body-small">
                {type === 'prof_show' ? 'Professional Show' : 'Non-Competitive Event'}
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
              onClick={() => canCancel && handleCancelTicket(ticket.ticket_id, type, index)}
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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-6">
        <Ticket className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-heading-secondary mb-2">No Signings Found</h3>
      <p className="text-body text-muted-foreground max-w-md mb-6">
        You haven't signed up for any events yet. Browse available events and prof shows to get started.
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
    <div className="min-h-screen bg-background">
      {actionData && actionData.isError && errorModal && (
        <ErrorModal onClick={() => setErrorModal(false)}>
          <p>{actionData.message}</p>
        </ErrorModal>
      )}
      
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-heading-primary mb-4 flex items-center justify-center gap-3">
              <Ticket className="h-10 w-10 text-primary" />
              Your Signings
            </h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Manage your event registrations and prof show bookings
            </p>
          </div>

          {/* Content */}
          {eventData?.isError ? (
            <ErrorState message={eventData.message} />
          ) : (
            <div className="space-y-8">
              {/* Success Message */}
              {actionData && !actionData.isError && (
                <Alert className="border-green-600/30 bg-green-600/10 max-w-2xl mx-auto">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    {actionData.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Professional Shows */}
              {eventData.data.prof_show_tickets && eventData.data.prof_show_tickets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-heading-secondary">Professional Shows</h2>
                    <Badge variant="outline">
                      {eventData.data.prof_show_tickets.length} ticket{eventData.data.prof_show_tickets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {eventData.data.prof_show_tickets.map((ticket, index) => (
                      <TicketCard 
                        key={index} 
                        ticket={ticket} 
                        index={index} 
                        type="prof_show" 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Non-Competitive Events */}
              {eventData.data.non_comp_tickets && eventData.data.non_comp_tickets.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-heading-secondary">Events</h2>
                    <Badge variant="outline">
                      {eventData.data.non_comp_tickets.length} ticket{eventData.data.non_comp_tickets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {eventData.data.non_comp_tickets.map((ticket, index) => (
                      <TicketCard 
                        key={index} 
                        ticket={ticket} 
                        index={index} 
                        type="non_comp" 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!eventData.data.prof_show_tickets || eventData.data.prof_show_tickets.length === 0) &&
               (!eventData.data.non_comp_tickets || eventData.data.non_comp_tickets.length === 0) && (
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
      await axios.post(
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
      await axios.post(
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
