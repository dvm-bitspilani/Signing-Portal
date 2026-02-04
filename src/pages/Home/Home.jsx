import { Link, useNavigate, useLoaderData } from "react-router-dom";
import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Calendar, Users, Clock, MapPin, ChevronRight, Sparkles } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Home() {
    const [eventList, setEventList] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshToken = getRefreshToken();
    const accessToken = useLoaderData();
    const [emptyEventsMsg, setEmptyEventsMsg] = useState("Loading available events...");

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
        axios.get(`${apiBaseURL}/api/shows`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            if (response.data.non_comp_events.length === 0) {
                setEmptyEventsMsg("No events available at this moment.");
            } else {
                setEventList(response.data.non_comp_events.reverse());
            }
            setLoading(false);
        }).catch((errResponse) => {
            setEmptyEventsMsg("Something went wrong while fetching events.");
            setLoading(false);
            handleApiErrorToast(errResponse, "Failed to load events. Please try again.");
            console.log(errResponse);
        });
    }, [accessToken]);

    const EventCard = ({ event, index }) => (
        <Card 
            className={cn(
                "group overflow-hidden border bg-card",
                "transition-all duration-300 ease-out",
                "hover:shadow-lg hover:-translate-y-1 hover:border-primary/30",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <CardContent className="p-5">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {event.name}
                            </h3>
                        </div>
                        <Badge 
                            variant="info" 
                            className="shrink-0"
                        >
                            Event
                        </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {event.description || "Experience this exciting event at the fest!"}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Multiple Slots</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Open for Booking</span>
                        </div>
                    </div>
                    
                    {/* Action */}
                    <Button 
                        asChild 
                        className="w-full group/btn"
                    >
                        <Link to={`/EventDetails/non-comp/${event.id}`}>
                            <span>View Details</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const LoadingSkeleton = () => (
        <Card className="overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-4 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="rounded-2xl bg-muted/50 p-6 mb-6">
                <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events available</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                {emptyEventsMsg}
            </p>
            <Button asChild variant="outline">
                <Link to="/">Browse Merchandise Instead</Link>
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-app-gradient">
            <Navbar />
            
            <div className="pt-6 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <header className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Events
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Discover and book your spot at exciting fest events
                        </p>
                    </header>
                    
                    {/* Grid */}
                    {loading ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <LoadingSkeleton key={i} />
                            ))}
                        </div>
                    ) : eventList && eventList.length > 0 ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {eventList.map((event, index) => (
                                <EventCard 
                                    key={event.id || index} 
                                    event={event}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
