import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and trying things out.",
    cta: "Get started",
    ctaHref: "/signup",
    highlight: false,
    features: [
      "3 forms",
      "100 responses / month",
      "All field types",
      "5 themes",
      "QR code sharing",
      "CSV export",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For individuals and small teams who need more power.",
    cta: "Start free trial",
    ctaHref: "/signup",
    highlight: true,
    badge: "Most popular",
    features: [
      "Unlimited forms",
      "Unlimited responses",
      "All field types",
      "All 18 themes",
      "Custom branding",
      "QR code sharing",
      "CSV export",
      "Analytics dashboard",
      "Response notifications",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$39",
    period: "per month",
    description: "For growing teams that need collaboration and control.",
    cta: "Start free trial",
    ctaHref: "/signup",
    highlight: false,
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared form library",
      "Team analytics",
      "API access",
      "Custom domain",
      "SSO / SAML",
      "Dedicated support",
    ],
  },
];

const COMPARISON = [
  { feature: "Forms", free: "3", pro: "Unlimited", team: "Unlimited" },
  { feature: "Responses / month", free: "100", pro: "Unlimited", team: "Unlimited" },
  { feature: "All field types", free: true, pro: true, team: true },
  { feature: "Themes", free: "5", pro: "All 18", team: "All 18" },
  { feature: "Custom branding", free: false, pro: true, team: true },
  { feature: "Analytics dashboard", free: false, pro: true, team: true },
  { feature: "CSV export", free: true, pro: true, team: true },
  { feature: "Response notifications", free: false, pro: true, team: true },
  { feature: "API access", free: false, pro: false, team: true },
  { feature: "Custom domain", free: false, pro: false, team: true },
  { feature: "Team members", free: "1", pro: "1", team: "5" },
  { feature: "SSO / SAML", free: false, pro: false, team: true },
  { feature: "Priority support", free: false, pro: true, team: true },
  { feature: "Dedicated support", free: false, pro: false, team: true },
];

const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and we prorate any billing differences.",
  },
  {
    q: "What happens when I hit the response limit on Free?",
    a: "Your form stays live but stops accepting new responses until the next month. You can upgrade to Pro at any time to remove the limit.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes — both Pro and Team come with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "Yes. Reach out to us and we'll sort you out with a discount.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. Annual billing is also available at a 20% discount.",
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="size-4 text-primary mx-auto" />;
  if (value === false) return <Minus className="size-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Start free. Upgrade when you need more. No hidden fees, no surprises.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col gap-6",
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/60",
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                className="w-full gap-2"
              >
                <Link href={plan.ctaHref}>
                  {plan.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="size-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 bg-muted/20 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-10 text-center">Compare plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-3 pr-6 font-medium text-muted-foreground w-1/2">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.name}
                      className={cn(
                        "py-3 px-4 font-semibold text-center",
                        p.highlight && "text-primary",
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn("border-b border-border/40", i % 2 === 0 && "bg-muted/20")}
                  >
                    <td className="py-3 pr-6 text-muted-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.pro} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.team} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold tracking-tight mb-10 text-center">
          Frequently asked questions
        </h2>
        <div className="flex flex-col divide-y divide-border/50">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="py-5">
              <p className="font-medium mb-2">{q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 bg-muted/20 py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Still not sure?</h2>
          <p className="text-muted-foreground mb-8">
            Start with the free plan — no credit card, no commitment. Upgrade whenever you&apos;re
            ready.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/signup">
              Try FormHQ for free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
