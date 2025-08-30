import { Link, useNavigate, useLoaderData } from "react-router-dom";
import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Calendar, Users } from "lucide-react";
import { apiBaseURL } from "../../global";
import {
    getRefreshToken,
    UpdateAccessToken,
    logoutAction,
    accessTokenDuration,
    refreshTokenDuration,
    checkAccessToken,
    checkRefreshToken,
} from "../../assets/utils/auth.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function Home() {
    const [eventList, setEventList] = useState(null);
    const [profShowList, setProfShowList] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshToken = getRefreshToken();
    const accessToken = useLoaderData();
    const [emptyEventsMsg, setEmptyEventsMsg] = useState("Loading available events...");
    const [emptyProfShowMsg, setEmptyProfShowMsg] = useState("Loading available prof shows...");

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

            if (response.data.prof_shows.length === 0) {
                setEmptyProfShowMsg("No prof shows available at this moment.");
            } else {
                setProfShowList(response.data.prof_shows.reverse());
            }
            setLoading(false);
        }).catch((errResponse) => {
            setEmptyEventsMsg("Something went wrong while fetching events.");
            setEmptyProfShowMsg("Something went wrong while fetching prof shows.");
            setLoading(false);
            console.log(errResponse);
        });
    }, [accessToken]);

    const EventCard = ({ event, type }) => (
        <Card className="group hover:shadow-lg transition-all duration-300 border hover:scale-105 hover:border-primary/30">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-subheading group-hover:text-primary transition-colors">
                        {event.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {type === 'prof-show' ? 'Prof Show' : 'Event'}
                    </Badge>
                </div>
                <CardDescription className="text-body-small line-clamp-2">
                    {event.description || "No description available"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-caption">
                        <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Open</span>
                        </div>
                    </div>
                    <Button 
                        asChild 
                        className="font-medium transition-all duration-300 hover:scale-105"
                    >
                        <Link to={`/EventDetails/${type}/${event.id}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const LoadingSkeleton = () => (
        <Card>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
            </CardContent>
        </Card>
    );

    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-heading-tertiary mb-2">No items found</h3>
            <p className="text-body text-muted-foreground max-w-md">{message}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
            <Navbar />
            <div className="pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-heading-primary mb-4">
                            Available Events
                        </h1>
                        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
                            Browse our curated list of events and prof shows. Select the ones that spark your interest.
                        </p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="prof-shows" className="w-full">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                            <TabsTrigger 
                                value="prof-shows"
                            >
                                Prof Shows
                            </TabsTrigger>
                            <TabsTrigger 
                                value="events"
                            >
                                Events
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="prof-shows" className="space-y-6">
                            {loading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <LoadingSkeleton key={i} />
                                    ))}
                                </div>
                            ) : profShowList && profShowList.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {profShowList.map((show, index) => (
                                        <EventCard 
                                            key={index} 
                                            event={show} 
                                            type="prof-show" 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message={emptyProfShowMsg} />
                            )}
                        </TabsContent>

                        <TabsContent value="events" className="space-y-6">
                            {loading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <LoadingSkeleton key={i} />
                                    ))}
                                </div>
                            ) : eventList && eventList.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {eventList.map((event, index) => (
                                        <EventCard 
                                            key={index} 
                                            event={event} 
                                            type="non-comp" 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message={emptyEventsMsg} />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default Home;
