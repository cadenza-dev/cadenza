import { AlertTriangle, Terminal } from "lucide-react";
import type { OutlineEntry, PrototypeState } from "../fixture";
import { deck } from "../fixture";
import { Badge, Button } from "../ui";

type DeckSurfaceProps = {
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function DeckSurface({ selectedSlide, state }: DeckSurfaceProps) {
  return (
    <section className="deck-zone" aria-label="Deck playback surface">
      <DeckSlide selectedSlide={selectedSlide} state={state} />
    </section>
  );
}

type DeckSlideProps = {
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function DeckSlide({ selectedSlide, state }: DeckSlideProps) {
  return (
    <div className="deck-frame">
      <article
        aria-label={`Deck slide ${selectedSlide.title}`}
        className="deck-slide"
      >
        <div className="slide-topline">
          <span>{deck.deckId}</span>
          <Badge tone={state.accent}>{state.health}</Badge>
        </div>
        <h1>{selectedSlide.title}</h1>
        <p>{selectedSlide.summary}</p>
        <div className="slide-evidence-strip">
          <span>Chapter {selectedSlide.chapterId}</span>
          <span>
            Anchor {selectedSlide.segment[0]}-{selectedSlide.segment[1]}
          </span>
          <span>{selectedSlide.purpose}</span>
        </div>
      </article>
    </div>
  );
}

type BlockingBannerProps = {
  readonly diagnostic: PrototypeState["diagnostics"][number];
  readonly onOpenDiagnostics: () => void;
};

export function BlockingBanner({
  diagnostic,
  onOpenDiagnostics,
}: BlockingBannerProps) {
  return (
    <div className="blocking-banner" role="alert">
      <AlertTriangle size={17} />
      <div>
        <strong>{diagnostic.code}</strong>
        <span>{diagnostic.message}</span>
      </div>
      <Button onClick={onOpenDiagnostics} size="xs" variant="destructive">
        <Terminal size={14} />
        Diagnostics
      </Button>
    </div>
  );
}
