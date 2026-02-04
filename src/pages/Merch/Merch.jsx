import { Link, useNavigate, useLoaderData } from "react-router-dom";
import Navbar from "../ComComponent/Navbar/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Package } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Merch() {
    const [merchList, setMerchList] = useState(null);
    const [merchLoading, setMerchLoading] = useState(true);
    const refreshToken = getRefreshToken();
    const accessToken = useLoaderData();
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

    const MerchCard = ({ merch, index }) => {
        const [currentImageIndex, setCurrentImageIndex] = useState(0);
        const [imageLoaded, setImageLoaded] = useState(false);
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
            <Card 
                className={cn(
                    "group overflow-hidden border-0 bg-card shadow-sm",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-xl hover:-translate-y-1",
                    "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {/* Loading placeholder */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-muted to-muted-foreground/10" />
                    )}
                    
                    <img 
                        src={images[currentImageIndex]} 
                        alt={merch.name}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            "group-hover:scale-105",
                            imageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badge */}
                    {merch.is_customisable && (
                        <Badge 
                            variant="secondary" 
                            className="absolute top-3 left-3 bg-warning/90 text-warning-foreground border-0 gap-1"
                        >
                            <Sparkles className="h-3 w-3" />
                            Customizable
                        </Badge>
                    )}
                    
                    {/* Image Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className={cn(
                                    "absolute left-2 top-1/2 -translate-y-1/2",
                                    "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
                                    "flex items-center justify-center",
                                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                                    "hover:bg-background hover:scale-110",
                                    "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                                )}
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={nextImage}
                                className={cn(
                                    "absolute right-2 top-1/2 -translate-y-1/2",
                                    "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
                                    "flex items-center justify-center",
                                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                                    "hover:bg-background hover:scale-110",
                                    "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                                )}
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            
                            {/* Image indicators */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-200",
                                            idx === currentImageIndex 
                                                ? 'bg-white w-4' 
                                                : 'bg-white/50 w-1.5 hover:bg-white/75'
                                        )}
                                        aria-label={`View image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                
                {/* Content Section */}
                <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {merch.name}
                        </h3>
                        {merch.sizes && merch.sizes.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {merch.sizes.join(' • ')}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold tracking-tight">
                                {merch.price === 0 ? 'Free' : `₹${merch.price}`}
                            </span>
                            {merch.is_customisable && merch.customisation_price > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    +₹{merch.customisation_price} custom
                                </span>
                            )}
                        </div>
                        <Button 
                            asChild 
                            size="sm"
                            className="gap-1.5"
                        >
                            <Link to={`/EventDetails/merch/${merch.id}`}>
                                View
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const LoadingSkeleton = () => (
        <Card className="overflow-hidden border-0">
            <div className="aspect-square">
                <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </CardContent>
        </Card>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="rounded-2xl bg-muted/50 p-6 mb-6">
                <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No merchandise available</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                {emptyMerchMsg}
            </p>
            <Button asChild variant="outline">
                <Link to="/events">Browse Events Instead</Link>
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
                                <ShoppingBag className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Merchandise
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Explore our exclusive collection of fest merchandise
                        </p>
                    </header>
                    
                    {/* Grid */}
                    {merchLoading ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[...Array(8)].map((_, i) => (
                                <LoadingSkeleton key={i} />
                            ))}
                        </div>
                    ) : merchList && merchList.length > 0 ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {merchList.map((merch, index) => (
                                <MerchCard 
                                    key={merch.id || index} 
                                    merch={merch}
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

export default Merch;
