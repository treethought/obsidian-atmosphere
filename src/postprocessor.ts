import { Component, MarkdownPostProcessorContext, setIcon } from "obsidian";
import { BSKY_POST_RE, bskyPostATUri } from "lib";


export class BlueskyPostProcessor extends Component {

	async process(el: HTMLElement, _ctx: MarkdownPostProcessorContext) {

		if (!customElements.get("bluesky-post")) {
			import("bluesky-post-embed");
		}

		const links = el.findAll("a").filter(link => {
			const href = link.getAttribute("href") ?? "";
			return BSKY_POST_RE.test(href);
		});

		if (links.length === 0) return;

		for (const link of links) {
			const atUri = bskyPostATUri(link.getAttribute("href") ?? "");
			if (!atUri) continue;

			this.attachToggle(link, atUri);
		}
	}

	private attachToggle(link: HTMLElement, uri: string) {
		const embedId = `bsky-embed-${uri.replace(/[:\/]/g, "-")}`;

		const btn = document.createElement("button");
		btn.setAttribute("aria-label", "Toggle post embed");
		btn.addClass("bsky-embed-toggle");
		setIcon(btn, "message-circle");

		link.insertAdjacentElement("afterend", btn);

		btn.addEventListener("click", () => {
			const existing = document.getElementById(embedId);
			if (existing) {
				existing.remove();
				setIcon(btn, "message-circle");
				return;
			}

			const embedEl = document.createElement("bluesky-post") as HTMLElement;
			embedEl.id = embedId;
			embedEl.setAttribute("src", uri);
			embedEl.setAttribute("allow-unauthenticated", "");
			embedEl.addClass("bsky-post-embed-wrapper");

			btn.insertAdjacentElement("afterend", embedEl);
			setIcon(btn, "x");
		});
	}
}
