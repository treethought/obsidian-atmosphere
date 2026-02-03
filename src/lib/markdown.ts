import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, RootContent } from "mdast";

export function parseMarkdown(markdown: string): Root {
	return unified().use(remarkParse).parse(markdown) as Root;
}

export function extractText(node: any): string {
	if (node.type === "text") {
		return node.value;
	}

	if (node.type === "inlineCode") {
		return node.value;
	}

	if (node.children && Array.isArray(node.children)) {
		return node.children.map(extractText).join("");
	}

	if (node.value) {
		return node.value;
	}

	return "";
}

/**
 * Strip markdown formatting to plain text
 * Used for the textContent field in standard.site documents
 */
export function stripMarkdown(markdown: string): string {
	const tree = parseMarkdown(markdown);

	function extractAllText(node: any): string {
		if (node.type === "text") {
			return node.value;
		}
		if (node.type === "inlineCode") {
			return node.value;
		}
		if (node.children && Array.isArray(node.children)) {
			return node.children.map(extractAllText).join(" ");
		}
		return "";
	}

	return tree.children.map(extractAllText).join("\n\n").trim();
}

export type { Root, RootContent };
