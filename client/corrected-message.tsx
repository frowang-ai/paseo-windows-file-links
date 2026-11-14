import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import { copyText, Icon, Markdown, useToast } from "@getpaseo/plugin/client/ui";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

export const correctedMessageSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

export function CorrectedMessage({
  item,
  theme,
  layout,
}: PluginTimelineItemProps<z.infer<typeof correctedMessageSchema>>) {
  const text = useRevealedText(item.data.text, item.data.phase);
  const toast = useToast();
  const pending = useRef(false);
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    if (pending.current || item.data.phase !== "complete") return;
    pending.current = true;
    setCopying(true);
    try {
      // Copy the entire corrected Markdown, even while the display is still revealing text.
      await copyText(item.data.text);
      toast.show("已复制此条完整回复", { variant: "success" });
    } catch {
      toast.error("复制失败，请选择正文手动复制。");
    } finally {
      pending.current = false;
      setCopying(false);
    }
  }

  return (
    <View style={{ alignSelf: "stretch" }}>
      <Markdown>{text}</Markdown>
      {item.data.phase === "complete" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="复制此条回复"
          accessibilityState={{ disabled: copying, busy: copying }}
          disabled={copying}
          onPress={() => void handleCopy()}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            minHeight: layout.compact ? 44 : 32,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: pressed ? theme.colors.surface1 : "transparent",
            opacity: copying ? 0.6 : 1,
          })}
        >
          <Icon name="Copy" size={14} color={theme.colors.foregroundMuted} />
          <Text style={{ color: theme.colors.foregroundMuted, fontSize: 13 }}>
            {copying ? "复制中…" : "复制此条回复"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
