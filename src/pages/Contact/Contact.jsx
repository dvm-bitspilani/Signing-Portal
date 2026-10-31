import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Phone } from "lucide-react";
import { Page, PageHeader } from "@/components/Page";
import { showSuccessToast, showErrorToast } from "../../assets/utils/toast";

const CRC_EMAIL = "crc@pilani.bits-pilani.ac.in";

const TEAM = [
  {
    id: 1,
    name: "Abhiraj Pharate",
    email: "f20250983@pilani.bits-pilani.ac.in",
    phone: "+91-9075011100",
    avatar: "",
    initials: "AP",
  },
  {
    id: 2,
    name: "Akshat Ranjan",
    email: "f20250615@pilani.bits-pilani.ac.in",
    phone: "+91-9711915427",
    avatar: "",
    initials: "AR",
  },
  {
    id: 3,
    name: "Ishan Kumar",
    email: "f20251194@pilani.bits-pilani.ac.in",
    phone: "+91-7678371888",
    avatar: "",
    initials: "IK",
  },
  {
    id: 4,
    name: "Raghav Halan",
    email: "f20250606@pilani.bits-pilani.ac.in",
    phone: "+91-9518316290",
    avatar: "",
    initials: "RH",
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
      <PageHeader title="Help" meta="CRC · DVM backend" />

      <section className="mb-10">
        <h2 className="mb-2 text-[0.9375rem] font-semibold tracking-[-0.01em]">
          Merch and ticket cancellations
        </h2>
        <p className="mb-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Questions about merch or cancelling a ticket? Email the CRC.
        </p>
        <div className="rounded-xl border border-border bg-card p-2 sm:max-w-sm">
          <ContactRow
            icon={Mail}
            href={`mailto:${CRC_EMAIL}`}
            value={CRC_EMAIL}
            copyLabel="Email"
            onCopy={() => copy(CRC_EMAIL, "Email")}
          />
        </div>
      </section>

      <h2 className="mb-2 text-[0.9375rem] font-semibold tracking-[-0.01em]">
        Technical difficulties
      </h2>
      <p className="mb-6 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Booking stuck or ticket missing? Reach out to any of us below with your
        ticket ID from{" "}
        <span className="font-medium text-foreground">Your signings</span>.
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
              <h3 className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold tracking-[-0.01em]">
                {member.name}
              </h3>
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
