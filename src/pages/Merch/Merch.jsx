import { Link, useNavigate, useLoaderData } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";
import { merchBaseURL } from "../../global";
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
import { Button } from "@/components/ui/button";
import { Page, PageHeader, EmptyState, ErrorState, Price } from "@/components/Page";
import { sortSizes } from "@/lib/sizes";
import { cn } from "@/lib/utils";

/**
 * Browse shows one image per product; the carousel lives on the detail page.
 * Arrow buttons here were hover-only, so on a phone they were invisible
 * controls nested inside a link.
 */
function MerchCard({ merch }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      to={`/EventDetails/merch/${merch.id}`}
      className="pressable group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-foreground/25"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={merch.front_image_url}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            "size-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
        {merch.is_customisable && (
          <span className="label-mono absolute left-2 top-2 rounded bg-background/90 px-1.5 py-1 text-brass backdrop-blur-sm">
            Custom
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] sm:text-[0.9375rem]">
          {merch.name}
        </h3>

        {merch.sizes?.length > 0 && (
          <p className="numeral text-[0.6875rem] tracking-wide text-muted-foreground">
            {sortSizes(merch.sizes).join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <Price amount={merch.price} size="md" />
          {merch.is_customisable && merch.customisation_price > 0 && (
            <span className="numeral text-[0.6875rem] text-muted-foreground">
              +₹{merch.customisation_price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 sm:p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-4 h-5 w-16" />
      </div>
    </div>
  );
}

function Merch() {
  const [merchList, setMerchList] = useState(null);
  const [merchLoading, setMerchLoading] = useState(true);
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
    setMerchLoading(true);
    axios
      .get(`${merchBaseURL}/merch_list`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setMerchList(response.data);
        setLoadError(null);
        setMerchLoading(false);
      })
      .catch((errResponse) => {
        setLoadError("Couldn't reach the merch server.");
        setMerchLoading(false);
        handleApiErrorToast(errResponse, "Couldn't load merch.");
        console.log(errResponse);
      });
  }, [accessToken]);

  const count = merchList?.length ?? 0;

  return (
    <Page>
      <PageHeader
        title="Merch"
        meta={
          merchLoading
            ? "Loading"
            : loadError
              ? "Unavailable"
              : count === 0
                ? "Nothing in stock"
                : `${count} item${count === 1 ? "" : "s"}`
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {merchLoading &&
          Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
        {!merchLoading &&
          !loadError &&
          merchList?.map((merch) => <MerchCard key={merch.id} merch={merch} />)}
      </div>

      {!merchLoading && loadError && (
        <ErrorState title="Couldn't load merch" body={loadError} />
      )}

      {!merchLoading && !loadError && count === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="Nothing in stock"
          body="Merch goes up before the fest. Events are open in the meantime."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/events">Browse events</Link>
            </Button>
          }
        />
      )}
    </Page>
  );
}

export default Merch;
