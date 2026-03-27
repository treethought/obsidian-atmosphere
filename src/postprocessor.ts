import { Component, MarkdownPostProcessorContext, setIcon } from "obsidian";
import { BSKY_POST_RE, BSKY_PROFILE_RE, bskyPostATUri, bskyProfileActor } from "./util";

export class BskyEmbedProcessor extends Component {

	async process(el: HTMLElement, _ctx: MarkdownPostProcessorContext) {
		if (!customElements.get("bluesky-post")) {
			await import("bluesky-post-embed");
		}
		if (!customElements.get("bluesky-profile-card")) {
			await import("bluesky-profile-card-embed");
		}

		const links = el.findAll("a").filter(link => {
			const href = link.getAttribute("href") ?? "";
			return BSKY_POST_RE.test(href) || BSKY_PROFILE_RE.test(href);
		});

		if (links.length === 0) return;

		for (const link of links) {
			const postUri = bskyPostATUri(link.getAttribute("href") ?? "");
			if (postUri) {
				this.attachToggle(link, postUri);
				return;
			}
			const actor = bskyProfileActor(link.getAttribute("href") ?? "");
			if (actor) {
				this.attachToggle(link, undefined, actor);
			}
		}
	}

	private attachToggle(link: HTMLElement, uri?: string, actor?: string) {
		const btn = document.createElement("button");
		btn.setAttribute("aria-label", "Toggle post embed");
		btn.addClass("bsky-embed-toggle");
		setIcon(btn, "message-circle");

		link.insertAdjacentElement("afterend", btn);

		btn.addEventListener("click", () => {
			let embedId = "";
			if (uri) {
				embedId = `bsky-post-embed-${uri.replace(/[:/]/g, "-")}`;
			} else if (actor) {
				embedId = `bsky-profile-${actor.replace(/[:/]/g, "-")}`;
			} else {
				return;
			}
			const existing = document.getElementById(embedId);
			if (existing) {
				existing.remove();
				setIcon(btn, "message-circle");
				return;
			}

			let embedEl: HTMLElement;
			if (actor) {
				embedEl = document.createElement("bluesky-profile-card");
				embedEl.setAttribute("actor", actor);
			} else {
				embedEl = document.createElement("bluesky-post");
				embedEl.setAttribute("src", uri!);
			}

			embedEl.id = embedId;
			embedEl.setAttribute("allow-unauthenticated", "");

			btn.insertAdjacentElement("afterend", embedEl);
			setIcon(btn, "x");
		});
	}
}
