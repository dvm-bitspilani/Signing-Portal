import {
  Link,
  useNavigate,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarX2, ChevronRight, Search, SearchX, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSearch, normalize } from "@/lib/fuzzy";

const KINDS = {
  deal: { label: "Deal", color: "var(--sky)", path: "prof-show" },
  event: { label: "Event", color: "var(--flame)", path: "non-comp" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "deal", label: "Deals" },
  { value: "event", label: "Events" },
];

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

/**
 * "/" jumps to the field from anywhere on the page, Escape clears it. The
 * clear button only exists while there is something to clear.
 */
function SearchField({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-w-0 flex-1">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder="Search events and deals"
        aria-label="Search events and deals"
        autoComplete="off"
        spellCheck={false}
        className="h-11 w-full rounded-lg border border-border bg-transparent pl-10 pr-10 text-base outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 dark:bg-input/30 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function KindFilter({ value, onChange, counts }) {
  return (
    <div className="flex gap-2" role="group" aria-label="Filter by kind">
      {FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground/30",
            )}
          >
            {filter.label}
            <span
              className={cn(
                "numeral text-xs font-medium",
                active ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {counts[filter.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Events() {
  const [eventList, setEventList] = useState(null);
  const [profShowsList, setProfShowsList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const refreshToken = getRefreshToken();
  const accessToken = useLoaderData();

  const navigate = useNavigate();

  // Search and filter live in the URL so coming back from an event's page
  // lands on the same results.
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const kind = KINDS[searchParams.get("kind")] ? searchParams.get("kind") : "all";

  const updateParam = (key, value) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  // Debounced, so typing doesn't navigate on every keystroke.
  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQuery) return;
    const timer = setTimeout(() => updateParam("q", trimmed), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, urlQuery]);

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

  const items = useMemo(
    () => [
      ...(profShowsList ?? []).map((show) => ({ ...show, kind: "deal" })),
      ...(eventList ?? []).map((event) => ({ ...event, kind: "event" })),
    ],
    [profShowsList, eventList],
  );

  const search = useMemo(
    () =>
      createSearch(items, {
        getTitle: (item) => item.name,
        getDescription: (item) => item.description,
      }),
    [items],
  );

  const searching = normalize(query) !== "";
  const matches = useMemo(() => search(query), [search, query]);
  const counts = {
    all: matches.length,
    deal: matches.filter((item) => item.kind === "deal").length,
    event: matches.filter((item) => item.kind === "event").length,
  };
  const visible =
    kind === "all" ? matches : matches.filter((item) => item.kind === kind);

  const renderCard = (item) => {
    const k = KINDS[item.kind];
    return (
      <BrowseCard
        key={`${item.kind}-${item.id}`}
        to={`/EventDetails/${k.path}/${item.id}`}
        kind={k.label}
        kindColor={k.color}
        title={item.name}
        description={item.description}
        meta={item.kind === "event" ? "Pick a slot" : undefined}
      />
    );
  };

  const clearAll = () => {
    setQuery("");
    setSearchParams({}, { replace: true, preventScrollReset: true });
  };

  const meta = loading
    ? "Loading"
    : loadError
      ? "Unavailable"
      : total === 0
        ? "Nothing open yet"
        : [
            showCount > 0 &&
              `${showCount} deal${showCount === 1 ? "" : "s"}`,
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
        <>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField value={query} onChange={setQuery} />
            <KindFilter
              value={kind}
              onChange={(value) => updateParam("kind", value === "all" ? "" : value)}
              counts={counts}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={searching ? `Nothing matches "${query.trim()}"` : "Nothing here"}
              body={
                searching
                  ? "Try a shorter word, or search across everything."
                  : "Nothing of this kind is open yet."
              }
              action={
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear search
                </Button>
              }
            />
          ) : searching ? (
            // A query ranks across both kinds, so results are one list,
            // best match first; the card's kind label still tells them apart.
            <section>
              <SectionLabel count={visible.length}>Results</SectionLabel>
              <Grid>{visible.map(renderCard)}</Grid>
            </section>
          ) : (
            <div className="space-y-9">
              {["deal", "event"]
                .filter((k) => kind === "all" || kind === k)
                .map((k) => {
                  const group = visible.filter((item) => item.kind === k);
                  if (group.length === 0) return null;
                  return (
                    <section key={k}>
                      <SectionLabel count={group.length}>
                        {KINDS[k].label}s
                      </SectionLabel>
                      <Grid>{group.map(renderCard)}</Grid>
                    </section>
                  );
                })}
            </div>
          )}
        </>
      )}
    </Page>
  );
}

export default Events;
