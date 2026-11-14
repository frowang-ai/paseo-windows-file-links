import type { PluginClientContext } from "@getpaseo/plugin/client";
import { CorrectedMessage, correctedMessageSchema } from "./client/corrected-message";
import { normalizeWindowsFileLinks } from "./client/normalize-links";

export default function contribute(client: PluginClientContext) {
  const removeRenderer = client.addTimelineRenderer({
    kind: "windows-file-links",
    version: 1,
    schema: correctedMessageSchema,
    Component: CorrectedMessage,
  });
  const removeTransformer = client.addTimelineTransformer({
    id: "windows-file-links",
    query: { itemType: "assistant_message" },
    transform({ item, phase }) {
      const text = normalizeWindowsFileLinks(item.text);
      if (text === item.text) return undefined;
      return {
        items: [{ type: "plugin", kind: "windows-file-links", version: 1, data: { text, phase } }],
      };
    },
  });
  return () => {
    removeTransformer();
    removeRenderer();
  };
}
