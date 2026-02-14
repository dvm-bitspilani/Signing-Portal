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
  ChevronRight,
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
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ZoomIn
} from "lucide-react";

function EventDetails() {
  const { eventType, eventIndex } = useParams();
  const accessToken = getAccessToken();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [profShow, setProfShow] = useState(null);
  const [merch, setMerch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSlotIds, setOpenSlotIds] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [profShowTicketCount, setProfShowTicketCount] = useState(1);
  const [activeDateTab, setActiveDateTab] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [merchQuantity, setMerchQuantity] = useState(1);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
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
    } else if (eventType === "prof-show") {
      const endpoint = `/api/prof-show/${eventIndex}/`;

      axios
        .get(`${apiBaseURL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: "application/json",
          },
        })
        .then((response) => {
          setProfShow(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load prof show details:", err);
          console.log("Prof show details error response:", err.response);
          console.log("Prof show details error data:", err.response?.data);
          setError("Prof show not found or unauthorized.");
          setLoading(false);
          handleApiErrorToast(err, "Failed to load prof show details. Please try again.");
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

  // Set default open slot
  useEffect(() => {
    if (event?.dates && event.dates.length > 0) {
      // Find the first date with slots
      const firstDateWithSlots = event.dates.find(d => d.slots && d.slots.length > 0);
      if (firstDateWithSlots) {
        // Take the first slot from the first available date
        const firstSlot = firstDateWithSlots.slots[0];
        if (firstSlot && firstSlot.is_openforsignings) {
          setOpenSlotIds([firstSlot.slot_id]);
        }
      }
    }
  }, [event]);

  // Preload size chart images for merch
  useEffect(() => {
    if (eventType === "merch" && merch) {
      const tshirtImg = new Image();
      const hoodieImg = new Image();
      tshirtImg.src = "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604896/tee_zmxxfx.jpg";
      hoodieImg.src = "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604890/hoodie_n8sah7.jpg";
    }
  }, [eventType, merch]);

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

  const handleProfShowBuy = async () => {
    if (profShowTicketCount < 1) return;
    
    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Processing your ticket purchase...");
    
    try {
      const formData = new FormData();
      formData.append("tickets", profShowTicketCount);
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
      <div className="min-h-screen bg-app-gradient">
        <Navbar />
        <div className="pt-20 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="aspect-4/3 w-full rounded-lg" />
                  <div className="mt-6 space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!event && !merch && !profShow)) {
    return (
      <div className="min-h-screen bg-app-gradient">
        <Navbar />
        <div className="pt-20 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="rounded-2xl bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Not Found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                {error || "The item you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate("/")} size="sm">
                Go to Home
              </Button>
            </div>
          </div>
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

    const totalPrice = (merch.price + (customizationEnabled && merch.is_customisable ? (merch.customisation_price || 0) : 0)) * merchQuantity;

    return (
      <div className="min-h-screen bg-app-gradient">
        <Navbar />
        <div className="pt-20 pb-40 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 p-2 rounded-xl bg-warning/10">
                    <ShoppingBag className="h-5 w-5 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{merch.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="warning">Merchandise</Badge>
                      {merch.price === 0 && <Badge variant="success">Free</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square bg-muted cursor-pointer group">
                      <img 
                        src={images[currentImageIndex]} 
                        alt={merch.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === currentImageIndex 
                                ? 'bg-foreground w-4' 
                                : 'bg-foreground/30 w-1.5'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
                          <ZoomIn className="h-3 w-3" />
                          Zoom
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-black/95">
                    <div className="relative w-full h-full flex items-center justify-center">
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
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <CardContent className="p-4 sm:p-6 space-y-5">
                  {/* Price */}
                  {merch.price > 0 && (
                    <div className="flex items-baseline gap-1">
                      <IndianRupee className="w-5 h-5" />
                      <span className="text-3xl font-bold">{merch.price}</span>
                    </div>
                  )}

                  {/* Sizes Selection */}
                  {merch.sizes && merch.sizes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Size</label>
                        <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
                          <DialogTrigger asChild>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                              <Info className="w-3 h-3 mr-1" />
                              Size Chart
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Size Chart</h3>
                              <div className="relative bg-muted rounded-lg overflow-hidden">
                                <img 
                                  src={
                                    merch.name.toLowerCase().includes('hoodie') || 
                                    merch.name.toLowerCase().includes('sweatshirt')
                                      ? "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604890/hoodie_n8sah7.jpg"
                                      : "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604896/tee_zmxxfx.jpg"
                                  }
                                  alt="Size Chart"
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {merch.sizes.map((size) => (
                          <button
                            key={size.id}
                            className={`min-w-12 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedSize === size.id.toString()
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedSize(size.id.toString())}
                          >
                            {size.name === "A" ? "One Size" : size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customization Section */}
                  {merch.is_customisable && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Add Customization</label>
                          <p className="text-xs text-muted-foreground">
                            +₹{merch.customisation_price || 0} per item
                          </p>
                        </div>
                        <Switch
                          checked={customizationEnabled}
                          onCheckedChange={setCustomizationEnabled}
                        />
                      </div>
                      {customizationEnabled && (
                        <Input
                          type="text"
                          placeholder={`Enter your ${merch.customisation_type || "text"}...`}
                          value={customizationText}
                          onChange={(e) => setCustomizationText(e.target.value)}
                          className="w-full"
                        />
                      )}
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Quantity</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-r-none"
                          onClick={() => setMerchQuantity(Math.max(1, merchQuantity - 1))}
                          disabled={merchQuantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {merchQuantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-l-none"
                          onClick={() => setMerchQuantity(Math.min(25, merchQuantity + 1))}
                          disabled={merchQuantity >= 25}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">Max 25</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Buy Section */}
              <Card className="hidden md:block">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    {merch.price > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <div className="flex items-baseline gap-1">
                          <IndianRupee className="w-5 h-5" />
                          <span className="text-2xl font-bold">{totalPrice}</span>
                        </div>
                        {customizationEnabled && merch.is_customisable && merch.customisation_price > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Incl. ₹{merch.customisation_price * merchQuantity} customization
                          </p>
                        )}
                      </div>
                    )}
                    <Button 
                      onClick={handleMerchBuy}
                      disabled={purchaseLoading || (merch.sizes && merch.sizes.length > 0 && !selectedSize)}
                      size="lg"
                      className={merch.price === 0 ? 'w-full' : ''}
                    >
                      {purchaseLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {merch.price === 0 ? 'Get Now' : 'Buy Now'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Floating Bottom CTA */}
        <div className="fixed bottom-16 left-0 right-0 md:hidden z-40 px-4 pb-4 pt-2 bg-linear-to-t from-background via-background to-transparent">
          <Card className="border shadow-lg">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              {merch.price > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <div className="flex items-baseline gap-0.5">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-xl font-bold">{totalPrice}</span>
                  </div>
                </div>
              )}
              <Button 
                onClick={handleMerchBuy}
                disabled={purchaseLoading || (merch.sizes && merch.sizes.length > 0 && !selectedSize)}
                className={merch.price === 0 ? 'flex-1' : ''}
              >
                {purchaseLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {merch.price === 0 ? 'Get Now' : 'Buy Now'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prof Show Layout
  if (eventType === "prof-show" && profShow) {
    return (
      <div className="min-h-screen bg-app-gradient">
        <Navbar />
        <div className="pt-20 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 p-2 rounded-xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{profShow.name}</h1>
                    {profShow.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {profShow.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Show Details */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Artist */}
                  {(profShow.artist || profShow.Artist) && (
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Artist</p>
                        <p className="font-medium">{profShow.artist || profShow.Artist}</p>
                      </div>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4">
                    {profShow.start_time && (
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                          <p className="font-medium">{formatDate(profShow.start_time)}</p>
                        </div>
                      </div>
                    )}
                    {profShow.start_time && (
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
                          <p className="font-medium">{formatTime(profShow.start_time)} - {formatTime(profShow.end_time)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Price & Purchase */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ticket Price</p>
                      {profShow.price > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <IndianRupee className="w-5 h-5" />
                          <span className="text-3xl font-bold">{profShow.price}</span>
                        </div>
                      ) : (
                        <Badge variant="success" className="text-lg px-3 py-1">Free</Badge>
                      )}
                    </div>

                    {/* Desktop Buy Section */}
                    <div className="hidden md:block">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg bg-background">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => setProfShowTicketCount(Math.max(1, profShowTicketCount - 1))}
                            disabled={profShowTicketCount <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {profShowTicketCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => setProfShowTicketCount(profShowTicketCount + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          onClick={handleProfShowBuy}
                          disabled={purchaseLoading}
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
                              {profShow.price === 0 ? 'Get Tickets' : 'Buy Tickets'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Buy Section */}
              <div className="fixed bottom-16 left-0 right-0 md:hidden z-40 px-4 pb-4 pt-2 bg-linear-to-t from-background via-background to-transparent">
                <Card className="border shadow-lg">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <div className="flex items-baseline gap-0.5">
                        <IndianRupee className="w-4 h-4" />
                        <span className="text-xl font-bold">{profShow.price * profShowTicketCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg bg-background">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-r-none"
                          onClick={() => setProfShowTicketCount(Math.max(1, profShowTicketCount - 1))}
                          disabled={profShowTicketCount <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {profShowTicketCount}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-l-none"
                          onClick={() => setProfShowTicketCount(profShowTicketCount + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={handleProfShowBuy}
                        disabled={purchaseLoading}
                      >
                        {purchaseLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Ticket className="w-4 h-4 mr-2" />
                            {profShow.price === 0 ? 'Get' : 'Buy'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-Comp Layout
  // Sort dates in ascending chronological order
  const sortedDates = [...event.dates].sort((a, b) => {
    const parseDate = (dateStr) => {
      const [day, month] = dateStr.split(' ');
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      return new Date(new Date().getFullYear(), monthMap[month], parseInt(day));
    };
    return parseDate(a.date) - parseDate(b.date);
  });

  return (
    <div className="min-h-screen bg-app-gradient">
      <Navbar />
      <div className="pt-20 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-primary/10">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight">{event.non_comp_name}</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Tabs */}
            <Tabs value={activeDateTab.toString()} onValueChange={(value) => setActiveDateTab(parseInt(value))}>
              {/* Date Pills - Horizontal scrollable */}
              <div className="overflow-x-auto -mx-4 px-4 pb-2">
                <TabsList className="inline-flex h-auto p-1 bg-muted/50 gap-1">
                  {sortedDates.map((dateObj, idx) => (
                    <TabsTrigger 
                      key={dateObj.date} 
                      value={idx.toString()} 
                      className="px-4 py-2 text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {dateObj.date}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {sortedDates.map((dateObj, idx) => (
                <TabsContent key={dateObj.date} value={idx.toString()} className="mt-4">
                  <div className="space-y-3">
                    {dateObj.slots.length > 0 ? (
                      dateObj.slots.map((slot, slotIdx) => (
                        <Card 
                          key={slot.slot_id} 
                          className={`transition-all animate-fade-in-up ${!slot.is_openforsignings ? 'opacity-50' : 'card-interactive'}`}
                          style={{ animationDelay: `${slotIdx * 50}ms` }}
                        >
                          <CardHeader 
                            className="cursor-pointer pb-3"
                            onClick={() => slot.is_openforsignings && handleSlotToggle(slot.slot_id)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={slot.is_openforsignings ? "success" : "secondary"} size="sm">
                                    {slot.is_openforsignings ? "Open" : "Closed"}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    {slot.venue}
                                  </div>
                                </div>
                              </div>
                              {slot.is_openforsignings && (
                                <ChevronLeft className={`w-5 h-5 text-muted-foreground transition-transform ${openSlotIds.includes(slot.slot_id) ? 'rotate-90' : '-rotate-90'}`} />
                              )}
                            </div>
                          </CardHeader>
                          
                          {openSlotIds.includes(slot.slot_id) && (
                            <CardContent className="pt-0 border-t">
                              {slot.is_openforsignings ? (
                                slot.ticket_types && slot.ticket_types.length > 0 ? (
                                  <div className="pt-4 space-y-4">
                                    <Select
                                      value={selectedTicketType[slot.slot_id] || ""}
                                      onValueChange={(value) => handleTicketTypeChange(slot.slot_id, value)}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select ticket type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {slot.ticket_types.map((tt) => (
                                          <SelectItem key={tt.ticket_type_id} value={tt.ticket_type_id}>
                                            <div className="flex items-center justify-between w-full">
                                              <span>{tt.ticket_type_name}</span>
                                              {tt.price > 0 && (
                                                <span className="text-muted-foreground ml-2">₹{tt.price}</span>
                                              )}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    {selectedTicketType[slot.slot_id] && (
                                      <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="font-medium">
                                              {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.ticket_type_name}
                                            </p>
                                            {(slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0) > 0 && (
                                              <div className="flex items-center text-lg font-semibold">
                                                <IndianRupee className="w-4 h-4" />
                                                {slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price}
                                              </div>
                                            )}
                                            {(slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0) === 0 && (
                                              <Badge variant="success" size="sm">Free</Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center border rounded-lg bg-background">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-9 w-9 rounded-r-none"
                                              onClick={() => handleTicketCount(slot.slot_id, -1)}
                                              disabled={(ticketCounts[slot.slot_id] || 1) <= 1}
                                              aria-label="Decrease quantity"
                                            >
                                              <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="w-10 text-center font-medium">
                                              {ticketCounts[slot.slot_id] || 1}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-9 w-9 rounded-l-none"
                                              onClick={() => handleTicketCount(slot.slot_id, 1)}
                                              aria-label="Increase quantity"
                                            >
                                              <Plus className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                          {(slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0) > 0 && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">Total</p>
                                              <div className="flex items-center text-xl font-bold">
                                                <IndianRupee className="w-4 h-4" />
                                                {(ticketCounts[slot.slot_id] || 1) * (slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0)}
                                              </div>
                                            </div>
                                          )}
                                          <Button 
                                            onClick={() => handleNonCompBuy(slot)}
                                            disabled={(ticketCounts[slot.slot_id] || 1) === 0 || purchaseLoading}
                                            className={(slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0) === 0 ? 'w-full' : ''}
                                          >
                                            {purchaseLoading ? (
                                              <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Processing...
                                              </>
                                            ) : (
                                              <>
                                                <Ticket className="w-4 h-4 mr-2" />
                                                {(slot.ticket_types.find(t => t.ticket_type_id === selectedTicketType[slot.slot_id])?.price || 0) === 0 ? 'Participate' : 'Buy Tickets'}
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Alert className="mt-4">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                      No tickets available for this slot.
                                    </AlertDescription>
                                  </Alert>
                                )
                              ) : (
                                <Alert className="mt-4">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    Signings are not open for this slot.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))
                    ) : (
                      <Card className="animate-fade-in">
                        <CardContent className="py-8 text-center">
                          <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No slots available for this date.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;