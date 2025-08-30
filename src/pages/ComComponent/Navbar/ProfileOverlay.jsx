import { React } from "react";
import { AppContext } from "../../../App";
import SignInContext from "../../../assets/store/SignInContext";
import { useRouteLoaderData, useSubmit } from "react-router-dom";
import { getUserDetails } from "../../../assets/utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

export default function ProfileOverlay({children, className}) {
  const submit = useSubmit();
  // const { globalAppStates, setGlobalAppStates } = useContext(AppContext);
  // console.log(globalAppStates);
  
  const token = useRouteLoaderData("root");
  const {username, profilePicURL} = getUserDetails();

  function signOut() {
    // setGlobalAppStates({ credentials: null });
    submit({ token }, { method: "post", action: "/logout" });
    // googleLogout(); // Uncomment if using Google OAuth
  }

  return (
    <Card className={`${className} w-72`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profilePicURL || "/default-profile.png"} alt={username} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <h2 className="text-lg font-semibold">
              {username || "Guest"}
            </h2>
          </div>
          
          {children}
          
          <Button 
            variant="outline" 
            onClick={signOut}
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
