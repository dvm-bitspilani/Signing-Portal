import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../ComComponent/Navbar/Navbar";
import { apiBaseURL, merchBaseURL } from "../../global";
import { getAccessToken } from "../../assets/utils/auth.js";
import { handleApiErrorToast, showSuccessToast, showLoadingToast, dismissToast, showErrorToast } from "../../assets/utils/toast.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  const [merch, setMerch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSlotIds, setOpenSlotIds] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [activeDateTab, setActiveDateTab] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [merchQuantity, setMerchQuantity] = useState(1);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  const [customizationText, setCustomizationText] = useState("");

  useEffect(() => {
    if (eventType === "non-comp") {
      const endpoint = `/api/non-comp/${eventIndex}/`;

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
          console.error("Failed to load event details:", err);
          console.log("Event details error response:", err.response);
          console.log("Event details error data:", err.response?.data);
          setError("Event not found or unauthorized.");
          setLoading(false);
          handleApiErrorToast(err, "Failed to load event details. Please try again.");
        });
    } else if (eventType === "merch") {
      axios
        .get(`${merchBaseURL}/merch/${eventIndex}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: "application/json",
          },
        })
        .then((response) => {
          setMerch(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load merch details:", err);
          console.log("Merch details error response:", err.response);
          console.log("Merch details error data:", err.response?.data);
          setError("Merch not found or unauthorized.");
          setLoading(false);
          handleApiErrorToast(err, "Failed to load merch details. Please try again.");
        });
    } else {
      setError("Invalid event type.");
      setLoading(false);
    }
  }, [eventType, eventIndex, accessToken]);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // fallback to original if invalid
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
      [slotId]: 1,
    }));
  };

  const handleTicketCount = (slotId, delta) => {
    setTicketCounts((prev) => {
      const current = prev[slotId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [slotId]: next };
    });
  };

  const handleNonCompBuy = async (slot) => {
    const selectedTypeId = selectedTicketType[slot.slot_id];
    const count = ticketCounts[slot.slot_id] || 1;
    if (!selectedTypeId || count < 1) return;
    
    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Processing your ticket purchase...");
    
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
      dismissToast(loadingToastId);
      showSuccessToast("Tickets purchased successfully! Redirecting to your signings...");
      setTimeout(() => navigate("/yoursignings"), 1500);
    } catch (err) {
      console.error("Purchase failed:", err);
      console.log("Purchase error response:", err.response);
      console.log("Purchase error data:", err.response?.data);
      dismissToast(loadingToastId);
      handleApiErrorToast(err, "Failed to purchase tickets. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleMerchBuy = async () => {
    if (merch.sizes && merch.sizes.length > 0 && !selectedSize) {
      showErrorToast("Please select a size");
      return;
    }
    if (merchQuantity < 1 || merchQuantity > 25) {
      showErrorToast("Quantity must be between 1 and 25");
      return;
    }
    if (customizationEnabled && merch.is_customisable && !customizationText.trim()) {
      showErrorToast(`Please enter ${merch.customisation_type || "customization text"}`);
      return;
    }
    
    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Processing your merch purchase...");
    
    try {
      const purchaseData = [{
        id: merch.sizes && merch.sizes.length > 0 ? selectedSize : merch.id,
        quantity: merchQuantity,
        ...(merch.is_customisable && {
          is_customised: customizationEnabled && customizationText.trim() ? true : false,
          customisation_text: customizationEnabled && customizationText.trim() ? customizationText.trim() : ""
        })
      }];
      
      await axios.post(
        `${merchBaseURL}/buy_merch`,
        purchaseData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      dismissToast(loadingToastId);
      showSuccessToast("Merch purchased successfully! Redirecting to your signings...");
      setTimeout(() => navigate("/yoursignings"), 1500);
    } catch (err) {
      console.error("Merch purchase failed:", err);
      console.log("Merch purchase error response:", err.response);
      console.log("Merch purchase error data:", err.response?.data);
      dismissToast(loadingToastId);
      handleApiErrorToast(err, "Failed to purchase merch. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4 sm:mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-4 sm:h-6 w-32 sm:w-48" />
            <Card className="w-full">
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-48 sm:h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!event && !merch)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4 sm:mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4 sm:p-6 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-destructive mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Event Not Found</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {error || "The event you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Merch Layout
  if (eventType === "merch" && merch) {
    const images = merch.extra_images_url 
      ? [merch.front_image_url, ...merch.extra_images_url] 
      : [merch.front_image_url];

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4 sm:mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{merch.name}</h1>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                  Merch
                </Badge>
              </div>
            </div>

            <Card className="w-full">
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Image Carousel */}
                <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={images[currentImageIndex]} 
                        alt={merch.name}
                        className="w-full h-full object-contain"
                      />
                      {images.length > 1 && (
                        <div className="group">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                          >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  idx === currentImageIndex 
                                    ? 'bg-white w-4' 
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <div className="text-white text-sm bg-black/60 px-3 py-1 rounded-full">
                          Click to zoom
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
                    <div className="relative w-full h-full flex items-center justify-center bg-black/95">
                      <img 
                        src={images[currentImageIndex]} 
                        alt={merch.name}
                        className="max-w-full max-h-full object-contain"
                      />
                      {images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  idx === currentImageIndex 
                                    ? 'bg-white w-4' 
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <div className="flex items-center text-2xl font-bold">
                      {merch.price === 0 ? (
                        <span>-</span>
                      ) : (
                        <>
                          <IndianRupee className="w-5 h-5" />
                          {merch.price}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sizes Selection */}
                {merch.sizes && merch.sizes.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold">Select Size</h3>
                      <Select
                        value={selectedSize || ""}
                        onValueChange={(value) => setSelectedSize(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {merch.sizes.map((size) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.name === "A" ? "Universal" : size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Customization Section */}
                {merch.is_customisable && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-base sm:text-lg font-semibold">Customization</h3>
                          <p className="text-sm text-muted-foreground">
                            Add custom {merch.customisation_type || "text"} (+₹{merch.customisation_price || 0})
                          </p>
                        </div>
                        <Switch
                          checked={customizationEnabled}
                          onCheckedChange={setCustomizationEnabled}
                        />
                      </div>
                      {customizationEnabled && (
                        <div className="space-y-2">
                          <label htmlFor="customization" className="text-sm font-medium">
                            {merch.customisation_type || "Customization Text"}
                          </label>
                          <Input
                            id="customization"
                            type="text"
                            placeholder={`Enter your ${merch.customisation_type || "text"}...`}
                            value={customizationText}
                            onChange={(e) => setCustomizationText(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Quantity Selection */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">Quantity</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMerchQuantity(Math.max(1, merchQuantity - 1))}
                      disabled={merchQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-16 text-center text-xl font-medium">
                      {merchQuantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMerchQuantity(Math.min(25, merchQuantity + 1))}
                      disabled={merchQuantity >= 25}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Min: 1, Max: 25</p>
                </div>

                <Separator />

                {/* Total and Buy Button */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <div className="flex items-center text-xl sm:text-2xl font-bold">
                        {merch.price === 0 ? (
                          <span>-</span>
                        ) : (
                          <>
                            <IndianRupee className="w-5 h-5" />
                            {(merch.price + (customizationEnabled && merch.is_customisable ? (merch.customisation_price || 0) : 0)) * merchQuantity}
                          </>
                        )}
                      </div>
                      {customizationEnabled && merch.is_customisable && merch.customisation_price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Includes ₹{merch.customisation_price} customization fee per item
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleMerchBuy}
                      disabled={purchaseLoading || (merch.sizes && merch.sizes.length > 0 && !selectedSize)}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      {purchaseLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Buy Merch
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Non-Comp Layout
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{event.non_comp_name}</h1>
          </div>

          <Card className="w-full">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Event Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDateTab.toString()} onValueChange={(value) => setActiveDateTab(parseInt(value))}>
                <div className="overflow-x-auto mb-4 sm:mb-6">
                  <TabsList className="grid w-full min-w-max" style={{ gridTemplateColumns: `repeat(${event.dates.length}, minmax(120px, 1fr))` }}>
                    {event.dates.map((dateObj, idx) => (
                      <TabsTrigger key={dateObj.date} value={idx.toString()} className="text-xs sm:text-sm whitespace-nowrap">
                        {dateObj.date}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {event.dates.map((dateObj, idx) => (
                  <TabsContent key={dateObj.date} value={idx.toString()} className="mt-4 sm:mt-6">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-semibold">Description</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{event.description}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                                  className="cursor-pointer pb-3 sm:pb-4"
                                  onClick={() => slot.is_openforsignings && handleSlotToggle(slot.slot_id)}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <div className="space-y-2">
                                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                        <Badge variant={slot.is_openforsignings ? "default" : "secondary"} className="w-fit">
                                          {slot.is_openforsignings ? "Open" : "Closed"}
                                        </Badge>
                                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                          {slot.venue}
                                        </div>
                                      </div>
                                      <div className="flex items-center text-xs sm:text-sm">
                                        <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                                      </div>
                                    </div>
                                    {slot.is_openforsignings && (
                                      <Button variant="ghost" size="sm" className="self-start sm:self-center">
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
                                  <CardContent className="pt-0">
                                    {slot.is_openforsignings ? (
                                      slot.ticket_types && slot.ticket_types.length > 0 ? (
                                        <div className="space-y-4">
                                          <Select
                                            value={selectedTicketType[slot.slot_id] || ""}
                                            onValueChange={(value) => handleTicketTypeChange(slot.slot_id, value)}
                                          >
                                            <SelectTrigger className="w-full">
                                              <SelectValue placeholder="Select Ticket Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {slot.ticket_types.map((tt) => (
                                                <SelectItem key={tt.ticket_type_id} value={tt.ticket_type_id}>
                                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                                                    <span>{tt.ticket_type_name}</span>
                                                    <span className="text-sm font-medium text-muted-foreground sm:ml-2">(₹{tt.price})</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          
                                          {selectedTicketType[slot.slot_id] && (
                                            <Card className="p-3 sm:p-4">
                                              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="space-y-1">
                                                  <h4 className="text-sm sm:text-base font-medium">
                                                    {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.ticket_type_name}
                                                  </h4>
                                                  <div className="flex items-center text-lg font-semibold">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price}
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-center space-x-3">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTicketCount(slot.slot_id, -1)}
                                                    disabled={(ticketCounts[slot.slot_id] || 1) <= 1}
                                                  >
                                                    <Minus className="w-4 h-4" />
                                                  </Button>
                                                  <span className="w-8 text-center font-medium">
                                                    {ticketCounts[slot.slot_id] || 1}
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
                                              
                                              {(ticketCounts[slot.slot_id] || 1) > 0 && (
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t space-y-3 sm:space-y-0">
                                                  <div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                                                    <div className="flex items-center text-lg sm:text-xl font-bold">
                                                      <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                                                      {(ticketCounts[slot.slot_id] || 1) * (slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0)}
                                                    </div>
                                                  </div>
                                                  <Button 
                                                    onClick={() => handleNonCompBuy(slot)}
                                                    disabled={(ticketCounts[slot.slot_id] || 1) === 0 || purchaseLoading}
                                                    className="w-full sm:w-auto"
                                                    size="sm"
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