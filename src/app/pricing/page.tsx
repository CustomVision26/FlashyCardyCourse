import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Start for free. Upgrade anytime to unlock AI-powered flashcard
            generation and unlimited decks.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
