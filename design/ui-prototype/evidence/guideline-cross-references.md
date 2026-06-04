# Guideline Cross-References

> Status: Q17 evidence note, not a Stage A spec.

| Visible prototype choice | Supporting source | How it appears in the prototype |
| :---- | :---- | :---- |
| Deck-primary three-rail desktop shell | `layout-guideline.md`; Q5 in `QA/phase7-pre-architect-ui-prototype-decisions.md` | Center 16:9 deck canvas, left static slide rail, right inspector rail, bottom controls, persistent status bar. |
| Top layout controls and side swap | `layout-guideline.md` | Top-right layout controls expose left/bottom/right rail toggles and side swap. |
| Bottom controls at action-anchor level | `fullscreen-navigation-guideline.md`; Q7 | Previous, Play/Pause, Next, fullscreen, and current action-anchor context stay in bottom controls. |
| Fullscreen presentation posture | `fullscreen-navigation-guideline.md` | Pseudo-fullscreen hides nonessential chrome and shows edge-reveal previous/next affordances. |
| Inspector activity topics | `inspector-ia-guideline.md`; Q8 | Activity buttons for Outline, Readiness, Diagnostics, Provenance, Notes, and Limitations open a summary-first pane. |
| Bottom health signal | `layout-guideline.md`; `inspector-ia-guideline.md`; Q11 | Persistent status bar shows `Ready`, `Checking`, `Warnings`, or `Blocked` and routes to Readiness/Diagnostics. |
| Blocking error bar | `inspector-ia-guideline.md`; Q11 | Blocking state uses a top-center message bar with a path into Diagnostics. |
| Read-only diagnostic posture | `inspector-ia-guideline.md`; Q16 | Diagnostics show locator, code, and repair hint only; no Fix, AI patch, source editor, regenerate, or re-export action. |
| Provenance and limitation IA | `inspector-ia-guideline.md`; Q12 | Provenance topic separates manifest path, selector, format capability, artifact inventory, and limitations. |
| Notes and presenter boundary | `presenter-view-guideline.md`; Q10 | Notes are hidden in normal player view and shown only in explicit presenter metadata state. |
| shadcn-compatible neutral light/dark style | `visual-style-guideline.md`; Q14 | CSS uses shadcn-like semantic tokens, neutral/zinc surface treatment, one restrained accent, and semantic status colors. |
| Mobile responsive viewer, not presenter console | Q6; `layout-guideline.md`; `presenter-view-guideline.md` | Narrow viewport keeps deck first and uses folded/drawer panels for slides/inspector. |
| Stage A non-freeze handoff | `stage-a-handoff-guideline.md`; Q18 | Evidence docs repeat that screenshots, fields, CSS, component structure, pixels, and behavior are directional only. |
