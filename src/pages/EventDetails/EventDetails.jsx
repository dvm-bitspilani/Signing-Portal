import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiBaseURL, merchBaseURL } from "../../global";
import { getAccessToken } from "../../assets/utils/auth.js";
import {
  handleApiErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
  showErrorToast,
} from "../../assets/utils/toast.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Minus, Plus, ZoomIn } from "lucide-react";
import { Page, BackLink, ErrorState, Price } from "@/components/Page";
import { sortSizes } from "@/lib/sizes";
import { cn } from "@/lib/utils";

const SIZE_CHARTS = {
  hoodie: "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604890/hoodie_n8sah7.jpg",
  tee: "https://res.cloudinary.com/dmcy7qqn7/image/upload/v1760604896/tee_zmxxfx.jpg",
};

/* ---------------------------------------------------------------- pieces */

function Eyebrow({ children, color }) {
  return (
    <span className="label-mono" style={{ color }}>
      {children}
    </span>
  );
}

function Title({ kind, kindColor, name, description }) {
  return (
    <div className="mb-6">
      <Eyebrow color={kindColor}>{kind}</Eyebrow>
      <h1 className="display mt-2 text-[1.6rem] sm:text-[2rem]">{name}</h1>
      {description && (
        <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

/** Label/value rows set like a printed ticket: mono field name, plain value. */
function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="label-mono shrink-0 text-muted-foreground">{label}</span>
      <span className="numeral truncate text-right text-sm">{value}</span>
    </div>
  );
}

function QuantityStepper({ value, onChange, min = 1, max = 25, label }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-r-none"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-4" />
      </Button>
      <span
        className="numeral w-10 text-center text-sm font-semibold"
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-l-none"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

/**
 * The panel you are about to tear off. Same die-cut as a booked stub, so the
 * thing you're claiming and the thing you end up holding look like each other.
 */
function ClaimPanel({ total, note, children, className }) {
  return (
    <div className={cn("stub", className)}>
      {children && <div className="p-4 sm:p-5">{children}</div>}
      <div
        className={cn(
          "flex items-end justify-between gap-4 px-4 pb-4 pt-4 sm:px-5 sm:pb-5",
          children && "stub-tear",
        )}
      >
        <div className="min-w-0">
          <p className="label-mono text-muted-foreground">Total</p>
          <div className="mt-1">
            <Price amount={total} size="xl" />
          </div>
          {note && (
            <p className="numeral mt-1 text-xs text-muted-foreground">{note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Mobile action bar. Sits above the bottom nav, never on top of it. */
function StickyBar({ children, className }) {
  return (
    <div
      className={cn(
        "bottom-shell fixed inset-x-0 z-40 border-t border-border bg-background px-4 py-3",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

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
  const [profShowTicketCount] = useState(1);
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
          setError("This event isn't available.");
          setLoading(false);
          handleApiErrorToast(err, "Couldn't load this event.");
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
          setError("This show isn't available.");
          setLoading(false);
          handleApiErrorToast(err, "Couldn't load this show.");
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
          setError("This item isn't available.");
          setLoading(false);
          handleApiErrorToast(err, "Couldn't load this item.");
        });
    } else {
      setError("Invalid event type.");
      setLoading(false);
    }
  }, [eventType, eventIndex, accessToken]);

  // Open the first bookable slot by default.
  useEffect(() => {
    if (event?.dates && event.dates.length > 0) {
      const firstDateWithSlots = event.dates.find(
        (d) => d.slots && d.slots.length > 0,
      );
      if (firstDateWithSlots) {
        const firstSlot = firstDateWithSlots.slots[0];
        if (firstSlot && firstSlot.is_openforsignings) {
          setOpenSlotIds([firstSlot.slot_id]);
        }
      }
    }
  }, [event]);

  // Preload size charts so the dialog opens instantly.
  useEffect(() => {
    if (eventType === "merch" && merch) {
      Object.values(SIZE_CHARTS).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [eventType, merch]);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSlotToggle = (slotId) => {
    setOpenSlotIds((prev) => (prev.includes(slotId) ? [] : [slotId]));
  };

  const handleTicketTypeChange = (slotId, ticketTypeId) => {
    setSelectedTicketType((prev) => ({ ...prev, [slotId]: ticketTypeId }));
    setTicketCounts((prev) => ({ ...prev, [slotId]: 1 }));
  };

  const handleNonCompBuy = async (slot) => {
    const selectedTypeId = selectedTicketType[slot.slot_id];
    const count = ticketCounts[slot.slot_id] || 1;
    if (!selectedTypeId || count < 1) return;

    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Signing you up…");

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
        },
      );
      dismissToast(loadingToastId);
      showSuccessToast("Signed up. Taking you to your signings.");
      setTimeout(() => navigate("/yoursignings"), 1200);
    } catch (err) {
      console.error("Purchase failed:", err);
      dismissToast(loadingToastId);
      handleApiErrorToast(err, "Couldn't complete the sign-up.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleProfShowBuy = async () => {
    if (profShowTicketCount < 1) return;

    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Booking your ticket…");

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
        },
      );
      dismissToast(loadingToastId);
      showSuccessToast("Booked. Taking you to your signings.");
      setTimeout(() => navigate("/yoursignings"), 1200);
    } catch (err) {
      console.error("Purchase failed:", err);
      dismissToast(loadingToastId);
      handleApiErrorToast(err, "Couldn't book the ticket.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleMerchBuy = async () => {
    if (merch.sizes && merch.sizes.length > 0 && !selectedSize) {
      showErrorToast("Pick a size first");
      return;
    }
    if (merchQuantity < 1 || merchQuantity > 25) {
      showErrorToast("Quantity must be between 1 and 25");
      return;
    }
    if (customizationEnabled && merch.is_customisable && !customizationText.trim()) {
      showErrorToast(`Enter your ${merch.customisation_type || "customisation"}`);
      return;
    }

    setPurchaseLoading(true);
    const loadingToastId = showLoadingToast("Placing your order…");

    try {
      const purchaseData = [
        {
          id: merch.sizes && merch.sizes.length > 0 ? selectedSize : merch.id,
          quantity: merchQuantity,
          ...(merch.is_customisable && {
            is_customised:
              customizationEnabled && customizationText.trim() ? true : false,
            customisation_text:
              customizationEnabled && customizationText.trim()
                ? customizationText.trim()
                : "",
          }),
        },
      ];

      await axios.post(`${merchBaseURL}/buy_merch`, purchaseData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      dismissToast(loadingToastId);
      showSuccessToast("Ordered. Taking you to your signings.");
      setTimeout(() => navigate("/yoursignings"), 1200);
    } catch (err) {
      console.error("Merch purchase failed:", err);
      dismissToast(loadingToastId);
      handleApiErrorToast(err, "Couldn't place the order.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  /* ------------------------------------------------------------ states */

  if (loading) {
    return (
      <Page width="narrow">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-9 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-1/2" />
        <Skeleton className="mt-8 h-48 w-full rounded-xl" />
      </Page>
    );
  }

  if (error || (!event && !merch && !profShow)) {
    return (
      <Page width="narrow">
        <BackLink to={eventType === "merch" ? "/merch" : "/events"} />
        <ErrorState
          title="Not available"
          body={error || "This item doesn't exist or has been taken down."}
          onRetry={() => navigate(eventType === "merch" ? "/merch" : "/events")}
        />
      </Page>
    );
  }

  /* ------------------------------------------------------------- merch */

  if (eventType === "merch" && merch) {
    const images = merch.extra_images_url
      ? [merch.front_image_url, ...merch.extra_images_url]
      : [merch.front_image_url];

    const unitPrice =
      merch.price +
      (customizationEnabled && merch.is_customisable
        ? merch.customisation_price || 0
        : 0);
    const totalPrice = unitPrice * merchQuantity;
    const needsSize = merch.sizes?.length > 0 && !selectedSize;
    const isSizeChartHoodie = /hoodie|sweatshirt/i.test(merch.name || "");

    const buyLabel = merch.price === 0 ? "Get it" : "Buy now";

    return (
      /* Breakpoints track the bottom nav, which disappears at md. Anchoring
         the action bar above a nav that isn't there would leave it floating. */
      <Page className="pb-32 md:pb-10">
        <BackLink to="/merch" />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-10">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28">
            <Dialog open={imageZoomOpen} onOpenChange={setImageZoomOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
                  aria-label="Open full size image"
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={merch.name}
                    className="size-full object-contain"
                  />
                  <span className="label-mono absolute right-3 top-3 flex items-center gap-1.5 rounded bg-background/90 px-2 py-1.5 backdrop-blur-sm">
                    <ZoomIn className="size-3" />
                    Zoom
                  </span>
                </button>
              </DialogTrigger>
              {/* flex, not the base grid: a grid item sized `h-full` against
                  an auto-sized row can't resolve, so the image collapses. */}
              <DialogContent className="flex h-[90dvh] w-[95vw] max-w-5xl items-center justify-center p-2">
                <DialogTitle className="sr-only">{merch.name}</DialogTitle>
                <img
                  src={images[currentImageIndex]}
                  alt={merch.name}
                  className="max-h-full max-w-full object-contain"
                />
              </DialogContent>
            </Dialog>

            {/* Thumbnails beat hover arrows: every option is visible and each
                one is a real 64px tap target. */}
            {images.length > 1 && (
              <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={idx === currentImageIndex}
                    className={cn(
                      "size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      idx === currentImageIndex
                        ? "border-primary"
                        : "border-border hover:border-foreground/30",
                    )}
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mt-6 lg:mt-0">
            <Title
              kind="Merch"
              kindColor="var(--brass)"
              name={merch.name}
              description={merch.description}
            />

            <div className="mb-6">
              <Price amount={merch.price} size="xl" />
            </div>

            <div className="space-y-7">
              {merch.sizes?.length > 0 && (
                <section>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h2 className="label-mono text-foreground">Size</h2>
                    <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Size chart
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogTitle className="label-mono">
                          Size chart
                        </DialogTitle>
                        <img
                          src={isSizeChartHoodie ? SIZE_CHARTS.hoodie : SIZE_CHARTS.tee}
                          alt="Size chart with measurements"
                          className="w-full rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortSizes(merch.sizes, (s) => s.name).map((size) => {
                      const active = selectedSize === size.id.toString();
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSize(size.id.toString())}
                          aria-pressed={active}
                          className={cn(
                            "numeral h-11 min-w-12 rounded-lg border px-4 text-sm font-semibold transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-foreground/30",
                          )}
                        >
                          {size.name === "A" ? "One size" : size.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {merch.is_customisable && (
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="label-mono text-foreground">
                        Add your {merch.customisation_type || "text"}
                      </h2>
                      <p className="numeral mt-1 text-xs text-muted-foreground">
                        +₹{merch.customisation_price || 0} per item
                      </p>
                    </div>
                    <Switch
                      checked={customizationEnabled}
                      onCheckedChange={setCustomizationEnabled}
                      aria-label="Add customisation"
                    />
                  </div>
                  {customizationEnabled && (
                    <Input
                      type="text"
                      placeholder={`Your ${merch.customisation_type || "text"}`}
                      value={customizationText}
                      onChange={(e) => setCustomizationText(e.target.value)}
                      className="mt-3 h-11"
                    />
                  )}
                </section>
              )}

              <section>
                <h2 className="label-mono mb-2.5 text-foreground">Quantity</h2>
                <div className="flex items-center gap-3">
                  <QuantityStepper
                    value={merchQuantity}
                    onChange={setMerchQuantity}
                    max={25}
                    label="quantity"
                  />
                  <span className="numeral text-xs text-muted-foreground">
                    Max 25
                  </span>
                </div>
              </section>
            </div>

            {/* Desktop claim panel */}
            <ClaimPanel
              className="mt-8 hidden md:block"
              total={totalPrice}
              note={
                customizationEnabled &&
                merch.is_customisable &&
                merch.customisation_price > 0
                  ? `Includes ₹${merch.customisation_price * merchQuantity} customisation`
                  : null
              }
            >
              <Field label="Item" value={merch.name} />
              {merch.sizes?.length > 0 && (
                <Field
                  label="Size"
                  value={
                    merch.sizes.find((s) => s.id.toString() === selectedSize)
                      ?.name || "Not picked"
                  }
                />
              )}
              <Field label="Quantity" value={merchQuantity} />
            </ClaimPanel>

            <div className="mt-4 hidden md:block">
              <Button
                onClick={handleMerchBuy}
                disabled={needsSize}
                loading={purchaseLoading}
                size="lg"
                className="w-full"
              >
                {purchaseLoading ? "Working" : needsSize ? "Pick a size" : buyLabel}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile action bar */}
        <StickyBar className="md:hidden">
          <div className="min-w-0">
            <p className="label-mono text-muted-foreground">Total</p>
            <Price amount={totalPrice} size="lg" className="mt-0.5 block" />
          </div>
          <Button
            onClick={handleMerchBuy}
            disabled={needsSize}
            loading={purchaseLoading}
            className="min-w-32"
          >
            {purchaseLoading ? "Working" : needsSize ? "Pick a size" : buyLabel}
          </Button>
        </StickyBar>
      </Page>
    );
  }

  /* --------------------------------------------------------- prof show */

  if (eventType === "prof-show" && profShow) {
    const artist = profShow.artist || profShow.Artist;
    const buyLabel = profShow.price === 0 ? "Get ticket" : "Buy ticket";

    return (
      <Page width="narrow" className="pb-32 md:pb-10">
        <BackLink onClick={() => navigate(-1)} />

        <Title
          kind="Prof show"
          kindColor="var(--sky)"
          name={profShow.name}
          description={profShow.description}
        />

        <ClaimPanel total={profShow.price}>
          <div className="divide-y divide-border">
            <Field label="Artist" value={artist} />
            <Field label="Date" value={formatDate(profShow.start_time)} />
            <Field
              label="Time"
              value={
                profShow.start_time
                  ? `${formatTime(profShow.start_time)} – ${formatTime(profShow.end_time)}`
                  : null
              }
            />
            {/* The old stepper here was permanently disabled. Stating the rule
                is more useful than showing two controls that never move. */}
            <Field label="Limit" value="1 per person" />
          </div>
        </ClaimPanel>

        <div className="mt-4 hidden md:block">
          <Button
            onClick={handleProfShowBuy}
            loading={purchaseLoading}
            size="lg"
            className="w-full"
          >
            {purchaseLoading ? "Working" : buyLabel}
          </Button>
        </div>

        <StickyBar className="md:hidden">
          <div className="min-w-0">
            <p className="label-mono text-muted-foreground">Total</p>
            <Price amount={profShow.price} size="lg" className="mt-0.5 block" />
          </div>
          <Button
            onClick={handleProfShowBuy}
            loading={purchaseLoading}
            className="min-w-32"
          >
            {purchaseLoading ? "Working" : buyLabel}
          </Button>
        </StickyBar>
      </Page>
    );
  }

  /* ---------------------------------------------------------- non-comp */

  const MONTHS = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const sortedDates = [...event.dates].sort((a, b) => {
    const parse = (dateStr) => {
      const [day, month] = dateStr.split(" ");
      return new Date(new Date().getFullYear(), MONTHS[month], parseInt(day));
    };
    return parse(a.date) - parse(b.date);
  });

  const activeDate = sortedDates[activeDateTab] || sortedDates[0];

  return (
    <Page width="narrow">
      <BackLink onClick={() => navigate(-1)} />

      <Title
        kind="Event"
        kindColor="var(--flame)"
        name={event.non_comp_name}
        description={event.description}
      />

      {/* Date strip. Horizontally scrollable, bled to the screen edges so it
          reads as scrollable on a phone instead of looking clipped. */}
      <div className="scrollbar-hide -mx-4 mb-5 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        <div className="flex gap-2" role="group" aria-label="Pick a date">
          {sortedDates.map((dateObj, idx) => {
            const active = idx === activeDateTab;
            const open = dateObj.slots?.some((s) => s.is_openforsignings);
            return (
              <button
                key={dateObj.date}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveDateTab(idx)}
                className={cn(
                  "numeral flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground/30",
                )}
              >
                {dateObj.date}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    active
                      ? "bg-primary-foreground/60"
                      : open
                        ? "bg-leaf"
                        : "bg-muted-foreground/40",
                  )}
                />
                <span className="sr-only">
                  {open ? "has open slots" : "no open slots"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {activeDate?.slots?.length > 0 ? (
          activeDate.slots.map((slot) => {
            const isOpen = openSlotIds.includes(slot.slot_id);
            const types = slot.ticket_types || [];
            const selectedId = selectedTicketType[slot.slot_id];
            const selected = types.find((t) => t.ticket_type_id === selectedId);
            const count = ticketCounts[slot.slot_id] || 1;
            const unit = selected?.price || 0;

            return (
              <div
                key={slot.slot_id}
                className={cn(
                  "overflow-hidden rounded-xl border border-border bg-card",
                  !slot.is_openforsignings && "opacity-55",
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    slot.is_openforsignings && handleSlotToggle(slot.slot_id)
                  }
                  disabled={!slot.is_openforsignings}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-default"
                >
                  <div className="min-w-0 flex-1">
                    <div className="numeral text-[0.9375rem] font-semibold">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {slot.venue}
                    </div>
                  </div>

                  <Badge
                    variant={slot.is_openforsignings ? "success" : "cancelled"}
                    size="sm"
                  >
                    {slot.is_openforsignings ? "Open" : "Closed"}
                  </Badge>

                  {slot.is_openforsignings && (
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {isOpen && slot.is_openforsignings && (
                  <div className="border-t border-border p-4">
                    {types.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <label
                            className="label-mono mb-2 block text-muted-foreground"
                            htmlFor={`type-${slot.slot_id}`}
                          >
                            Ticket type
                          </label>
                          <Select
                            value={selectedId || ""}
                            onValueChange={(value) =>
                              handleTicketTypeChange(slot.slot_id, value)
                            }
                          >
                            <SelectTrigger
                              id={`type-${slot.slot_id}`}
                              className="h-11 w-full"
                            >
                              <SelectValue placeholder="Pick a ticket type" />
                            </SelectTrigger>
                            <SelectContent>
                              {types.map((tt) => (
                                <SelectItem
                                  key={tt.ticket_type_id}
                                  value={tt.ticket_type_id}
                                >
                                  {tt.ticket_type_name}
                                  {tt.price > 0 ? ` — ₹${tt.price}` : " — Free"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selected && (
                          <>
                            <div className="flex items-center justify-between gap-4">
                              <span className="label-mono text-muted-foreground">
                                Tickets
                              </span>
                              <QuantityStepper
                                value={count}
                                onChange={(next) =>
                                  setTicketCounts((prev) => ({
                                    ...prev,
                                    [slot.slot_id]: next,
                                  }))
                                }
                                max={25}
                                label="tickets"
                              />
                            </div>

                            <ClaimPanel
                              className="stub-on-card"
                              total={unit * count}
                            >
                              <div className="divide-y divide-border">
                                <Field
                                  label="Type"
                                  value={selected.ticket_type_name}
                                />
                                <Field
                                  label="Slot"
                                  value={`${activeDate.date}, ${formatTime(slot.start_time)}`}
                                />
                                <Field label="Venue" value={slot.venue} />
                              </div>
                            </ClaimPanel>

                            <Button
                              onClick={() => handleNonCompBuy(slot)}
                              disabled={count === 0}
                              loading={purchaseLoading}
                              className="w-full"
                            >
                              {purchaseLoading
                                ? "Working"
                                : unit === 0
                                  ? "Sign up"
                                  : "Buy tickets"}
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tickets have been set up for this slot yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No slots on this date. Try another one above.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
}

export default EventDetails;
