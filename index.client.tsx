import type {
  PluginClientContext,
  PluginTimelineItemProps,
} from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import { Markdown } from "@getpaseo/plugin/client/ui";
import { z } from "zod";
import { normalizeWindowsFileLinks } from "./client/normalize-links";

const schema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

function CorrectedMessage({ item }: PluginTimelineItemProps<z.infer<typeof schema>>) {
  const text = useRevealedText(item.data.text, item.data.phase);
  return <Markdown>{text}</Markdown>;
}

export default function contribute(client: PluginClientContext) {
  const removeRenderer = client.addTimelineRenderer({
    kind: "windows-file-links",
    version: 1,
    schema,
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
