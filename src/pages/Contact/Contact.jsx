import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Phone } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { showSuccessToast, showErrorToast } from "../../assets/utils/toast";

const TEAM = [
  {
    id: 1,
    name: "Rishit Verma",
    email: "f20240606@pilani.bits-pilani.ac.in",
    phone: "+91-8448010846",
    avatar: "https://bits-dvm.org/assets/members/2024/backend/rishit.jpg",
    initials: "RV",
  },
  {
    id: 2,
    name: "Nishchay Choudhary",
    email: "f20240932@pilani.bits-pilani.ac.in",
    phone: "+91-8595488852",
    avatar: "https://bits-dvm.org/assets/members/2024/backend/nishchay.jpg",
    initials: "NC",
  },
  {
    id: 3,
    name: "Darsh Patel",
    email: "f20241338@pilani.bits-pilani.ac.in",
    phone: "+91-9879587515",
    avatar: "https://bits-dvm.org/assets/members/2024/backend/darsh.jpg",
    initials: "DP",
  },
  {
    id: 4,
    name: "Medhansh Khandelwal",
    email: "f20241009@pilani.bits-pilani.ac.in",
    phone: "+91-9871568877",
    avatar: "https://bits-dvm.org/assets/members/2024/backend/medhansh.jpg",
    initials: "MK",
  },
];

function ContactRow({ icon, href, value, onCopy, copyLabel }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-1">
      {/* The number itself is the tap target — on a phone this dials. */}
      <a
        href={href}
        className="numeral flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{value}</span>
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCopy}
        aria-label={`Copy ${copyLabel.toLowerCase()}`}
        className="shrink-0 text-muted-foreground"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

function Contact() {
  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${label} copied`);
    } catch {
      showErrorToast(`Couldn't copy the ${label.toLowerCase()}`);
    }
  };

  return (
    <Page width="narrow">
      <PageHeader title="Help" meta="DVM backend · 4 people" />

      <p className="mb-6 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Booking stuck, ticket missing, or a slot that won't open? Reach any of
        these four. Have your ticket ID from{" "}
        <span className="font-medium text-foreground">Your signings</span> ready
        — it's the fastest way to get it sorted.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {TEAM.map((member) => (
          <li
            key={member.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border border-border">
                <AvatarImage
                  src={member.avatar}
                  alt=""
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted text-sm font-semibold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold tracking-[-0.01em]">
                {member.name}
              </h2>
            </div>

            <div className="mt-3 space-y-0.5 border-t border-border pt-2">
              <ContactRow
                icon={Phone}
                href={`tel:${member.phone}`}
                value={member.phone}
                copyLabel="Phone number"
                onCopy={() => copy(member.phone, "Phone number")}
              />
              <ContactRow
                icon={Mail}
                href={`mailto:${member.email}`}
                value={member.email}
                copyLabel="Email"
                onCopy={() => copy(member.email, "Email")}
              />
            </div>
          </li>
        ))}
      </ul>
    </Page>
  );
}

export default Contact;
