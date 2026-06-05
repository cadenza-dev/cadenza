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
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OutlineEntry, PrototypeState, Topic } from "../fixture";
import { deck, outline, topics } from "../fixture";
import { topicIcons } from "../topic-icons";
import type { CopyText, InspectorSide } from "../types";
import { Badge, Button, cn, IconButton, Section } from "../ui";

type RailPanelProps = {
  readonly children: ReactNode;
  readonly contentOpen?: boolean;
  readonly isOpen: boolean;
  readonly kind: "inspector" | "slides";
  readonly width: number;
};

export function RailPanel({
  children,
  contentOpen = true,
  isOpen,
  kind,
  width,
}: RailPanelProps) {
  const inspectorCollapsed = kind === "inspector" && !contentOpen;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "rail-panel",
        `rail-panel-${kind}`,
        inspectorCollapsed && "rail-panel-collapsed",
      )}
      style={{ width: `${width}px` }}
    >
      {children}
    </div>
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
  readonly mode?: "desktop" | "mobile";
  readonly onAnchor: (index: number) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

type InspectorSectionSpec = {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly defaultSize: number;
  readonly id: string;
  readonly maxSize?: number;
  readonly meta?: string;
  readonly minSize: number;
  readonly title: string;
};

const SECTION_HEADER_SIZE = 38;
const SECTION_HANDLE_SIZE = 10;
const SECTION_ANIMATION_DURATION_MS = 170;
const SECTION_LAYOUT_STORAGE_PREFIX =
  "cadenza.uiPrototype.inspectorSectionLayout.v3";

type InspectorSectionLayoutState = {
  readonly expandedSections: Record<string, boolean>;
  readonly sectionSizes: Record<string, number>;
};

type InspectorSectionLayoutUpdater = (
  updater: (
    current: InspectorSectionLayoutState,
  ) => InspectorSectionLayoutState,
) => void;

export function InspectorContent({
  activeTopic,
  copyText,
  mode = "desktop",
  onAnchor,
  selectedSlide,
  state,
}: InspectorContentProps) {
  const sections = createInspectorSections({
    activeTopic,
    copyText,
    onAnchor,
    selectedSlide,
    state,
  });
  const storageKey = `${SECTION_LAYOUT_STORAGE_PREFIX}.${activeTopic}`;
  const [sectionLayouts, setSectionLayouts] = useState<
    Record<string, InspectorSectionLayoutState>
  >({});
  const layoutState = useMemo(
    () =>
      normalizeSectionLayout(sectionLayouts[activeTopic], storageKey, sections),
    [activeTopic, sectionLayouts, sections, storageKey],
  );
  const updateLayoutState = useCallback<InspectorSectionLayoutUpdater>(
    (updater) => {
      setSectionLayouts((current) => {
        const currentLayout = normalizeSectionLayout(
          current[activeTopic],
          storageKey,
          sections,
        );
        const nextLayout = normalizeSectionLayout(
          updater(currentLayout),
          storageKey,
          sections,
        );
        return { ...current, [activeTopic]: nextLayout };
      });
    },
    [activeTopic, sections, storageKey],
  );

  if (mode === "mobile") {
    return (
      <div className="section-stack section-stack-static">
        {sections.map((section) => (
          <Section
            defaultOpen={section.defaultOpen}
            id={section.id}
            key={section.id}
            meta={section.meta}
            title={section.title}
          >
            {section.children}
          </Section>
        ))}
      </div>
    );
  }

  return (
    <InspectorSectionGroup
      layoutState={layoutState}
      onLayoutChange={updateLayoutState}
      sections={sections}
      storageKey={storageKey}
    />
  );
}

type CreateInspectorSectionsProps = {
  readonly activeTopic: Topic;
  readonly copyText: CopyText;
  readonly onAnchor: (index: number) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function createInspectorSections({
  activeTopic,
  copyText,
  onAnchor,
  selectedSlide,
  state,
}: CreateInspectorSectionsProps): InspectorSectionSpec[] {
  const sections: InspectorSectionSpec[] = [
    {
      children: (
        <>
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
        </>
      ),
      defaultOpen: true,
      defaultSize: 26,
      id: "summary",
      maxSize: 180,
      minSize: 136,
      title: "Summary",
    },
  ];

  if (activeTopic === "Outline") {
    sections.push(
      {
        children: (
          <OutlineList
            currentSlideId={selectedSlide.slideId}
            onAnchor={onAnchor}
          />
        ),
        defaultOpen: true,
        defaultSize: 34,
        id: "outline",
        minSize: 150,
        title: "Outline",
      },
      {
        children: (
          <TimelineList
            currentSlideId={selectedSlide.slideId}
            onAnchor={onAnchor}
          />
        ),
        defaultOpen: true,
        defaultSize: 40,
        id: "timeline",
        minSize: 168,
        title: "Timeline",
      },
    );
  }

  if (activeTopic === "Readiness") {
    sections.push(
      {
        children: <ReadinessList state={state} />,
        defaultOpen: true,
        defaultSize: 42,
        id: "readiness",
        minSize: 174,
        title: "Readiness",
      },
      {
        children: <DiagnosticsList copyText={copyText} state={state} />,
        defaultSize: 32,
        id: "readiness-diagnostics",
        minSize: 160,
        title: "Diagnostics",
      },
    );
  }

  if (activeTopic === "Diagnostics") {
    sections.push(
      {
        children: <DiagnosticsList copyText={copyText} state={state} />,
        defaultOpen: true,
        defaultSize: 50,
        id: "diagnostics",
        meta: `${state.diagnostics.length} items`,
        minSize: 190,
        title: "Diagnostics",
      },
      {
        children: <LimitationsList state={state} />,
        defaultSize: 24,
        id: "diagnostic-limitations",
        minSize: 136,
        title: "Limitations",
      },
    );
  }

  if (activeTopic === "Provenance") {
    sections.push(
      {
        children: <FormatCapabilities state={state} />,
        defaultOpen: true,
        defaultSize: 28,
        id: "format-capabilities",
        minSize: 172,
        title: "Format Capabilities",
      },
      {
        children: <EvidenceFiles copyText={copyText} state={state} />,
        defaultOpen: true,
        defaultSize: 28,
        id: "evidence-files",
        minSize: 160,
        title: "Evidence Files",
      },
      {
        children: <SelectorProvenance copyText={copyText} state={state} />,
        defaultSize: 20,
        id: "selector-provenance",
        minSize: 140,
        title: "Selector Provenance",
      },
      {
        children: <RawDetailsCopy copyText={copyText} state={state} />,
        defaultSize: 16,
        id: "raw-details",
        minSize: 132,
        title: "Raw Details",
      },
    );
  }

  if (activeTopic === "Notes") {
    sections.push(
      {
        children: (
          <div className="notice-card">
            <Presentation size={16} />
            <p>
              Normal player view hides speaker notes. Notes appear only through
              explicit presenter metadata affordances.
            </p>
          </div>
        ),
        defaultOpen: true,
        defaultSize: 42,
        id: "notes-boundary",
        minSize: 130,
        title: "Notes Boundary",
      },
      {
        children: (
          <p>
            Suggested speaker cue: connect local export proof to the
            maintainer-approved alpha boundary without implying hosted release.
          </p>
        ),
        defaultSize: 32,
        id: "speaker-notes",
        minSize: 112,
        title: "Presenter Notes",
      },
    );
  }

  if (activeTopic === "Limitations") {
    sections.push(
      {
        children: <LimitationsList state={state} />,
        defaultOpen: true,
        defaultSize: 46,
        id: "limitations",
        minSize: 170,
        title: "Limitations",
      },
      {
        children: <EvidenceFiles copyText={copyText} state={state} />,
        defaultSize: 28,
        id: "limitation-provenance",
        minSize: 150,
        title: "Provenance",
      },
    );
  }

  return sections;
}

type InspectorSectionGroupProps = {
  readonly layoutState: InspectorSectionLayoutState;
  readonly onLayoutChange: InspectorSectionLayoutUpdater;
  readonly sections: InspectorSectionSpec[];
  readonly storageKey: string;
};

type SectionSizePlanInput = {
  readonly containerHeight: number;
  readonly expandedSections: Record<string, boolean>;
  readonly measuredBodySizes: Record<string, number>;
  readonly sectionSizes: Record<string, number>;
  readonly sections: readonly InspectorSectionSpec[];
};

function InspectorSectionGroup({
  layoutState,
  onLayoutChange,
  sections,
  storageKey,
}: InspectorSectionGroupProps) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const animationTimerRef = useRef<number | null>(null);
  const [measuredBodySizes, setMeasuredBodySizes] = useState<
    Record<string, number>
  >({});
  const [containerHeight, setContainerHeight] = useState(0);
  const [animateLayout, setAnimateLayout] = useState(false);
  const { expandedSections, sectionSizes } = layoutState;
  const sectionSizesForLayout = useMemo(
    () =>
      createSectionSizePlan({
        containerHeight,
        expandedSections,
        measuredBodySizes,
        sectionSizes,
        sections,
      }),
    [
      containerHeight,
      expandedSections,
      measuredBodySizes,
      sectionSizes,
      sections,
    ],
  );

  useEffect(() => {
    storeSectionSizes(storageKey, sectionSizes, sections);
  }, [sectionSizes, sections, storageKey]);

  useEffect(
    () => () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return undefined;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const style = window.getComputedStyle(stack);
        const verticalPadding =
          Number.parseFloat(style.paddingTop) +
          Number.parseFloat(style.paddingBottom);
        setContainerHeight(Math.round(stack.clientHeight - verticalPadding));
      });
    };
    measure();

    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(stack);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  const triggerSectionAnimation = useCallback(() => {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }
    setAnimateLayout(true);
    animationTimerRef.current = window.setTimeout(() => {
      animationTimerRef.current = null;
      setAnimateLayout(false);
    }, SECTION_ANIMATION_DURATION_MS);
  }, []);

  const setSectionExpanded = useCallback(
    (id: string, expanded: boolean) => {
      triggerSectionAnimation();
      onLayoutChange((current) => {
        if (current.expandedSections[id] === expanded) return current;
        return {
          ...current,
          expandedSections: { ...current.expandedSections, [id]: expanded },
        };
      });
    },
    [onLayoutChange, triggerSectionAnimation],
  );

  const setMeasuredBodySize = useCallback((id: string, size: number) => {
    setMeasuredBodySizes((current) => {
      const previous = current[id] ?? 0;
      if (Math.abs(previous - size) <= 1) return current;
      return { ...current, [id]: size };
    });
  }, []);

  const startSectionResize = useCallback(
    (dividerIndex: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const resizePair = findResizePairForDivider(
        sections,
        expandedSections,
        dividerIndex,
      );
      if (!resizePair) return;

      const [firstSection, secondSection] = resizePair;
      const firstStart = sectionSizesForLayout[firstSection.id];
      const secondStart = sectionSizesForLayout[secondSection.id];
      const firstMinimum = getSectionMinimumSize(
        firstSection,
        true,
        measuredBodySizes,
      );
      const secondMinimum = getSectionMinimumSize(
        secondSection,
        true,
        measuredBodySizes,
      );
      const firstMaximum = getSectionMaximumSize(
        firstSection,
        true,
        measuredBodySizes,
      );
      const secondMaximum = getSectionMaximumSize(
        secondSection,
        true,
        measuredBodySizes,
      );
      const startY = event.clientY;

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const rawDelta = moveEvent.clientY - startY;
        const lowerBound = Math.max(
          firstMinimum - firstStart,
          secondStart - secondMaximum,
        );
        const upperBound = Math.min(
          firstMaximum - firstStart,
          secondStart - secondMinimum,
        );
        const delta = Math.min(Math.max(rawDelta, lowerBound), upperBound);
        onLayoutChange((current) => ({
          ...current,
          sectionSizes: {
            ...current.sectionSizes,
            [firstSection.id]: Math.round(firstStart + delta),
            [secondSection.id]: Math.round(secondStart - delta),
          },
        }));
      };

      const stopResize = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopResize);
      window.addEventListener("pointercancel", stopResize);
    },
    [
      expandedSections,
      measuredBodySizes,
      onLayoutChange,
      sectionSizesForLayout,
      sections,
    ],
  );

  return (
    <div
      className={cn(
        "section-stack section-stack-resizable",
        animateLayout && "section-stack-animated",
      )}
      ref={stackRef}
    >
      <div className="section-stack-inner">
        {sections.map((section, index) => (
          <FragmentedSectionPane
            expanded={expandedSections[section.id] ?? false}
            index={index}
            key={section.id}
            measuredBodySizes={measuredBodySizes}
            onBodySizeChange={setMeasuredBodySize}
            onExpandedChange={setSectionExpanded}
            onResizeStart={startSectionResize}
            section={section}
            sectionCount={sections.length}
            sectionSize={sectionSizesForLayout[section.id]}
            sizePlanReady={containerHeight > 0}
            resizable={Boolean(
              findResizePairForDivider(sections, expandedSections, index),
            )}
          />
        ))}
      </div>
    </div>
  );
}

type FragmentedSectionPaneProps = {
  readonly expanded: boolean;
  readonly index: number;
  readonly measuredBodySizes: Record<string, number>;
  readonly onBodySizeChange: (id: string, size: number) => void;
  readonly onExpandedChange: (id: string, expanded: boolean) => void;
  readonly onResizeStart: (
    dividerIndex: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  readonly resizable: boolean;
  readonly section: InspectorSectionSpec;
  readonly sectionCount: number;
  readonly sectionSize: number;
  readonly sizePlanReady: boolean;
};

function FragmentedSectionPane({
  expanded,
  index,
  measuredBodySizes,
  onBodySizeChange,
  onExpandedChange,
  onResizeStart,
  resizable,
  section,
  sectionCount,
  sectionSize,
  sizePlanReady,
}: FragmentedSectionPaneProps) {
  return (
    <>
      <InspectorSectionPane
        expanded={expanded}
        measuredBodySizes={measuredBodySizes}
        onBodySizeChange={onBodySizeChange}
        onExpandedChange={onExpandedChange}
        section={section}
        sectionSize={sectionSize}
        sizePlanReady={sizePlanReady}
      />
      {index < sectionCount - 1 && (
        <SectionResizeHandle
          label={`Resize ${section.title} section`}
          onPointerDown={(event) => onResizeStart(index, event)}
          resizable={resizable}
        />
      )}
    </>
  );
}

type InspectorSectionPaneProps = {
  readonly expanded: boolean;
  readonly measuredBodySizes: Record<string, number>;
  readonly onBodySizeChange: (id: string, size: number) => void;
  readonly onExpandedChange: (id: string, expanded: boolean) => void;
  readonly section: InspectorSectionSpec;
  readonly sectionSize: number;
  readonly sizePlanReady: boolean;
};

function InspectorSectionPane({
  expanded,
  measuredBodySizes,
  onBodySizeChange,
  onExpandedChange,
  section,
  sectionSize,
  sizePlanReady,
}: InspectorSectionPaneProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const minimumSize = getSectionMinimumSize(
    section,
    expanded,
    measuredBodySizes,
  );
  const preferredSize = sizePlanReady ? sectionSize : minimumSize;
  const renderedMinimumSize = Math.min(minimumSize, preferredSize);

  useLayoutEffect(() => {
    if (!expanded) {
      onBodySizeChange(section.id, 0);
      return undefined;
    }
    const body = bodyRef.current;
    if (!body) return undefined;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        onBodySizeChange(section.id, Math.ceil(body.scrollHeight));
      });
    };
    measure();

    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(body);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [expanded, onBodySizeChange, section.id]);

  return (
    <div
      className={cn("section-panel", !expanded && "section-panel-collapsed")}
      data-section-panel-id={section.id}
      style={{
        flexBasis: `${preferredSize}px`,
        flexGrow: 0,
        flexShrink: 0,
        minHeight: `${renderedMinimumSize}px`,
      }}
    >
      <Section
        bodyRef={bodyRef}
        id={section.id}
        meta={section.meta}
        onOpenChange={(nextExpanded) =>
          onExpandedChange(section.id, nextExpanded)
        }
        open={expanded}
        title={section.title}
      >
        {section.children}
      </Section>
    </div>
  );
}

type SectionResizeHandleProps = {
  readonly label: string;
  readonly onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  readonly resizable: boolean;
};

function SectionResizeHandle({
  label,
  onPointerDown,
  resizable,
}: SectionResizeHandleProps) {
  return (
    <button
      aria-label={label}
      className="resize-handle resize-handle-horizontal section-resize-handle"
      disabled={!resizable}
      onPointerDown={onPointerDown}
      title={label}
      type="button"
    >
      <span />
    </button>
  );
}

function createInitialExpandedState(
  sections: readonly InspectorSectionSpec[],
): Record<string, boolean> {
  return Object.fromEntries(
    sections.map((section) => [section.id, section.defaultOpen ?? false]),
  );
}

function createDefaultSectionLayout(
  storageKey: string,
  sections: readonly InspectorSectionSpec[],
): InspectorSectionLayoutState {
  return {
    expandedSections: createInitialExpandedState(sections),
    sectionSizes: readStoredSectionSizes(storageKey, sections),
  };
}

function normalizeSectionLayout(
  layout: InspectorSectionLayoutState | undefined,
  storageKey: string,
  sections: readonly InspectorSectionSpec[],
): InspectorSectionLayoutState {
  const defaultLayout = createDefaultSectionLayout(storageKey, sections);
  return {
    expandedSections: Object.fromEntries(
      sections.map((section) => [
        section.id,
        layout?.expandedSections[section.id] ??
          defaultLayout.expandedSections[section.id] ??
          false,
      ]),
    ),
    sectionSizes: Object.fromEntries(
      sections.flatMap((section) => {
        const value =
          layout?.sectionSizes[section.id] ??
          defaultLayout.sectionSizes[section.id];
        return typeof value === "number" && Number.isFinite(value) && value > 0
          ? [[section.id, value]]
          : [];
      }),
    ),
  };
}

function getPreferredSectionSize(section: InspectorSectionSpec) {
  return Math.max(
    section.minSize,
    SECTION_HEADER_SIZE + section.defaultSize * 6,
  );
}

function getSectionMinimumSize(
  section: InspectorSectionSpec,
  expanded: boolean,
  measuredBodySizes: Record<string, number>,
) {
  if (!expanded) return SECTION_HEADER_SIZE;
  if (section.id !== "summary") return section.minSize;
  const measuredBodySize = measuredBodySizes[section.id] ?? 0;
  return Math.max(section.minSize, SECTION_HEADER_SIZE + measuredBodySize + 4);
}

function getSectionMaximumSize(
  section: InspectorSectionSpec,
  expanded: boolean,
  measuredBodySizes: Record<string, number>,
) {
  const minimumSize = getSectionMinimumSize(
    section,
    expanded,
    measuredBodySizes,
  );
  if (!expanded || section.id === "summary") return minimumSize;
  return Math.max(section.maxSize ?? Number.POSITIVE_INFINITY, minimumSize);
}

function getSectionFloorSize(
  section: InspectorSectionSpec,
  expanded: boolean,
  measuredBodySizes: Record<string, number>,
) {
  if (!expanded || section.id === "summary") {
    return getSectionMinimumSize(section, expanded, measuredBodySizes);
  }
  return Math.min(section.minSize, SECTION_HEADER_SIZE + 52);
}

function isResizableSection(
  section: InspectorSectionSpec,
  expandedSections: Record<string, boolean>,
) {
  return section.id !== "summary" && (expandedSections[section.id] ?? false);
}

function findResizePairForDivider(
  sections: readonly InspectorSectionSpec[],
  expandedSections: Record<string, boolean>,
  dividerIndex: number,
): readonly [InspectorSectionSpec, InspectorSectionSpec] | undefined {
  let previous: InspectorSectionSpec | undefined;
  for (let index = dividerIndex; index >= 0; index -= 1) {
    const section = sections[index];
    if (section && isResizableSection(section, expandedSections)) {
      previous = section;
      break;
    }
  }

  let next: InspectorSectionSpec | undefined;
  for (let index = dividerIndex + 1; index < sections.length; index += 1) {
    const section = sections[index];
    if (section && isResizableSection(section, expandedSections)) {
      next = section;
      break;
    }
  }

  return previous && next ? [previous, next] : undefined;
}

function createSectionSizePlan({
  containerHeight,
  expandedSections,
  measuredBodySizes,
  sectionSizes,
  sections,
}: SectionSizePlanInput): Record<string, number> {
  const plan: Record<string, number> = {};
  const resizableSections: InspectorSectionSpec[] = [];

  for (const section of sections) {
    const expanded = expandedSections[section.id] ?? false;
    const minimumSize = getSectionMinimumSize(
      section,
      expanded,
      measuredBodySizes,
    );
    const maximumSize = getSectionMaximumSize(
      section,
      expanded,
      measuredBodySizes,
    );

    if (!isResizableSection(section, expandedSections)) {
      plan[section.id] = minimumSize;
      continue;
    }

    const preferredSize =
      sectionSizes[section.id] ?? getPreferredSectionSize(section);
    plan[section.id] = clampSectionSize(
      preferredSize,
      minimumSize,
      maximumSize,
    );
    resizableSections.push(section);
  }

  if (containerHeight <= 0 || resizableSections.length === 0) return plan;

  const dividerHeight = Math.max(0, sections.length - 1) * SECTION_HANDLE_SIZE;
  const targetPanelHeight = Math.max(0, containerHeight - dividerHeight);
  const currentPanelHeight = sumSectionSizes(sections, plan);
  const delta = targetPanelHeight - currentPanelHeight;

  if (Math.abs(delta) <= 1) return roundSectionPlan(plan);

  if (delta > 0) {
    growSectionSizes({
      amount: delta,
      measuredBodySizes,
      plan,
      sections: resizableSections,
    });
    return roundSectionPlan(plan);
  }

  shrinkSectionSizes({
    amount: Math.abs(delta),
    getLimit: (section) =>
      getSectionMinimumSize(
        section,
        expandedSections[section.id] ?? false,
        measuredBodySizes,
      ),
    plan,
    sections: resizableSections,
  });

  const overflow = sumSectionSizes(sections, plan) - targetPanelHeight;
  if (overflow > 1) {
    shrinkSectionSizes({
      amount: overflow,
      getLimit: (section) =>
        getSectionFloorSize(
          section,
          expandedSections[section.id] ?? false,
          measuredBodySizes,
        ),
      plan,
      sections: resizableSections,
    });
  }

  return roundSectionPlan(plan);
}

function clampSectionSize(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function sumSectionSizes(
  sections: readonly InspectorSectionSpec[],
  plan: Record<string, number>,
) {
  return sections.reduce(
    (total, section) => total + (plan[section.id] ?? 0),
    0,
  );
}

function roundSectionPlan(plan: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(plan).map(([id, size]) => [
      id,
      Math.max(0, Math.round(size)),
    ]),
  );
}

type GrowSectionSizesInput = {
  readonly amount: number;
  readonly measuredBodySizes: Record<string, number>;
  readonly plan: Record<string, number>;
  readonly sections: readonly InspectorSectionSpec[];
};

function growSectionSizes({
  amount,
  measuredBodySizes,
  plan,
  sections,
}: GrowSectionSizesInput) {
  let remaining = amount;
  let candidates = [...sections];

  while (remaining > 1 && candidates.length > 0) {
    const share = remaining / candidates.length;
    let consumed = 0;
    const nextCandidates: InspectorSectionSpec[] = [];

    for (const section of candidates) {
      const maximumSize = getSectionMaximumSize(
        section,
        true,
        measuredBodySizes,
      );
      const room = maximumSize - (plan[section.id] ?? 0);
      if (room <= 1) continue;
      const increase = Math.min(room, share);
      plan[section.id] = (plan[section.id] ?? 0) + increase;
      consumed += increase;
      if (room - increase > 1) nextCandidates.push(section);
    }

    if (consumed <= 0) return;
    remaining -= consumed;
    candidates = nextCandidates;
  }
}

type ShrinkSectionSizesInput = {
  readonly amount: number;
  readonly getLimit: (section: InspectorSectionSpec) => number;
  readonly plan: Record<string, number>;
  readonly sections: readonly InspectorSectionSpec[];
};

function shrinkSectionSizes({
  amount,
  getLimit,
  plan,
  sections,
}: ShrinkSectionSizesInput) {
  let remaining = amount;
  let candidates = [...sections];

  while (remaining > 1 && candidates.length > 0) {
    const share = remaining / candidates.length;
    let consumed = 0;
    const nextCandidates: InspectorSectionSpec[] = [];

    for (const section of candidates) {
      const minimumSize = getLimit(section);
      const room = (plan[section.id] ?? 0) - minimumSize;
      if (room <= 1) continue;
      const decrease = Math.min(room, share);
      plan[section.id] = (plan[section.id] ?? 0) - decrease;
      consumed += decrease;
      if (room - decrease > 1) nextCandidates.push(section);
    }

    if (consumed <= 0) return;
    remaining -= consumed;
    candidates = nextCandidates;
  }
}

function readStoredSectionSizes(
  storageKey: string,
  sections: readonly InspectorSectionSpec[],
): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as unknown;
    if (!isSectionSizeRecord(parsed, sections)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function storeSectionSizes(
  storageKey: string,
  sizes: Record<string, number>,
  sections: readonly InspectorSectionSpec[],
) {
  if (typeof window === "undefined") return;
  if (!isSectionSizeRecord(sizes, sections)) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(sizes));
  } catch {
    // Ignore storage failures; layout persistence is a prototype affordance.
  }
}

function isSectionSizeRecord(
  sizes: unknown,
  sections: readonly InspectorSectionSpec[],
): sizes is Record<string, number> {
  if (!sizes || typeof sizes !== "object") return false;
  const record = sizes as Record<string, unknown>;
  return sections.every((section) => {
    const value = record[section.id];
    return (
      value === undefined ||
      (typeof value === "number" && Number.isFinite(value) && value > 0)
    );
  });
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
