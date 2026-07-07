/**
 * Timestamp Footer Extension
 *
 * Shows "last response X ago" in the footer, updating every second.
 * Helps you see if your agent is stuck.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	let lastResponseTime: number | null = null;
	let timer: ReturnType<typeof setInterval> | null = null;

	function formatAgo(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ${seconds % 60}s ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ${minutes % 60}m ago`;
	}

	function updateStatus(ctx: {
		ui: {
			setStatus: (key: string, value: string | undefined) => void;
			theme: { fg: (color: string, text: string) => string };
		};
	}) {
		const theme = ctx.ui.theme;
		if (lastResponseTime === null) {
			ctx.ui.setStatus("timestamp", theme.fg("dim", "⏱ waiting..."));
			return;
		}
		const elapsed = Date.now() - lastResponseTime;
		const ago = formatAgo(elapsed);
		// Color changes based on how long it's been
		const color =
			elapsed < 30_000 ? "success" : elapsed < 120_000 ? "warning" : "error";
		ctx.ui.setStatus("timestamp", theme.fg("dim", "⏱ ") + theme.fg(color, ago));
	}

	pi.on("session_start", async (_event, ctx) => {
		lastResponseTime = Date.now();
		updateStatus(ctx);

		// Update every second
		timer = setInterval(() => updateStatus(ctx), 1000);
	});

	pi.on("message_end", async (event, ctx) => {
		if (event.message.role === "assistant") {
			lastResponseTime = Date.now();
			updateStatus(ctx);
		}
	});

	// Reset when user sends a message
	pi.on("agent_start", async (_event, ctx) => {
		lastResponseTime = Date.now();
		updateStatus(ctx);
	});

	// Reset on tool calls too — agent is actively working
	pi.on("tool_execution_start", async (_event, ctx) => {
		lastResponseTime = Date.now();
		updateStatus(ctx);
	});

	pi.on("session_shutdown", async () => {
		if (timer) clearInterval(timer);
	});
}
