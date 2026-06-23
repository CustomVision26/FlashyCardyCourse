import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeck } from "@/db/queries/cards";
import { FlashcardStudy } from "./flashcard-study";

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = Number(deckId);
  if (isNaN(id)) notFound();

  const deck = await getDeckById(id, userId);
  if (!deck) notFound();

  const cards = await getCardsByDeck(id);
  if (cards.length === 0) redirect(`/decks/${id}`);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/decks/${id}`}
            className="text-muted-foreground hover:text-foreground truncate text-sm transition-colors"
          >
            ← Back to {deck.name}
          </Link>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Study Session</h1>
        </div>
        <Badge variant="secondary" className="w-fit shrink-0">
          {cards.length} card{cards.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <FlashcardStudy cards={cards} deckId={id} deckName={deck.name} />
    </div>
  );
}
