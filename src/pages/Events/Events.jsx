import { Link, useNavigate, useLoaderData } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { CalendarX2, ChevronRight } from "lucide-react";
import { apiBaseURL } from "../../global";
import { handleApiErrorToast } from "../../assets/utils/toast.js";
import {
  getRefreshToken,
  UpdateAccessToken,
  logoutAction,
  accessTokenDuration,
  refreshTokenDuration,
  checkAccessToken,
  checkRefreshToken,
} from "../../assets/utils/auth.js";
import { Skeleton } from "@/components/ui/skeleton";
import { Page, PageHeader, EmptyState, ErrorState } from "@/components/Page";

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/**
 * The whole card is the link. On a phone the old layout put a 90px "View
 * Details" button inside an otherwise dead 300px card; here the target is
 * the card and the chevron just says so.
 *
 * The left rule carries the one fact that changes what happens next: what
 * kind of thing this is.
 */
function BrowseCard({ to, kind, kindColor, title, description, meta }) {
  return (
    <Link
      to={to}
      className="kind-rule pressable group flex flex-col hover:border-foreground/25"
      style={{ "--kind": kindColor }}
    >
      <div className="flex flex-1 flex-col gap-2 p-4 pl-5 sm:p-5 sm:pl-6">
        <span className="label-mono" style={{ color: kindColor }}>
          {kind}
        </span>

        <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em]">
          {title}
        </h3>

        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="numeral truncate text-xs text-muted-foreground">
            {meta}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 sm:p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mt-1.5 h-3.5 w-2/3" />
      <Skeleton className="mt-6 h-3 w-24" />
    </div>
  );
}

const Grid = ({ children }) => (
  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
    {children}
  </div>
);

const SectionLabel = ({ children, count }) => (
  <div className="mb-3 flex items-baseline gap-2">
    <h2 className="label-mono text-foreground">{children}</h2>
    <span className="numeral text-xs text-muted-foreground">{count}</span>
  </div>
);

function Events() {
  const [eventList, setEventList] = useState(null);
  const [profShowsList, setProfShowsList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const refreshToken = getRefreshToken();
  const accessToken = useLoaderData();

  const navigate = useNavigate();

  useEffect(() => {
    if (!refreshToken || !accessToken) {
      logoutAction();
      navigate("/signin");
      return;
    }

    checkAccessToken();

    if (checkRefreshToken() === "EXPIRED") {
      logoutAction();
      navigate("/signin");
      return;
    }

    const accessTokenTimer = setTimeout(() => {
      UpdateAccessToken();
    }, accessTokenDuration());

    const refreshTokenTimer = setTimeout(() => {
      if (checkRefreshToken() === "EXPIRED") {
        logoutAction();
        navigate("/signin");
      }
    }, refreshTokenDuration());

    return () => {
      clearTimeout(accessTokenTimer);
      clearTimeout(refreshTokenTimer);
    };
  }, [refreshToken, accessToken, navigate]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiBaseURL}/api/shows`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setEventList([...response.data.non_comp_events].reverse());
        setProfShowsList([...response.data.prof_shows].reverse());
        setLoadError(null);
        setLoading(false);
      })
      .catch((errResponse) => {
        setLoadError("Couldn't reach the signings server.");
        setLoading(false);
        handleApiErrorToast(errResponse, "Couldn't load events.");
        console.log(errResponse);
      });
  }, [accessToken]);

  const eventCount = eventList?.length ?? 0;
  const showCount = profShowsList?.length ?? 0;
  const total = eventCount + showCount;

  const meta = loading
    ? "Loading"
    : loadError
      ? "Unavailable"
      : total === 0
        ? "Nothing open yet"
        : [
            showCount > 0 &&
              `${showCount} prof show${showCount === 1 ? "" : "s"}`,
            eventCount > 0 && `${eventCount} event${eventCount === 1 ? "" : "s"}`,
          ]
            .filter(Boolean)
            .join(" · ");

  const profShowMeta = (show) => {
    const artist = show.Artist || show.artist;
    const when = show.start_time
      ? `${dateLabel(show.start_time)} · ${timeLabel(show.start_time)}`
      : null;
    return [artist, when].filter(Boolean).join("  ·  ") || "Open for signings";
  };

  return (
    <Page>
      <PageHeader title="Events" meta={meta} />

      {loading ? (
        <Grid>
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </Grid>
      ) : loadError ? (
        <ErrorState title="Couldn't load events" body={loadError} />
      ) : total === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Nothing open yet"
          body="Signings open closer to the fest. Check back then."
        />
      ) : (
        <div className="space-y-9">
          {showCount > 0 && (
            <section>
              <SectionLabel count={showCount}>Prof shows</SectionLabel>
              <Grid>
                {profShowsList.map((show) => (
                  <BrowseCard
                    key={show.id}
                    to={`/EventDetails/prof-show/${show.id}`}
                    kind="Prof show"
                    kindColor="var(--sky)"
                    title={show.name}
                    description={show.description}
                    meta={profShowMeta(show)}
                  />
                ))}
              </Grid>
            </section>
          )}

          {eventCount > 0 && (
            <section>
              <SectionLabel count={eventCount}>Events</SectionLabel>
              <Grid>
                {eventList.map((event) => (
                  <BrowseCard
                    key={event.id}
                    to={`/EventDetails/non-comp/${event.id}`}
                    kind="Event"
                    kindColor="var(--flame)"
                    title={event.name}
                    description={event.description}
                    meta="Pick a slot"
                  />
                ))}
              </Grid>
            </section>
          )}
        </div>
      )}
    </Page>
  );
}

export default Events;
