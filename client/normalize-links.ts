import { parse, postprocess, preprocess } from "micromark";

/** Change link destinations only; preserve authored prose, code, and Markdown. */
export function normalizeWindowsFileLinks(markdown: string): string {
  if (!/\/[A-Za-z]:[\\/]/.test(markdown)) return markdown;

  // Token offsets let us remove one slash without reserializing the document.
  // CommonMark parsing excludes code spans, fences, escaped links and HTML.
  const events = postprocess(
    parse().document().write(preprocess()(markdown, "utf8", true)),
  );
  const offsets: number[] = [];
  for (const [kind, token] of events) {
    if (
      kind !== "enter" ||
      (token.type !== "resourceDestinationString" &&
        token.type !== "definitionDestinationString")
    ) continue;

    const start = token.start.offset;
    if (/^\/[A-Za-z]:[\\/]/.test(markdown.slice(start, token.end.offset))) {
      offsets.push(start);
    }
  }
  if (offsets.length === 0) return markdown;

  let previous = 0;
  const pieces: string[] = [];
  for (const offset of offsets.sort((a, b) => a - b)) {
    pieces.push(markdown.slice(previous, offset));
    previous = offset + 1;
  }
  pieces.push(markdown.slice(previous));
  return pieces.join("");
}
