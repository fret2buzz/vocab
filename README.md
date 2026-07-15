# Vocabulary test

Two tools: a Node script that enriches a word list via the Oxford Dictionaries API, and a browser quiz app.

---

## 1. `index.js` — enrich words with definitions

Fetches English definitions and pronunciations from the [Oxford Dictionaries API](https://developer.oxforddictionaries.com/) and writes `words.csv`.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example and edit it:

```bash
cp index.js.example index.js
```

3. In `index.js`, set your Oxford API credentials:

```js
var headers = {
    "app_id": "YOUR_APP_ID",
    "app_key": "YOUR_APP_KEY"
};
```

4. Put your word list in the `words` template string. First line is the header; each following line is `english;translation`:

```js
var words = `
en;translation
scattered;раскиданный
paddle;весло
`;
```

### Run

```bash
node index.js
```

On success you get `words.csv` with columns:

```text
en;translation;definition;pronunciations
```

Paste that file (or its contents) into the quiz app textarea.

> **Note:** `index.js` is gitignored so credentials stay local. Keep using `index.js.example` as the template.

---

## 2. Main app — `dist/index.html`

Browser quiz: you see a translation (and optional definition), type the English word, then get a score and results table.

### Open the app

Serve the `dist` folder (needed so CDN scripts load reliably), for example:

```bash
npx serve dist
```

Or open `dist/index.html` in a browser if your environment allows local file + CDN access.

### Prepare word data

Paste semicolon-separated rows into the sidebar textarea. Header row required:

```text
en;translation;definition;pronunciations
scattered;раскиданный;"occurring or found at intervals...";"ˈskatəd"
paddle;весло;"a short pole with a broad blade...";"ˈpad(ə)l"
```

| Column | Required | Description |
|--------|----------|-------------|
| `en` | yes | English word to type |
| `translation` | yes | Shown as the prompt |
| `definition` | no | Extra hint under the translation |
| `pronunciations` | no | Shown in the results table |

**From a spreadsheet:** put English in column A, translation in B, then in a helper column use e.g. `=CONCATENATE(A1,";",B1)` (add more fields the same way). Copy that column into the textarea, including a header line matching the format above.

You can also paste the contents of `words.csv` produced by `index.js`.

### Take the test

1. Click **Start** (sample words load automatically on first open).
2. Read the translation / definition and type the English word.
3. **Next word** or Enter — check and advance. Empty input is ignored.
4. **Skip** — mark as wrong (`-`) and move on.
5. After the last word, see your score and a full results table (correct rows are unhighlighted; wrong ones are marked).
