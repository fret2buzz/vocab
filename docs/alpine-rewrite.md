# Alpine.js rewrite

How the vocabulary quiz was migrated from imperative vanilla JavaScript to [Alpine.js](https://alpinejs.dev/) 3.

---

## Before vs after

### Before (vanilla JS)

The UI lived in `dist/index.html` with empty placeholders. Logic in `dist/js/main.js` did everything by hand:

- `document.getElementById(...)` for every control
- Global mutable state (`start`, `score`, `newArray`, …)
- Listeners on `DOMContentLoaded` for Start / Next / Skip / Enter
- Progress bar and prompts updated by writing `innerHTML` / `style`
- Results table built as one big HTML string and injected into `#wordResult`
- Quiz panel hidden with `element.style.display = 'none'`

That works, but UI and state drift easily: every new field needs another ID and another imperative update.

### After (Alpine.js)

One root component owns state. The HTML declares how that state is shown and which actions run. Alpine keeps the DOM in sync when properties change.

| Concern | Vanilla | Alpine |
|--------|---------|--------|
| State | Module-level variables | Component object properties |
| Bindings | Manual DOM writes | `x-model`, `x-text`, `:style`, `:class` |
| Visibility | `style.display` | `x-show` |
| Lists | String concatenation | `x-for` |
| Events | `addEventListener` | `@click`, `@keydown.enter` |
| Init | `DOMContentLoaded` setup | `init()` on the component |
| Focus | Optional / absent | `$refs` + `$nextTick` |

CSS (`dist/css/main.css`) and PapaParse CSV parsing were kept. Gulp was removed; the app is static files plus CDN scripts.

---

## File layout

```text
dist/
  index.html    # markup + Alpine directives
  js/main.js    # vocabApp() component factory
  css/main.css  # unchanged styles
```

No bundler. Alpine and PapaParse load from jsDelivr.

---

## Script loading order

In `dist/index.html`:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
<script src="js/main.js"></script>
```

Why this order:

1. **`main.js` (sync)** — defines global `vocabApp()` before Alpine starts.
2. **PapaParse (sync)** — available when `parseCsv()` runs.
3. **Alpine (`defer`)** — initializes after the document is parsed, finds `x-data="vocabApp()"`, and wires reactivity.

Alpine must not run before `vocabApp` exists. Keeping Alpine deferred and the component script classic/synchronous ensures that.

---

## Component factory: `vocabApp()`

Alpine’s `x-data` can be an expression. Here it calls a factory that returns the component object:

```html
<div x-data="vocabApp()">
```

```js
function vocabApp() {
    return {
        // state, getters, methods…
    };
}
```

That keeps logic in one file and out of the HTML, while still using Alpine’s reactivity (the returned object becomes a reactive proxy).

---

## State

| Property | Type | Role |
|----------|------|------|
| `csv` | string | Raw semicolon-separated word list (textarea) |
| `words` | array | Shuffled quiz items after parse |
| `index` | number | Current word index |
| `score` | number | Count of correct answers |
| `enteredWord` | string | Input bound to the answer field |
| `started` | boolean | Quiz UI visible |
| `finished` | boolean | Results UI visible |

Each item in `words` is a PapaParse row plus runtime fields:

- `en`, `translation`, `definition`, `pronunciations` — from CSV headers  
- `entered` — what the user typed (or `-` when skipped)  
- `valid` — `true` if `entered === en`

### Derived values (getters)

```js
get current() {
    return this.words[this.index] || null;
},

get progress() {
    if (!this.words.length) return 0;
    return ((this.index + 1) / this.words.length) * 100;
},
```

`current` drives the translation/definition prompt. `progress` feeds the bar width. Getters recalculate when dependencies change; the template reads them like normal properties.

---

## Methods (behavior)

### `parseCsv(text)`

Lowercases the textarea, then PapaParse with `delimiter: ';'`, `header: true`, `skipEmptyLines: true`. Answers are compared in lowercase, so normalizing input at parse time keeps grading consistent.

### `shuffle(array)`

Fisher–Yates shuffle on a copy (`[...array]`) so re-Start does not mutate a frozen snapshot unexpectedly.

### `start()`

Resets index/score/input flags, parses + shuffles `csv` into `words`, sets `started = true` / `finished = false`, focuses the input. Bound to the **Start** button; also called from `init()`.

### `submit(skip = false)`

Core grading step (replaces the old `nextWord` + Skip path):

1. Guard if there is no current word or the quiz is finished.
2. Resolve `entered` (`'-'` when skipping; otherwise trimmed lowercase input). Ignore empty non-skip submits.
3. Store `entered` / `valid` on the current word; bump `score` when valid.
4. If more words remain → increment `index`, clear input, refocus.
5. Else → `finished = true` (Alpine shows the results table via `x-show`).

### `focusInput()`

```js
this.$nextTick(() => {
    this.$refs.wordInput?.focus();
});
```

`$refs.wordInput` maps to `x-ref="wordInput"` on the input. `$nextTick` waits until Alpine has updated the DOM (e.g. after showing the quiz again) so focus is not lost.

### `pronunciation(word)`

Strips quote characters from the CSV pronunciation field for display in the results table.

### `init()`

Alpine lifecycle hook. Calling `this.start()` matches the old `DOMContentLoaded` behavior: sample CSV is parsed and the first prompt appears immediately.

---

## HTML directives

Root:

```html
<div x-data="vocabApp()">
```

### Two-way binding

```html
<textarea x-model="csv" …></textarea>
<input x-model="enteredWord" …>
```

`x-model` syncs property ↔ control. No separate `value` reads or `input` listeners.

### Events

```html
<button @click="start()">Start</button>
<button @click="submit()">Next word</button>
<button @click="submit(true)">Skip</button>
<input @keydown.enter.prevent="submit()">
```

`@keydown.enter.prevent` is Alpine’s shorthand for Enter + `preventDefault` (replaces checking `e.which == 13`).

### Conditional UI

```html
<div class="word-app" x-show="started && !finished">…</div>
<div class="word-result" x-show="finished">…</div>
```

Quiz and results are not swapped by string HTML; both exist in the template, Alpine toggles display from flags.

### Text and attributes

```html
<div class="word-progress" :style="`width: ${progress}%`"></div>
<div class="word-translation" x-text="current ? (index + 1) + '. ' + current.translation : ''"></div>
<div class="word-def" x-text="current?.definition || ''"></div>
<h2 x-text="`Your result is ${score} of ${words.length}`"></h2>
```

`x-text` sets text content (safer than `innerHTML`). `:style` is shorthand for `x-bind:style`.

### Results list

```html
<template x-for="(word, i) in words" :key="i">
    <tr :class="{ valid: word.valid }">
        <td x-text="(i + 1) + '.'"></td>
        <td class="word-enetered" x-text="word.entered"></td>
        …

```

`:class="{ valid: word.valid }"` adds the existing CSS class `valid` when the answer was correct (same styling as before). `template` + `x-for` is the Alpine 3 pattern for repeating table rows without injecting HTML strings.

---

## Vanilla → Alpine mapping

| Old code | Alpine equivalent |
|----------|-------------------|
| `textarea.value` | `x-model="csv"` / `this.csv` |
| `wordInput.value` | `x-model="enteredWord"` |
| `wordTranslation.innerHTML = …` | `x-text` on `.word-translation` |
| `wordDef.innerHTML = …` | `x-text` on `.word-def` |
| `wordProgress.style.width = …` | `:style` bound to `progress` |
| `wordApp.style.display = 'none'` | `x-show="started && !finished"` |
| `wordResult.innerHTML = resHTML` | `x-show="finished"` + `x-for` table |
| `button.addEventListener('click', …)` | `@click="submit()"` |
| `keyup` + `e.which == 13` | `@keydown.enter.prevent="submit()"` |
| `updateWordsArray` + shuffle | `start()` |
| `nextWord` | `submit()` / `submit(true)` |
| Globals `start`, `score`, `newArray` | `index`, `score`, `words` on the component |

---

## Quiz flow (state machine)

```text
                    init() / Start
                           │
                           ▼
              ┌── started=true, finished=false
              │   show quiz, current word
              │
              │   submit() / submit(true)
              │        │
              │        ├─ more words → index++
              │        │
              │        └─ last word → finished=true
              │                           │
              │                           ▼
              │              show results table
              │
              └── Start again resets flags and reshuffles
```

All branches are ordinary assignments; Alpine re-renders from those flags.

---

## What did not change

- **Scoring rules** — case-insensitive trim; skip counts as wrong (`-`).
- **CSV format** — `en;translation;definition;pronunciations` via PapaParse.
- **Shuffle** — Fisher–Yates before each run.
- **Visual design** — same class names and `main.css` (including `.valid` row styling and the typo class `word-enetered`).
- **Usage copy** in the sidebar (spreadsheet / `CONCATENATE` instructions).

---

## Design choices

1. **CDN Alpine, no build step** — fits a small static quiz; edit HTML/JS and refresh.
2. **Factory function instead of inline `x-data="{…}"`** — keeps HTML readable and logic testable in one place.
3. **Declarative results** — no HTML string templates for the scoreboard; rows are data-driven.
4. **Flags for screens** — `started` / `finished` instead of imperative `display` toggling.
5. **PapaParse retained** — quoted definition fields with punctuation are awkward for a hand-rolled splitter; the CDN cost is small.

---

## Extending the app

Examples that stay idiomatic in this setup:

- Add a **Restart** button: `@click="start()"`.
- Show remaining count: `x-text="(index + 1) + ' / ' + words.length"`.
- Persist last CSV: read/write `localStorage` in `start()` / `init()`.
- Drop PapaParse: replace `parseCsv` with a custom semicolon parser if the CSV subset stays simple.

New UI almost always means new state (or a getter) plus a directive—not a new `getElementById` path.
