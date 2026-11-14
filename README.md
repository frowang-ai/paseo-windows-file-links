# Windows File Link Fix

A Paseo plugin that fixes Windows file links with an extra slash before the drive letter in AI replies.

Some replies link to `/C:/project/report.html` instead of `C:/project/report.html`. Paseo 0.13.2 preserves that extra slash when resolving the path, so the file may fail to open. This plugin removes it from Markdown link destinations and lets Paseo handle the file normally.

```markdown
Before: [Open report](/C:/project/report.html)
After:  [Open report](C:/project/report.html)
```

## Install

Enable plugins in Paseo, then install on the Windows daemon that owns your workspace:

```sh
paseo plugin add git:frowang-ai/paseo-windows-file-links
```

Requires Paseo **0.13.2 or later**, with npm available on the daemon's PATH. Installation runs `npm ci --omit=dev --ignore-scripts` to install the Markdown parser from the committed lockfile. No API keys or other settings are needed.

The display name is **Windows File Link Fix**; the runtime ID is `windows-file-links`. Existing assistant messages and new streaming replies are processed automatically. Completed replies handled by the plugin have a **复制此条回复** (Copy this reply) button below their text.

```sh
paseo plugin disable windows-file-links
paseo plugin enable windows-file-links
```

## What changes

Only a link destination beginning with `/`, a drive letter, `:`, and a slash or backslash is changed. Exactly one leading slash is removed.

| Link destination | Result |
| --- | --- |
| `/C:/project/report.html` | `C:/project/report.html` |
| `/D:/project/main.ts:42` | `D:/project/main.ts:42` |
| `/C:/My%20Files/report.html` | `C:/My%20Files/report.html` |
| `C:/project/report.html` | Unchanged |
| `/mnt/c/project/report.html` | Unchanged |
| `/home/user/project/report.html` | Unchanged |
| `https://example.com/C:/report.html` | Unchanged |

Inline Markdown links, reference definitions, image destinations, and angle-bracket destinations containing spaces are supported. Link labels, titles, Unicode characters, percent encoding, line references, and the rest of the Markdown source are preserved.

Prose, inline code, fenced code blocks, bare paths, user messages, and tool output are not rewritten. Original chat history remains unchanged.

## Copy a corrected reply

Use **复制此条回复** below a completed corrected message to copy that message's entire Markdown source, including its corrected file links. The button waits for the clipboard write before showing success, prevents duplicate writes while pending, and reports failures so you can retry or select the text manually. It appears after the message finishes and works on desktop and compact layouts.

Paseo's built-in **Copy turn** currently omits messages replaced by a timeline plugin. The added button copies the corrected message directly; it does not change the built-in button or combine earlier progress messages and other turns. It copies Markdown text, without an HTML clipboard representation.

## Windows and WSL

This is a Windows path compatibility fix, not a Windows-to-WSL path converter. Normal WSL paths such as `/mnt/c/...` and `/home/...` are left alone. A WSL daemon cannot necessarily open `C:/...`; converting a drive path to its Linux mount path is outside this plugin's scope.

The matcher checks the path format, not the daemon's operating system. Install it on Windows-backed daemons; a WSL-only setup normally does not need it.

## How it works

The plugin uses Paseo's `addTimelineTransformer` to handle assistant messages containing affected links. micromark identifies the link destinations and their source offsets, so the plugin can remove the slash without reformatting the document. Paseo's `Markdown` component and `useRevealedText` provide rendering, file opening, and paced streaming.

This is a client-only plugin. It has no backend and makes no network requests at runtime. Dependency downloads happen during installation. It uses Paseo's cross-platform components without DOM interception.

Another plugin that replaces the same assistant message may prevent this transformer from handling it. You can disable this plugin if a future Paseo version adds native support for these paths.

## Development

```sh
git clone https://github.com/frowang-ai/paseo-windows-file-links.git
cd paseo-windows-file-links
npm ci --ignore-scripts
npm run typecheck
paseo plugin install /absolute/path/to/paseo-windows-file-links
```

After source changes:

```sh
npm run typecheck
paseo plugin reload windows-file-links
paseo plugin ls
```

The path-normalization checks cover 25 parser cases and 35 streaming prefixes, originally validated with plugin loading on Paseo 0.13.2.

The copy button was typechecked and loaded on Paseo 0.15.4. An isolated browser probe used the real plugin registration, transformer, renderer, and React Native Web with adapters for Paseo's UI services. It verified the complete 30,037-character Markdown payload while only 79 characters were displayed, corrected links, pending-write deduplication, rejected-write feedback and retry, hiding the button during streaming, and light/wide plus dark/360px layouts. Successful writes used the browser clipboard API. Clipboard readback permission was unavailable; native mobile interaction and the full signed-in desktop chat were not re-tested.

## License

MIT. See [LICENSE](LICENSE).
