# ADR-0002: Capture typing through `beforeinput` on a hidden textarea

**Status:** Proposed
**Date:** 2026-09-26
**Deciders:** Sandeep Pamujula

## Context

The typing screen has strict input rules (see the typing-session requirements):
- Characters are only appended at the end; Backspace deletes one character; word-deletion shortcuts act as one Backspace.
- Paste, drag-and-drop, arrow keys, Home, End and select-all have no effect. Enter is ignored. Tab moves focus as usual.
- Dead keys and input methods produce one keystroke per composed character; auto-repeat counts every repeat.
- Autocorrect, autocapitalisation and spellcheck are off. On-screen touch keyboards are best-effort.
- Keystrokes at or after 120 s are ignored.

The passage is rendered as styled spans, so the thing the user types into cannot be the thing they see.

## Decision

- A visually hidden, focused **`<textarea>`** with an accessible label receives input. It has
  `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`, `spellcheck={false}`.
- The **`beforeinput`** event is the only source of edits. Its `inputType` is mapped to engine commands:
  - `insertText` → type each character of `event.data`
  - `deleteContentBackward`, `deleteWordBackward`, `deleteSoftLineBackward` → one Backspace
  - everything else (`insertFromPaste`, `insertFromDrop`, `insertLineBreak`, `insertParagraph`, other deletions, formatting) → ignored
  Every `beforeinput` is `preventDefault()`-ed, so the textarea value stays empty.
- **Composition** (`compositionend`) delivers the final composed text once. Composition events
  cannot be cancelled, so after composition ends the textarea is cleared and the composed text is typed.
- **`keydown`** is used only to block navigation and selection keys (arrows, Home, End, PageUp/PageDown,
  Ctrl/Cmd+A) and Enter. Tab is not blocked.
- `paste`, `drop` and `dragover` are also `preventDefault()`-ed as a second line of defence.
- The **typing engine** in `src/lib/typingEngine.ts` is the single source of truth: it receives
  `type(char, now)` and `backspace(now)` commands and checks elapsed time before applying either.
  The DOM layer only translates events into these commands.

## Options Considered

### Option A: Hidden textarea + `beforeinput` (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | None |
| Scalability | n/a |
| Team familiarity | Medium: `inputType` values need learning |

**Pros:** Handles dead keys, IMEs and auto-repeat correctly; paste and drop arrive as distinct input types that are easy to block; works with on-screen keyboards on a best-effort basis.
**Cons:** Composition cannot be cancelled and needs special handling; small browser differences in `inputType` need tests on all three engines.

### Option B: `keydown` on the page
**Pros:** Simple; `event.key` is easy to read.
**Cons:** Dead keys and IMEs report `Dead`/`Process` instead of the final character; paste and drop are not key events; on-screen keyboards often send `Unidentified`.

### Option C: Controlled `<input>` and diffing its value
**Pros:** Familiar React pattern.
**Cons:** Diffing must guess what changed (paste vs typing); the cursor can be moved; hard to guarantee "append only".

## Trade-off Analysis

Option A costs some care around composition, but it is the only option where every input rule maps to a
specific, testable event type. Keeping the engine pure means the rules are unit-tested without a browser,
and the DOM mapping is tested in component tests and in Playwright on Chromium, Firefox and WebKit.

## Consequences

- Easier: unit-testing input rules against the engine; blocking paste and drop reliably.
- Harder: composition handling; cross-browser e2e coverage is required, not optional.
- Revisit: if full touch-keyboard support ever enters scope (autocorrect replacements via `insertReplacementText`).

## Action Items
1. [ ] Change `add-typing-engine`: `type`/`backspace` commands with injected clock and a 120 s cutoff.
2. [ ] Change `add-typing-screen`: the hidden textarea, the `beforeinput` mapping, composition handling and key blocking, with component tests per `inputType`.
3. [ ] Change `harden-accessibility-and-offline`: Playwright input tests on Firefox and WebKit.
