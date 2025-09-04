import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Users,
  Mail,
  Phone,
  Copy
} from "lucide-react";
import Navbar from "../ComComponent/Navbar/Navbar";
import { showSuccessToast, showErrorToast } from "../../assets/utils/toast";

function Contact() {
  const teamMembers = [
    {
      id: 1,
      name: "Rishit Verma",
      role: "DVM Backend Developer",
      email: "f20240606@pilani.bits-pilani.ac.in",
      phone: "+91-8448010846",
      avatar: "https://bits-dvm.org/assets/members/2024/backend/rishit.jpg",
      initials: "RV"
    },
    {
      id: 2,
      name: "Nishchay Choudhary",
      role: "DVM Backend Developer",
      email: "f20240932@pilani.bits-pilani.ac.in",
      phone: "+91-8595488852",
      avatar: "https://bits-dvm.org/assets/members/2024/backend/nishchay.jpg",
      initials: "NC"
    },
    {
      id: 3,
      name: "Darsh Patel",
      role: "DVM Backend Developer",
      email: "f20241338@pilani.bits-pilani.ac.in",
      phone: "+91-9879587515",
      avatar: "https://bits-dvm.org/assets/members/2024/backend/darsh.jpg",
      initials: "DP"
    },
    {
      id: 4,
      name: "Medhansh Khandelwal",
      role: "DVM Backend Developer",
      email: "f20241009@pilani.bits-pilani.ac.in",
      phone: "+91-9871568877",
      avatar: "https://bits-dvm.org/assets/members/2024/backend/medhansh.jpg",
      initials: "MK"
    }
  ];

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${type} copied to clipboard!`);
    } catch (error) {
      showErrorToast(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const TeamCard = ({ member }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/30">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto">
          <Avatar className="h-20 w-20 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage 
              src={member.avatar} 
              alt={member.name}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="text-lg font-semibold bg-primary/20 text-primary">
              {member.initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-subheading group-hover:text-primary transition-colors">
            {member.name}
          </CardTitle>
          <CardDescription className="text-body-small">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              <Code className="h-3 w-3 mr-1" />
              {member.role}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a 
                href={`mailto:${member.email}`}
                className="text-caption text-muted-foreground hover:text-primary transition-colors truncate"
              >
                {member.email}
              </a>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(member.email, "Email")}
              className="h-6 w-6 p-0 hover:bg-primary/10 flex-shrink-0 ml-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <a 
                href={`tel:${member.phone}`}
                className="text-caption text-muted-foreground hover:text-primary transition-colors"
              >
                {member.phone}
              </a>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(member.phone, "Phone")}
              className="h-6 w-6 p-0 hover:bg-primary/10 flex-shrink-0 ml-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-heading-primary mb-4 flex items-center justify-center gap-3">
              <Users className="h-10 w-10 text-primary" />
              Meet Our Team
            </h1>
            <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
              Our dedicated backend development team behind the Signings Portal.
            </p>
          </div>

          {/* Team Section */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;