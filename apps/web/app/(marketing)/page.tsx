import Link from "next/link";
import { ArrowRight, BarChart3, Globe, Heart, Palette, Sparkles, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";

const FEATURES = [
  {
    icon: Palette,
    title: "Make it yours",
    description:
      "Pick from 18 stunning themes or customize every color, font, and shape to match your brand.",
  },
  {
    icon: Zap,
    title: "One question at a time",
    description: "Guide people through your form step by step. Less overwhelming, more responses.",
  },
  {
    icon: BarChart3,
    title: "See what's working",
    description:
      "Know exactly how people respond. Spot trends, find drop-offs, and improve over time.",
  },
  {
    icon: Globe,
    title: "Share anywhere",
    description:
      "One click to publish. Drop the link in an email, post it on social, or print the QR code.",
  },
  {
    icon: Heart,
    title: "People actually enjoy it",
    description:
      "Beautiful design and smooth flow means more people finish your form — not abandon it.",
  },
  {
    icon: Sparkles,
    title: "No learning curve",
    description:
      "If you can drag and drop, you can build a form. No tutorials, no manuals, no headaches.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 border border-border/60 rounded-full px-3 py-1 text-xs text-muted-foreground mb-8">
            <Sparkles className="size-3" />
            Free to start — no credit card needed
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            The easiest way to
            <br />
            <span className="text-muted-foreground">ask the right questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Create beautiful forms in minutes. Share them with anyone. Get the answers you need —
            without the frustration.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild className="gap-2">
              <Link href="/signup">
                Create your first form
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/explore">See examples</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything a great form needs
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Whether you're collecting feedback, running a survey, or onboarding customers — FormHQ
            makes it simple.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border border-border/60 rounded-xl p-6 hover:border-border transition-colors"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 bg-muted/20 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              From idea to live form in 3 steps
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              No setup. No configuration. Just open FormHQ and start.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Build it",
                desc: "Add your questions, choose a look you love, and arrange everything exactly how you want.",
              },
              {
                step: "2",
                title: "Share it",
                desc: "Hit publish and send the link to anyone — via email, WhatsApp, social media, or a printed QR code.",
              },
              {
                step: "3",
                title: "Learn from it",
                desc: "See every response as it comes in. Understand your audience and make better decisions.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {step}
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Your audience deserves a better form
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Stop losing responses to ugly, confusing forms. Start with FormHQ today — it's free.
        </p>
        <Button size="lg" asChild className="gap-2">
          <Link href="/signup">
            Get started free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
