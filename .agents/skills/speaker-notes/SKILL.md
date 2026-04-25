---
name: speaker-notes
description: Add concise Cadenza speaker notes through the typed API while preserving slide and presenter metadata.
---

# Speaker Notes

Use this skill when adding talk tracks, presenter cues, or rehearsal notes to a
Cadenza deck.

## Core Rules

- Add notes with the typed API `Notes` node rather than embedding presenter-only
  text into visible slide content.
- Keep notes tied to the nearest relevant `Slide` or `Step` so presenter
  metadata can expose the current slide, step, notes, and elapsed time.
- Write notes as short speaker cues, not a full script unless the user asks for
  scripted delivery.
- Keep visual layout separate from notes; do not use raw Remotion primitives to
  hide or reveal presenter-only content.
- If notes reference media or fonts, use render-safe asset declarations for the
  visible content they describe.

## Notes Checklist

- Notes do not duplicate every visible bullet.
- The first note on a slide names the intended audience takeaway.
- Step-level notes match the reveal order.
- Notes remain useful in preview and export even when animation timing changes.
