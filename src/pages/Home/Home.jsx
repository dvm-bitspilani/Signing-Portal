import { Link, useNavigate, useLoaderData } from "react-router-dom";
import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Calendar, Users, ChevronLeft } from "lucide-react";
import { apiBaseURL, merchBaseURL } from "../../global";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function Home() {
    const [eventList, setEventList] = useState(null);
    const [merchList, setMerchList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [merchLoading, setMerchLoading] = useState(true);
    const refreshToken = getRefreshToken();
    const accessToken = useLoaderData();
    const [emptyEventsMsg, setEmptyEventsMsg] = useState("Loading available events...");
    const [emptyMerchMsg, setEmptyMerchMsg] = useState("Loading available merch...");

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

    useEffect(() => {
        setMerchLoading(true);
        axios.get(`${merchBaseURL}/merch_list`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }).then((response) => {
            if (response.data.length === 0) {
                setEmptyMerchMsg("No merch available at this moment.");
            } else {
                setMerchList(response.data);
            }
            setMerchLoading(false);
        }).catch((errResponse) => {
            setEmptyMerchMsg("Something went wrong while fetching merch.");
            setMerchLoading(false);
            handleApiErrorToast(errResponse, "Failed to load merch. Please try again.");
            console.log(errResponse);
        });
    }, [accessToken]);

    const MerchCard = ({ merch }) => {
        const [currentImageIndex, setCurrentImageIndex] = useState(0);
        const images = merch.extra_images_url 
            ? [merch.front_image_url, ...merch.extra_images_url] 
            : [merch.front_image_url];

        const nextImage = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        };

        const prevImage = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        };

        return (
            <Card className="group hover:shadow-lg transition-all duration-300 border hover:scale-105 hover:border-primary/30">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading group-hover:text-primary transition-colors">
                            {merch.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                            Merch
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Image Carousel */}
                    <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                        <img 
                            src={images[currentImageIndex]} 
                            alt={merch.name}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <div className="group">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    onClick={nextImage}
                                >
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </Button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 w-1.5 rounded-full transition-all ${
                                                idx === currentImageIndex 
                                                    ? 'bg-white w-3' 
                                                    : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-caption">
                            <span className="font-semibold text-lg">{merch.price === 0 ? '-' : `₹${merch.price}`}</span>
                        </div>
                        <Button 
                            asChild 
                            className="font-medium transition-all duration-300 hover:scale-105"
                        >
                            <Link to={`/EventDetails/merch/${merch.id}`}>
                                View Details
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const EventCard = ({ event }) => (
        <Card className="group hover:shadow-lg transition-all duration-300 border hover:scale-105 hover:border-primary/30">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-subheading group-hover:text-primary transition-colors">
                        {event.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        Event
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
                        <Link to={`/EventDetails/non-comp/${event.id}`}>
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
                    {/* Show empty state only if both events and merch are empty and not loading */}
                    {!loading && !merchLoading && 
                     (!eventList || eventList.length === 0) && 
                     (!merchList || merchList.length === 0) ? (
                        <EmptyState message="No events or merch available at this moment." />
                    ) : (
                        <>
                            {/* Events Section - Only show if loading or has events */}
                            {(loading || (eventList && eventList.length > 0)) && (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <h1 className="text-heading-primary mb-4">
                                            Available Events
                                        </h1>
                                        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
                                            Browse our curated list of events. Select the ones that spark your interest.
                                        </p>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {[...Array(6)].map((_, i) => (
                                                <LoadingSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {eventList.map((event, index) => (
                                                <EventCard 
                                                    key={index} 
                                                    event={event} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Merch Section - Only show if loading or has merch */}
                            {(merchLoading || (merchList && merchList.length > 0)) && (
                                <div className={`space-y-6 ${(loading || (eventList && eventList.length > 0)) ? 'mt-12' : ''}`}>
                                    <div className="text-center">
                                        <h2 className="text-heading-secondary mb-2">
                                            Available Merch
                                        </h2>
                                        <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                                            Check out our exclusive merchandise collection
                                        </p>
                                    </div>
                                    {merchLoading ? (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {[...Array(3)].map((_, i) => (
                                                <LoadingSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {merchList.map((merch, index) => (
                                                <MerchCard 
                                                    key={index} 
                                                    merch={merch} 
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
