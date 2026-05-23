/** @jsxImportSource react */

import { CadenzaPlayer } from "@cadenza-dev/preview-remotion";
import { createRoot } from "react-dom/client";
import { phase4DogfoodTalkMetadata } from "./dogfood-talk.js";
import {
  createPhase4DogfoodPreviewProps,
  phase4DogfoodPreviewDescriptor,
} from "./preview.js";

export function Phase4DogfoodPreviewApp() {
  const playerProps = createPhase4DogfoodPreviewProps();

  return (
    <main
      data-cadenza-phase4-dogfood-preview=""
      style={{
        background: "#0f172a",
        color: "#f8fafc",
        display: "grid",
        fontFamily: "Inter, Arial, sans-serif",
        gap: 24,
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
          playerStyle={{
            border: "1px solid rgba(248, 250, 252, 0.18)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        />
      </section>
      <nav
        aria-label="Dogfood talk outline"
        data-cadenza-phase4-outline=""
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {phase4DogfoodTalkMetadata.outline.map((entry) => (
          <a
            data-cadenza-phase4-outline-slide-id={entry.slideId}
            href={`#${entry.slideId}`}
            key={entry.slideId}
            style={{
              border: "1px solid rgba(148, 163, 184, 0.35)",
              borderRadius: 8,
              color: "#f8fafc",
              padding: 12,
              textDecoration: "none",
            }}
          >
            <strong>{entry.title}</strong>
            <span
              style={{
                color: "#94a3b8",
                display: "block",
                fontSize: 13,
                lineHeight: 1.4,
                marginTop: 4,
              }}
            >
              {entry.summary}
            </span>
          </a>
        ))}
      </nav>
    </main>
  );
}

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
