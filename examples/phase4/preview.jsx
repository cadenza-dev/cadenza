/** @jsxImportSource react */

import { CadenzaPlayer } from "@cadenza-dev/preview-remotion";
import { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { phase4DogfoodTalkMetadata } from "./dogfood-talk.js";
import {
  createPhase4DogfoodPreviewProps,
  createPhase4PresenterControls,
  createPhase4PresenterWorkflow,
  phase4DogfoodPreviewDescriptor,
} from "./preview.js";

export function Phase4DogfoodPreviewApp() {
  const playerProps = useMemo(() => createPhase4DogfoodPreviewProps(), []);
  const [previewHandle, setPreviewHandle] = useState(null);
  const [presenterSnapshot, setPresenterSnapshot] = useState(null);
  const presenterWorkflow = useMemo(
    () =>
      presenterSnapshot
        ? createPhase4PresenterWorkflow({
            snapshot: presenterSnapshot,
            timeline: playerProps.timeline,
          })
        : null,
    [playerProps.timeline, presenterSnapshot],
  );
  const presenterControls = useMemo(
    () => (previewHandle ? createPhase4PresenterControls(previewHandle) : null),
    [previewHandle],
  );
  const handlePreviewReady = useCallback((handle) => {
    setPreviewHandle(handle);
    setPresenterSnapshot(handle.getSnapshot());

    return () => {
      setPreviewHandle(null);
      setPresenterSnapshot(null);
    };
  }, []);

  return (
    <main
      data-cadenza-phase4-dogfood-preview=""
      style={{
        background: "#0f172a",
        color: "#f8fafc",
        display: "grid",
        fontFamily: "Inter, Arial, sans-serif",
        gap: 24,
        gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.5fr)",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <section>
        <p style={{ color: "#94a3b8", marginBlock: "0 8px" }}>
          {phase4DogfoodPreviewDescriptor.title}
        </p>
        <CadenzaPlayer
          {...playerProps}
          className="phase4-dogfood-player"
          onPreviewReady={handlePreviewReady}
          onSnapshotChange={setPresenterSnapshot}
          playerStyle={{
            border: "1px solid rgba(248, 250, 252, 0.18)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        />
      </section>
      <Phase4PresenterPanel
        controls={presenterControls}
        outlineCount={phase4DogfoodTalkMetadata.outline.length}
        workflow={presenterWorkflow}
      />
    </main>
  );
}

function Phase4PresenterPanel({ controls, outlineCount, workflow }) {
  if (!workflow) {
    return (
      <aside
        data-cadenza-phase4-outline-count={outlineCount}
        data-cadenza-phase4-presenter-panel=""
        style={presenterPanelStyle}
      >
        <p style={mutedTextStyle}>Loading presenter context.</p>
      </aside>
    );
  }

  return (
    <aside
      data-cadenza-phase4-outline-count={outlineCount}
      data-cadenza-phase4-presenter-panel=""
      data-cadenza-phase4-presenter-current={workflow.current.slideId}
      data-cadenza-phase4-presenter-next={workflow.next?.slideId ?? "none"}
      style={presenterPanelStyle}
    >
      <div style={presenterHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>{workflow.current.chapterTitle}</p>
          <h2 style={titleStyle}>{workflow.current.title}</h2>
        </div>
        <span
          data-cadenza-phase4-presenter-elapsed-active-ms={
            workflow.elapsed.activeMs
          }
          data-cadenza-phase4-presenter-elapsed-wall-ms={
            workflow.elapsed.wallMs
          }
          style={elapsedStyle}
        >
          {formatElapsed(workflow.elapsed.activeMs)}
        </span>
      </div>
      <section
        data-cadenza-phase4-presenter-current=""
        style={presenterSectionStyle}
      >
        <p style={mutedTextStyle}>
          Step {workflow.current.stepIndex + 1} of {workflow.current.stepCount}
        </p>
        <p style={bodyTextStyle}>{workflow.current.summary}</p>
      </section>
      <section
        data-cadenza-phase4-presenter-next=""
        style={presenterSectionStyle}
      >
        <p style={eyebrowStyle}>Next</p>
        {workflow.next ? (
          <p style={bodyTextStyle}>
            {workflow.next.title} · step {workflow.next.stepIndex + 1}
          </p>
        ) : (
          <p style={bodyTextStyle}>End of talk</p>
        )}
      </section>
      <section
        data-cadenza-phase4-presenter-notes=""
        style={presenterSectionStyle}
      >
        <p style={eyebrowStyle}>Notes</p>
        {workflow.notes.map((note) => (
          <p key={note} style={bodyTextStyle}>
            {note}
          </p>
        ))}
      </section>
      <div style={buttonGridStyle}>
        <button
          disabled={!controls}
          onClick={() => controls?.previous()}
          type="button"
        >
          Previous
        </button>
        <button
          disabled={!controls}
          onClick={() => controls?.next()}
          type="button"
        >
          Next
        </button>
        <button
          disabled={!controls}
          onClick={() => controls?.restart()}
          type="button"
        >
          Restart
        </button>
        <button
          disabled={!controls}
          onClick={() => controls?.pause()}
          type="button"
        >
          Pause
        </button>
        <button
          disabled={!controls}
          onClick={() => controls?.play()}
          type="button"
        >
          Resume
        </button>
        <button
          disabled={!controls}
          onClick={() => controls?.togglePlayback()}
          type="button"
        >
          Toggle
        </button>
      </div>
      <nav aria-label="Dogfood talk chapters" style={navListStyle}>
        {workflow.chapters.map((chapter) => (
          <button
            data-cadenza-phase4-presenter-chapter-button={chapter.id}
            disabled={!controls}
            key={chapter.id}
            onClick={() => controls?.gotoChapter(chapter)}
            type="button"
          >
            {chapter.title}
          </button>
        ))}
      </nav>
      <nav
        aria-label="Dogfood talk outline"
        data-cadenza-phase4-outline=""
        style={navListStyle}
      >
        {workflow.outline.map((entry) => (
          <button
            data-cadenza-phase4-outline-slide-id={entry.slideId}
            data-cadenza-phase4-presenter-outline-button={entry.slideId}
            disabled={!controls}
            key={entry.slideId}
            onClick={() => controls?.gotoOutline(entry)}
            type="button"
          >
            {entry.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

const presenterPanelStyle = {
  alignSelf: "start",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 8,
  display: "grid",
  gap: 16,
  padding: 16,
};

const presenterHeaderStyle = {
  alignItems: "start",
  display: "flex",
  gap: 12,
  justifyContent: "space-between",
};

const presenterSectionStyle = {
  borderTop: "1px solid rgba(148, 163, 184, 0.25)",
  paddingTop: 12,
};

const eyebrowStyle = {
  color: "#94a3b8",
  fontSize: 12,
  margin: 0,
  textTransform: "uppercase",
};

const titleStyle = {
  fontSize: 20,
  lineHeight: 1.2,
  margin: "4px 0 0",
};

const mutedTextStyle = {
  color: "#94a3b8",
  margin: 0,
};

const bodyTextStyle = {
  lineHeight: 1.45,
  margin: "6px 0 0",
};

const elapsedStyle = {
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 6,
  fontVariantNumeric: "tabular-nums",
  padding: "4px 8px",
};

const buttonGridStyle = {
  display: "grid",
  gap: 8,
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
};

const navListStyle = {
  display: "grid",
  gap: 8,
};

export function mountPhase4DogfoodPreview(rootElement) {
  if (!rootElement) {
    throw new Error(
      `Missing #${phase4DogfoodPreviewDescriptor.rootElementId} preview root.`,
    );
  }

  const root = createRoot(rootElement);
  root.render(<Phase4DogfoodPreviewApp />);

  return root;
}

if (typeof document !== "undefined") {
  mountPhase4DogfoodPreview(
    document.getElementById(phase4DogfoodPreviewDescriptor.rootElementId),
  );
}
