import type { App } from "obsidian";

// Matches [[Note]], [[Note|Alias]], [[Note#Heading]], [[Note#Heading|Alias]]
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

function titleToSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

/**
 * Resolves Obsidian wikilinks to standard markdown links.
 *
 * For each [[Note]] or [[Note|Alias]]:
 * - if the linked note has a published `url` in its frontmatter, use it.
 * - Otherwise, return the display text without a link 
*   TODO: return relative url to current note publication?
 */
export function resolveWikilinks(
	markdown: string,
	app: App,
): string {
	return markdown.replace(
		WIKILINK_RE,
		(_match, noteName: string, heading: string | undefined, alias: string | undefined) => {
			const displayText = (alias ?? noteName).trim();
			const name = noteName.trim();

			const files = app.vault.getMarkdownFiles();
			const file = files.find(
				(f) => f.basename === name || f.path === name + ".md"
			);

			let baseUrl: string | undefined;

			if (file) {
				const fm = app.metadataCache.getFileCache(file)?.frontmatter;
				if (!fm?.atDocument || !fm?.url) {
					return displayText;
				}
				baseUrl = fm.url as string;
			}

			// if (!baseUrl && gardenBaseUrl) {
			// 	const base = gardenBaseUrl.replace(/\/$/, "");
			// 	baseUrl = `${base}/notes/${titleToSlug(name)}`;
			// }

			if (!baseUrl) {
				return displayText;
			}

			const url = heading ? `${baseUrl}#${titleToSlug(heading)}` : baseUrl;
			return `[${displayText}](${url})`;
		}
	);
}
