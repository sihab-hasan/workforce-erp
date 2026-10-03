import { useState } from "react";
import { Building2, ChevronDown, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Container } from "#layouts/Container";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { cn } from "@workforce-erp/ui/lib/utils";

/* ─── Hero ─── */
export function ContactHeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70 bg-gradient-to-b from-background via-background to-muted/20 py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/25 via-emerald-500/20 to-sky-500/20 blur-3xl opacity-30"
      />
      <Container className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <MessageSquare className="size-3.5" />
          Get in Touch
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          We're Here to Help
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Have questions about pricing, implementation, or technical capabilities? Our enterprise
          team is ready to guide you.
        </p>
      </Container>
    </section>
  );
}

/* ─── Contact Form ─── */
export function ContactFormSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/10 border-b border-border/60">
      <Container>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Contact Platform Administration
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Reach out directly to the Workforce ERP core platform administrators. Whether you need
              a personalized demo, want to discuss enterprise pricing, or have technical questions
              about the system, our core team is here to help.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Platform Admins</h3>
                  <p className="text-sm text-muted-foreground">admin@workforce-erp.com</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Phone Support</h3>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Headquarters</h3>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
            {success ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <MessageSquare className="size-8" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">Form Submitted!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you for reaching out. A member of our team will get back to you shortly.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSuccess(false)}>
                  Submit Another Form
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" required placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" required placeholder="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    required
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─── Office Locations ─── */
const offices = [
  {
    city: "San Francisco",
    address: "100 Market St, Suite 300\nSan Francisco, CA 94105",
    country: "United States",
  },
  { city: "London", address: "25 Old Broad St\nLondon EC2N 1HQ", country: "United Kingdom" },
  {
    city: "Singapore",
    address: "8 Marina View\nAsia Square Tower 1\nSingapore 018960",
    country: "Singapore",
  },
];

export function OfficeLocationsSection() {
  return (
    <section className="py-20 lg:py-28 border-b border-border/60">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Global Offices
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            We operate worldwide to support our global enterprise clients.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {offices.map((office) => (
            <div
              key={office.city}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{office.city}</h3>
              <p className="text-xs font-semibold text-primary">{office.country}</p>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {office.address}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  {
    q: "What is your typical response time?",
    a: "For sales inquiries, we typically respond within 24 hours. Enterprise support customers have guaranteed SLAs based on their contract tier.",
  },
  {
    q: "Can I get a technical demo?",
    a: "Yes. When you submit the contact form, please mention that you'd like a technical deep-dive. We will schedule a session with a solutions engineer.",
  },
  {
    q: "Do you offer partner programs?",
    a: "Yes, we work with select integration and implementation partners. Please select 'Partnership Inquiry' in the message if you are interested.",
  },
];

export function ContactFaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 lg:py-28 bg-muted/10">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Contact FAQ
          </h2>
        </div>
        <div className="mx-auto mt-14 max-w-3xl divide-y divide-border rounded-2xl border border-border shadow-sm bg-card">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-foreground transition hover:bg-muted/30"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    open === i && "rotate-180",
                  )}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function DemoRequestFormSection() {
  return null;
}
export function WhatToExpectSection() {
  return null;
}
