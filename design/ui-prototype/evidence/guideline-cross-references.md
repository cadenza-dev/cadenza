# Guideline Cross-References

> Status: Q17 evidence note, not a Stage A spec.

| Visible prototype choice | Supporting source | How it appears in the prototype |
| :---- | :---- | :---- |
| Deck-primary three-rail desktop shell | `layout-guideline.md`; Q5 in `QA/phase7-pre-architect-ui-prototype-decisions.md` | Center 16:9 deck canvas, left static slide rail, right inspector rail, bottom controls, persistent status bar. |
| Top layout controls and side swap | `layout-guideline.md` | Top-right icon controls bind to the current physical left and right rails, while side swap changes rail assignment without changing the bottom status-bar order. |
| Direct rail resizing | `layout-guideline.md`; VS Code sash research | `react-resizable-panels` separators act as draggable rail boundaries instead of internal width bars; rails open at their minimum allowed size and preserve the slide/inspector rail kind width across side swap. |
| Bottom controls at action-anchor level | `fullscreen-navigation-guideline.md`; Q7 | Previous, fullscreen, and Next controls are centered above a short progress bar and `Action anchor x of y`; scenario state is separate from `anchorIndex`. |
| Source deck theme remains stable under app theme changes | `visual-style-guideline.md`; Q14 | App light/dark theme affects the Player App chrome only; deck slides and slide thumbnails keep the authored light slide surface, ink, status badge, and preview colors. |
| Fullscreen presentation posture | `fullscreen-navigation-guideline.md` | Pseudo-fullscreen hides app chrome, fills the viewport by deck aspect ratio, uses the current slide background for letterboxing, exposes a darker edge-hit overlay for navigation arrows, exits on final-anchor right navigation, and exposes a pointer-position context menu. |
| Inspector activity topics | `inspector-ia-guideline.md`; Q8; VS Code primary-bar research | Icon-only activity buttons with portal tooltips for Outline, Readiness, Diagnostics, Provenance, Notes, and Limitations open a summary-first pane; collapsing the pane keeps the activity bar visible and clears active focus. |
| Inspector section scrolling | `inspector-ia-guideline.md`; VS Code scroller research | Collapsible sections use right-side chevrons and shared hover-revealed rectangular scrollbars; section bodies keep adaptive overflow so compressed Provenance sections scroll instead of clipping. |
| Bottom health signal | `layout-guideline.md`; `inspector-ia-guideline.md`; Q11 | Persistent status bar keeps a fixed deck/anchor/status layout under rail swap, shows `Ready`, `Checking`, `Warnings`, or `Blocked`, and routes to Readiness/Diagnostics. |
| Blocking error bar | `inspector-ia-guideline.md`; Q11 | Blocking state uses a top-center message bar with a path into Diagnostics. |
| Read-only diagnostic posture | `inspector-ia-guideline.md`; Q16 | Diagnostics show locator, code, and repair hint only; no Fix, AI patch, source editor, regenerate, or re-export action. |
| Provenance and limitation IA | `inspector-ia-guideline.md`; Q12 | Provenance topic separates manifest path, selector, format capability, artifact inventory, and limitations; Raw Details is exposed as a clipboard action instead of a visible JSON reader. |
| Notes and presenter boundary | `presenter-view-guideline.md`; Q10 | Notes are hidden in normal player view and shown only in explicit presenter metadata state. |
| shadcn-compatible neutral light/dark style | `visual-style-guideline.md`; Q14 | CSS uses shadcn-like semantic tokens, black/white neutral controls, lucide icons, and green/blue/yellow/red semantic status colors only. |
| Mobile responsive viewer, not presenter console | Q6; `layout-guideline.md`; `presenter-view-guideline.md` | Narrow viewport uses a deck-first mobile layout and folded/drawer panels for slides/inspector. |
| Stage A non-freeze handoff | `stage-a-handoff-guideline.md`; Q18 | Evidence docs repeat that screenshots, fields, CSS, component structure, pixels, and behavior are directional only. |
