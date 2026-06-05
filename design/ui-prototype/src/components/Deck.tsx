import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Presentation,
  Route,
  Terminal,
} from "lucide-react";
import type { OutlineEntry, PrototypeState } from "../fixture";
import { deck, outline } from "../fixture";
import { outlineAt } from "../prototype-utils";
import { Badge, Button } from "../ui";

type DeckSurfaceProps = {
  readonly anchorIndex: number;
  readonly presenter: boolean;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function DeckSurface({
  anchorIndex,
  presenter,
  selectedSlide,
  state,
}: DeckSurfaceProps) {
  if (presenter) {
    return (
      <PresenterView
        anchorIndex={anchorIndex}
        selectedSlide={selectedSlide}
        state={state}
      />
    );
  }

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

type PresenterViewProps = {
  readonly anchorIndex: number;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function PresenterView({
  anchorIndex,
  selectedSlide,
  state,
}: PresenterViewProps) {
  const nextSlide = outlineAt(anchorIndex + 1);

  return (
    <section
      className="presenter-grid"
      aria-label="Presenter-view representation"
    >
      <div className="presenter-current">
        <DeckSlide selectedSlide={selectedSlide} state={state} />
      </div>
      <aside className="presenter-side">
        <div className="presenter-card next-card">
          <Badge tone="neutral">
            <ArrowRight size={12} />
            Next
          </Badge>
          <h2>{nextSlide.title}</h2>
          <p>{nextSlide.summary}</p>
        </div>
        <div className="presenter-card notes-card">
          <Badge tone="checking">
            <Presentation size={12} />
            Presenter metadata
          </Badge>
          <p>
            Notes are hidden in normal player view. This route represents the
            explicit presenter affordance only; browser multi-screen placement
            remains Stage A research.
          </p>
        </div>
        <div className="presenter-metrics">
          <span>
            <Clock size={15} />
            08:42
          </span>
          <span>
            <Route size={15} />
            {anchorIndex + 1}/{outline.length}
          </span>
        </div>
      </aside>
    </section>
  );
}
