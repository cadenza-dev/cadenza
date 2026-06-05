import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock,
  Copy,
  FileJson,
  Info,
  Presentation,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import type { OutlineEntry, PrototypeState, Topic } from "../fixture";
import { deck, outline, topics } from "../fixture";
import { topicIcons } from "../topic-icons";
import type { CopyText, InspectorSide } from "../types";
import { Badge, Button, cn, IconButton, ResizablePanel, Section } from "../ui";

type RailPanelProps = {
  readonly children: ReactNode;
  readonly contentOpen?: boolean;
  readonly defaultSize: number;
  readonly isOpen: boolean;
  readonly kind: "inspector" | "slides";
  readonly onSizeChange: (size: number) => void;
};

export function RailPanel({
  children,
  contentOpen = true,
  defaultSize,
  isOpen,
  kind,
  onSizeChange,
}: RailPanelProps) {
  const inspectorCollapsed = kind === "inspector" && !contentOpen;
  const minSize = kind === "inspector" ? 20 : 14;
  const maxSize = kind === "inspector" ? 34 : 25;
  const expandedSize = Math.max(minSize, Math.min(maxSize, defaultSize));

  if (!isOpen) return null;

  return (
    <ResizablePanel
      className={cn(
        "rail-panel",
        `rail-panel-${kind}`,
        inspectorCollapsed && "rail-panel-collapsed",
      )}
      defaultSize={inspectorCollapsed ? "42px" : `${expandedSize}%`}
      maxSize={inspectorCollapsed ? "42px" : `${maxSize}%`}
      minSize={inspectorCollapsed ? "42px" : `${minSize}%`}
      key={`${kind}-${inspectorCollapsed ? "collapsed" : "expanded"}`}
      groupResizeBehavior={
        inspectorCollapsed ? "preserve-pixel-size" : undefined
      }
      disabled={inspectorCollapsed}
      onResize={(panelSize) => {
        if (!inspectorCollapsed) {
          onSizeChange(
            Math.max(minSize, Math.min(maxSize, panelSize.asPercentage)),
          );
        }
      }}
      style={
        inspectorCollapsed
          ? {
              flexBasis: "42px",
              flexGrow: 0,
              flexShrink: 0,
              maxWidth: "42px",
              minWidth: "42px",
              width: "42px",
            }
          : undefined
      }
    >
      {children}
    </ResizablePanel>
  );
}

type SlideRailProps = {
  readonly currentSlideId: string;
  readonly onSelect: (index: number) => void;
};

export function SlideRail({ currentSlideId, onSelect }: SlideRailProps) {
  return (
    <aside className="slide-rail" aria-label="Static slide preview rail">
      <div className="rail-header">
        <div>
          <h2>Slides</h2>
          <p>{outline.length} action anchors</p>
        </div>
        <Badge tone="neutral">
          <Route size={12} />
          step/action
        </Badge>
      </div>
      <div className="thumbnail-list">
        {outline.map((slide, index) => (
          <button
            aria-current={currentSlideId === slide.slideId ? "step" : undefined}
            className={cn(
              "thumbnail",
              currentSlideId === slide.slideId && "active",
            )}
            data-anchor-index={index}
            key={slide.slideId}
            onClick={() => onSelect(index)}
            type="button"
          >
            <span className="thumb-number">{index + 1}</span>
            <span className="thumb-frame">
              <span className="thumb-title">{slide.title}</span>
              <span className="thumb-summary">{slide.summary}</span>
              <span className="thumb-segment">
                {slide.segment[0]}-{slide.segment[1]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

type InspectorRailProps = {
  readonly activeTopic: Topic;
  readonly copyText: CopyText;
  readonly onAnchor: (index: number) => void;
  readonly onOpenChange: (value: (current: boolean) => boolean) => void;
  readonly onTopic: (topic: Topic) => void;
  readonly open: boolean;
  readonly side: InspectorSide;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function InspectorRail({
  activeTopic,
  copyText,
  onAnchor,
  onOpenChange,
  onTopic,
  open,
  side,
  selectedSlide,
  state,
}: InspectorRailProps) {
  const tooltipSide = side === "left" ? "right" : "left";

  return (
    <aside
      className={cn(
        "inspector-rail",
        `inspector-rail-${side}`,
        !open && "inspector-rail-collapsed",
      )}
      aria-label="Read-only inspector rail"
    >
      <nav className="activity-bar" aria-label="Inspector topics">
        {topics.map((topic) => {
          const Icon = topicIcons[topic];
          const active = open && activeTopic === topic;
          return (
            <IconButton
              aria-current={active ? "page" : undefined}
              aria-pressed={active}
              className={cn("activity-button", active && "active")}
              key={topic}
              label={active && open ? `Collapse ${topic}` : `Open ${topic}`}
              onClick={() => {
                if (active) onOpenChange((value) => !value);
                else {
                  onTopic(topic);
                  onOpenChange(() => true);
                }
              }}
              tooltipSide={tooltipSide}
              variant={active ? "primary" : "ghost"}
            >
              <Icon size={17} />
            </IconButton>
          );
        })}
      </nav>
      {open && (
        <div className="inspector-pane">
          <div className="inspector-title-row">
            <div>
              <h2>{activeTopic}</h2>
              <p>
                Read-only inspection; no editor, repair, or re-export surface.
              </p>
            </div>
            <IconButton
              label={`Collapse ${activeTopic}`}
              onClick={() => onOpenChange(() => false)}
              tooltipSide={side === "left" ? "right" : "left"}
              variant="ghost"
            >
              {side === "left" ? (
                <ChevronLeft size={17} />
              ) : (
                <ChevronRight size={17} />
              )}
            </IconButton>
          </div>
          <InspectorContent
            activeTopic={activeTopic}
            copyText={copyText}
            onAnchor={onAnchor}
            selectedSlide={selectedSlide}
            state={state}
          />
        </div>
      )}
    </aside>
  );
}

type InspectorContentProps = {
  readonly activeTopic: Topic;
  readonly copyText: CopyText;
  readonly onAnchor: (index: number) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function InspectorContent({
  activeTopic,
  copyText,
  onAnchor,
  selectedSlide,
  state,
}: InspectorContentProps) {
  return (
    <div className="section-stack">
      <Section defaultOpen id="summary" title="Summary">
        <div className="summary-grid">
          <Info size={16} />
          <div>
            <strong>{selectedSlide.title}</strong>
            <p>{state.description}</p>
          </div>
        </div>
        <dl className="key-value-grid">
          <div>
            <dt>Deck</dt>
            <dd>{deck.deckId}</dd>
          </div>
          <div>
            <dt>Anchor</dt>
            <dd>
              {selectedSlide.segment[0]}-{selectedSlide.segment[1]}
            </dd>
          </div>
          <div>
            <dt>Diagnostics</dt>
            <dd>{state.diagnostics.length}</dd>
          </div>
          <div>
            <dt>Limitations</dt>
            <dd>{state.limitations.length}</dd>
          </div>
        </dl>
      </Section>

      {activeTopic === "Outline" && (
        <>
          <Section defaultOpen id="outline" title="Outline">
            <OutlineList
              currentSlideId={selectedSlide.slideId}
              onAnchor={onAnchor}
            />
          </Section>
          <Section id="timeline" title="Timeline">
            <TimelineList
              currentSlideId={selectedSlide.slideId}
              onAnchor={onAnchor}
            />
          </Section>
        </>
      )}

      {activeTopic === "Readiness" && (
        <>
          <Section defaultOpen id="readiness" title="Readiness">
            <ReadinessList state={state} />
          </Section>
          <Section id="readiness-diagnostics" title="Diagnostics">
            <DiagnosticsList copyText={copyText} state={state} />
          </Section>
        </>
      )}

      {activeTopic === "Diagnostics" && (
        <>
          <Section
            defaultOpen
            id="diagnostics"
            meta={`${state.diagnostics.length} items`}
            title="Diagnostics"
          >
            <DiagnosticsList copyText={copyText} state={state} />
          </Section>
          <Section id="diagnostic-limitations" title="Limitations">
            <LimitationsList state={state} />
          </Section>
        </>
      )}

      {activeTopic === "Provenance" && (
        <>
          <Section
            defaultOpen
            id="format-capabilities"
            title="Format Capabilities"
          >
            <FormatCapabilities state={state} />
          </Section>
          <Section defaultOpen id="evidence-files" title="Evidence Files">
            <EvidenceFiles copyText={copyText} state={state} />
          </Section>
          <Section id="selector-provenance" title="Selector Provenance">
            <SelectorProvenance copyText={copyText} state={state} />
          </Section>
          <Section id="raw-details" title="Raw Details">
            <RawDetailsCopy copyText={copyText} state={state} />
          </Section>
        </>
      )}

      {activeTopic === "Notes" && (
        <>
          <Section defaultOpen id="notes-boundary" title="Notes Boundary">
            <div className="notice-card">
              <Presentation size={16} />
              <p>
                Normal player view hides speaker notes. Notes appear only
                through explicit presenter metadata affordances.
              </p>
            </div>
          </Section>
          <Section id="speaker-notes" title="Presenter Notes">
            <p>
              Suggested speaker cue: connect local export proof to the
              maintainer-approved alpha boundary without implying hosted
              release.
            </p>
          </Section>
        </>
      )}

      {activeTopic === "Limitations" && (
        <>
          <Section defaultOpen id="limitations" title="Limitations">
            <LimitationsList state={state} />
          </Section>
          <Section id="limitation-provenance" title="Provenance">
            <EvidenceFiles copyText={copyText} state={state} />
          </Section>
        </>
      )}
    </div>
  );
}

type AnchorListProps = {
  readonly currentSlideId: string;
  readonly onAnchor: (index: number) => void;
};

function OutlineList({ currentSlideId, onAnchor }: AnchorListProps) {
  return (
    <div className="outline-list">
      {outline.map((slide, index) => (
        <button
          className={cn(
            "outline-row",
            currentSlideId === slide.slideId && "active",
          )}
          key={slide.slideId}
          onClick={() => onAnchor(index)}
          type="button"
        >
          <BookOpen size={15} />
          <span>
            <strong>{slide.title}</strong>
            <small>{slide.chapterId}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function TimelineList({ currentSlideId, onAnchor }: AnchorListProps) {
  return (
    <ol className="timeline-list">
      {outline.map((slide, index) => (
        <li key={slide.slideId}>
          <button
            className={cn(
              "timeline-row",
              currentSlideId === slide.slideId && "active",
            )}
            onClick={() => onAnchor(index)}
            type="button"
          >
            <CircleMarker active={currentSlideId === slide.slideId} />
            <span>
              {slide.segment[0]}-{slide.segment[1]}
            </span>
            <strong>{slide.title}</strong>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CircleMarker({ active }: { readonly active: boolean }) {
  return <span className={cn("circle-marker", active && "active")} />;
}

function ReadinessList({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="readiness-list">
      {state.readiness.map((item) => (
        <div className="readiness-row" key={`${item.source}-${item.label}`}>
          <StatusGlyph tone={item.status} />
          <span>
            <strong>{item.label}</strong>
            <small>{item.source}</small>
          </span>
          <Badge tone={readinessTone(item.status)}>{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function readinessTone(status: PrototypeState["readiness"][number]["status"]) {
  if (status === "blocked") return "blocked";
  if (status === "ready") return "ready";
  if (status === "limited") return "warning";
  return "checking";
}

function StatusGlyph({ tone }: { readonly tone: string }) {
  if (tone === "blocked") return <AlertTriangle size={16} />;
  if (tone === "ready") return <BadgeCheck size={16} />;
  if (tone === "checking" || tone === "pending") return <Clock size={16} />;
  return <Info size={16} />;
}

type DiagnosticsListProps = {
  readonly copyText: CopyText;
  readonly state: PrototypeState;
};

function DiagnosticsList({ copyText, state }: DiagnosticsListProps) {
  if (state.diagnostics.length === 0) {
    return (
      <div className="empty-state">
        <ShieldCheck size={18} />
        <p>No diagnostics for this fixture state.</p>
      </div>
    );
  }

  return (
    <div className="diagnostics-list">
      {state.diagnostics.map((diagnostic) => (
        <article className="diagnostic-card" key={diagnostic.code}>
          <div className="diagnostic-header">
            <Badge tone={diagnostic.severity}>{diagnostic.severity}</Badge>
            <code>{diagnostic.code}</code>
          </div>
          <p>{diagnostic.message}</p>
          <dl>
            <div>
              <dt>Evidence locator</dt>
              <dd>{diagnostic.locator}</dd>
            </div>
            <div>
              <dt>Repair hint</dt>
              <dd>{diagnostic.hint}</dd>
            </div>
          </dl>
          <div className="inline-actions">
            <Button
              onClick={() => copyText(diagnostic.code, "Diagnostic code")}
              size="xs"
              variant="outline"
            >
              <Copy size={13} />
              Code
            </Button>
            <Button
              onClick={() => copyText(diagnostic.locator, "Locator")}
              size="xs"
              variant="outline"
            >
              <Copy size={13} />
              Locator
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function FormatCapabilities({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="capability-list">
      {state.provenance.formatCapabilities.map((capability) => (
        <article className="capability-card" key={capability.format}>
          <Badge tone={capability.status === "supported" ? "ready" : "warning"}>
            {capability.format}
          </Badge>
          <p>{capability.description}</p>
        </article>
      ))}
    </div>
  );
}

function EvidenceFiles({ copyText, state }: DiagnosticsListProps) {
  return (
    <div className="artifact-list">
      <div className="artifact-card">
        <Boxes size={16} />
        <span>
          <strong>{state.provenance.manifestPath}</strong>
          <small>{state.provenance.outputDirectory}</small>
        </span>
        <Button
          onClick={() =>
            copyText(state.provenance.manifestPath, "Manifest path")
          }
          size="xs"
          variant="outline"
        >
          <Copy size={13} />
          Path
        </Button>
      </div>
      {state.provenance.artifacts.map((artifact) => (
        <div
          className="artifact-card"
          key={`${artifact.role}-${artifact.path}`}
        >
          <FileJson size={16} />
          <span>
            <strong>{artifact.path}</strong>
            <small>
              {artifact.role} · {artifact.byteSize} bytes · {artifact.sha256}
            </small>
          </span>
          <Badge tone="neutral">{artifact.format}</Badge>
        </div>
      ))}
    </div>
  );
}

function SelectorProvenance({ copyText, state }: DiagnosticsListProps) {
  return (
    <dl className="selector-grid">
      {Object.entries(state.provenance.selector).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>
            <span>{value}</span>
            <Button
              onClick={() => copyText(value, `${key} value`)}
              size="xs"
              variant="ghost"
            >
              <Copy size={13} />
            </Button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RawDetailsCopy({ copyText, state }: DiagnosticsListProps) {
  return (
    <Button
      className="raw-copy-action"
      onClick={() =>
        copyText(
          JSON.stringify(state.provenance, null, 2),
          "Raw provenance details",
        )
      }
      variant="outline"
    >
      <Clipboard size={18} />
      <span>Copy to the Clipboard</span>
    </Button>
  );
}

function LimitationsList({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="limitation-list">
      {state.limitations.map((limitation) => (
        <article
          className="limitation-card"
          key={`${limitation.affected}-${limitation.copy}`}
        >
          <Badge
            tone={
              limitation.severity === "blocked"
                ? "blocked"
                : limitation.severity === "warning"
                  ? "warning"
                  : "neutral"
            }
          >
            {limitation.severity}
          </Badge>
          <span>
            <strong>{limitation.affected}</strong>
            <p>{limitation.copy}</p>
          </span>
        </article>
      ))}
    </div>
  );
}
