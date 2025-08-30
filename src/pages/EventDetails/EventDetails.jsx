import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../ComComponent/Navbar/Navbar";
import { apiBaseURL } from "../../global";
import { getAccessToken } from "../../assets/utils/auth.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee, 
  Plus, 
  Minus,
  Ticket,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function EventDetails() {
  const { eventType, eventIndex } = useParams();
  const accessToken = getAccessToken();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [openSlotIds, setOpenSlotIds] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [activeDateTab, setActiveDateTab] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

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
      .catch(() => {
        setError("Event not found or unauthorized.");
        setLoading(false);
      });
  }, [eventType, eventIndex, accessToken]);

  const handleSlotToggle = (slotId) => {
    setOpenSlotIds((prev) => (prev.includes(slotId) ? [] : [slotId]));
  };

  const handleTicketTypeChange = (slotId, ticketTypeId) => {
    setSelectedTicketType((prev) => ({
      ...prev,
      [slotId]: ticketTypeId,
    }));
    setTicketCounts((prev) => ({
      ...prev,
      [slotId]: 0,
    }));
  };

  const handleTicketCount = (slotId, delta) => {
    setTicketCounts((prev) => {
      const current = prev[slotId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [slotId]: next };
    });
  };

  const handleProfShowBuy = async () => {
    const count = ticketCounts["profshow"] || 0;
    if (count < 1) return;
    
    setPurchaseLoading(true);
    try {
      const formData = new FormData();
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
      navigate("/yoursignings");
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleNonCompBuy = async (slot) => {
    const selectedTypeId = selectedTicketType[slot.slot_id];
    const count = ticketCounts[slot.slot_id] || 0;
    if (!selectedTypeId || count < 1) return;
    
    setPurchaseLoading(true);
    try {
      const formData = new FormData();
      formData.append("tickets", count);
      await axios.post(
        `${apiBaseURL}/api/non-comp-ticket/${selectedTypeId}/buy/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: "application/json",
          },
        }
      );
      navigate("/yoursignings");
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Card className="w-full">
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "The event you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prof Show Layout
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
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.ticket_type_id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{ticket.ticket_type_name}</h4>
                  <div className="flex items-center text-lg font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {ticket.price}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTicketCounts((prev) => ({
                        ...prev,
                        [ticket.ticket_type_id]: Math.max(0, (prev[ticket.ticket_type_id] || 0) - 1),
                      }))
                    }
                    disabled={ticketCounts[ticket.ticket_type_id] === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {ticketCounts[ticket.ticket_type_id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTicketCounts((prev) => ({
                        ...prev,
                        [ticket.ticket_type_id]: (prev[ticket.ticket_type_id] || 0) + 1,
                      }))
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {ticketCounts["profshow"] > 0 && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Amount</p>
                  <div className="flex items-center text-xl font-bold">
                    <IndianRupee className="w-5 h-5" />
                    {(ticketCounts["profshow"] || 0) * event.price}
                  </div>
                </div>
                <Button 
                  onClick={handleProfShowBuy}
                  disabled={ticketCounts["profshow"] === 0 || purchaseLoading}
                  className="min-w-32"
                >
                  {purchaseLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      );
    };

    const renderAbout = () => (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Artist</label>
            <p className="text-base">{event.Artist}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-base leading-relaxed">{event.description}</p>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Start Time
              </label>
              <p className="text-base">{event.start_time}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                End Time
              </label>
              <p className="text-base">{event.end_time}</p>
            </div>
          </div>
        </div>
      </Card>
    );

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-heading-primary">{event.name}</h1>
              <div className="flex items-center text-caption">
                <Calendar className="w-4 h-4 mr-2" />
                {event.start_time}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about" className="flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </TabsTrigger>
                <TabsTrigger value="tickets" className="flex items-center">
                  <Ticket className="w-4 h-4 mr-2" />
                  Tickets
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                {renderAbout()}
              </TabsContent>
              
              <TabsContent value="tickets" className="mt-6">
                {accessToken ? (
                  renderTickets()
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Please sign in to purchase tickets.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Non-Comp Layout
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-heading-primary">{event.non_comp_name}</h1>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Event Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDateTab.toString()} onValueChange={(value) => setActiveDateTab(parseInt(value))}>
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${event.dates.length}, 1fr)` }}>
                  {event.dates.map((dateObj, idx) => (
                    <TabsTrigger key={dateObj.date} value={idx.toString()}>
                      {dateObj.date}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {event.dates.map((dateObj, idx) => (
                  <TabsContent key={dateObj.date} value={idx.toString()} className="mt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Available Slots
                        </h3>
                        
                        {dateObj.slots.length > 0 ? (
                          <div className="space-y-3">
                            {dateObj.slots.map((slot) => (
                              <Card 
                                key={slot.slot_id} 
                                className={`transition-all ${!slot.is_openforsignings ? 'opacity-50' : ''}`}
                              >
                                <CardHeader 
                                  className="cursor-pointer"
                                  onClick={() => slot.is_openforsignings && handleSlotToggle(slot.slot_id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-4">
                                        <Badge variant={slot.is_openforsignings ? "default" : "secondary"}>
                                          {slot.is_openforsignings ? "Open" : "Closed"}
                                        </Badge>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <MapPin className="w-4 h-4 mr-1" />
                                          {slot.venue}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm">
                                        <span>{slot.start_time} - {slot.end_time}</span>
                                      </div>
                                    </div>
                                    {slot.is_openforsignings && (
                                      <Button variant="ghost" size="sm">
                                        {openSlotIds.includes(slot.slot_id) ? (
                                          <ChevronLeft className="w-4 h-4 rotate-90" />
                                        ) : (
                                          <ChevronLeft className="w-4 h-4 -rotate-90" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </CardHeader>
                                
                                {openSlotIds.includes(slot.slot_id) && (
                                  <CardContent>
                                    {slot.is_openforsignings ? (
                                      slot.ticket_types && slot.ticket_types.length > 0 ? (
                                        <div className="space-y-4">
                                          <Select
                                            value={selectedTicketType[slot.slot_id] || ""}
                                            onValueChange={(value) => handleTicketTypeChange(slot.slot_id, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select Ticket Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {slot.ticket_types.map((tt) => (
                                                <SelectItem key={tt.ticket_type_id} value={tt.ticket_type_id}>
                                                  {tt.ticket_type_name} (₹{tt.price})
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          
                                          {selectedTicketType[slot.slot_id] && (
                                            <Card className="p-4">
                                              <div className="flex items-center justify-between mb-4">
                                                <div>
                                                  <h4 className="font-medium">
                                                    {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.ticket_type_name}
                                                  </h4>
                                                  <div className="flex items-center text-lg font-semibold">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price}
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTicketCount(slot.slot_id, -1)}
                                                    disabled={ticketCounts[slot.slot_id] === 0}
                                                  >
                                                    <Minus className="w-4 h-4" />
                                                  </Button>
                                                  <span className="w-8 text-center font-medium">
                                                    {ticketCounts[slot.slot_id] || 0}
                                                  </span>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTicketCount(slot.slot_id, 1)}
                                                  >
                                                    <Plus className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              {ticketCounts[slot.slot_id] > 0 && (
                                                <div className="flex items-center justify-between pt-4 border-t">
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                                    <div className="flex items-center text-lg font-bold">
                                                      <IndianRupee className="w-4 h-4" />
                                                      {(ticketCounts[slot.slot_id] || 0) * (slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0)}
                                                    </div>
                                                  </div>
                                                  <Button 
                                                    onClick={() => handleNonCompBuy(slot)}
                                                    disabled={ticketCounts[slot.slot_id] === 0 || purchaseLoading}
                                                  >
                                                    {purchaseLoading ? (
                                                      <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Processing...
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Ticket className="w-4 h-4 mr-2" />
                                                        Buy Tickets
                                                      </>
                                                    )}
                                                  </Button>
                                                </div>
                                              )}
                                            </Card>
                                          )}
                                        </div>
                                      ) : (
                                        <Alert>
                                          <Info className="h-4 w-4" />
                                          <AlertDescription>
                                            No tickets available for this slot.
                                          </AlertDescription>
                                        </Alert>
                                      )
                                    ) : (
                                      <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                          Signings are not open for this slot.
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              No slots available for this date.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;