Windows File Link Fix repairs Windows file links in AI replies when an extra slash appears before the drive letter. A link to `/C:/project/report.html` is displayed with the destination `C:/project/report.html`, so Paseo can open the file using its normal file handling.

It handles Markdown links, reference definitions, and image destinations in existing assistant messages and streaming replies. Link text, Unicode characters, space encoding, line references, and surrounding Markdown are preserved. Original chat history is unchanged.

Completed corrected messages include a **复制此条回复** (Copy this reply) button. It copies the entire message as Markdown with corrected links, reports success or failure, and remains available in compact layouts. Use this button when Paseo's built-in Copy turn omits a plugin-rendered reply. It copies this message only, without earlier progress messages or an HTML clipboard representation.

Requires Paseo 0.13.2 or later. Install on a Windows daemon with npm on its PATH. Installation downloads the Markdown parser dependencies pinned in the lockfile. The plugin runs in the client, has no backend, and sends no message contents to external services.

Normal WSL and Linux paths are left unchanged. This plugin does not translate Windows paths into WSL mount paths or detect the daemon's operating system. Bare paths, inline code, code blocks, user messages, and tool output are not rewritten. Another plugin that replaces the same assistant message may prevent the fix from applying.
