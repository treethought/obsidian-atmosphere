import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, RootContent } from "mdast";
import {
	PubLeafletBlocksUnorderedList,
	PubLeafletContent,
	PubLeafletPagesLinearDocument,
} from "@atcute/leaflet";

/**
 * Convert markdown to leaflet content structure
 */
export function markdownToLeafletContent(markdown: string): PubLeafletContent.Main {
	const blocks = parseMarkdownToBlocks(markdown);

	return {
		$type: "pub.leaflet.content",
		pages: [{
			$type: "pub.leaflet.pages.linearDocument",
			blocks: blocks,
		}]
	};
}

/**
 * Parse markdown into leaflet block structures using remark
 */
export function parseMarkdownToBlocks(markdown: string): PubLeafletPagesLinearDocument.Block[] {
	const tree = unified().use(remarkParse).parse(markdown) as Root;

	const blocks: PubLeafletPagesLinearDocument.Block[] = [];

	for (const node of tree.children) {
		const block = convertNodeToBlock(node);
		if (block) {
			blocks.push(block);
		}
	}

	return blocks;
}

/**
 * Convert a single remark AST node to a Leaflet block wrapper
 */
function convertNodeToBlock(node: RootContent): PubLeafletPagesLinearDocument.Block | null {
	switch (node.type) {
		case "heading":
			return {
				block: {
					$type: "pub.leaflet.blocks.header",
					level: node.depth,
					plaintext: extractText(node),
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		case "paragraph":
			return {
				block: {
					$type: "pub.leaflet.blocks.text",
					plaintext: extractText(node),
					textSize: "default",
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		case "list": {
			const listItems: PubLeafletBlocksUnorderedList.ListItem[] = node.children.map((item) => ({
				$type: "pub.leaflet.blocks.unorderedList#listItem",
				content: {
					$type: "pub.leaflet.blocks.text",
					plaintext: extractText(item),
					textSize: "default",
				},
			}));

			return {
				block: {
					$type: "pub.leaflet.blocks.unorderedList",
					children: listItems,
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};
		}

		case "code":
			return {
				block: {
					$type: "pub.leaflet.blocks.code",
					plaintext: node.value,
					language: node.lang || undefined,
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		case "thematicBreak":
			return {
				block: {
					$type: "pub.leaflet.blocks.horizontalRule",
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		case "blockquote":
			return {
				block: {
					$type: "pub.leaflet.blocks.blockquote",
					plaintext: extractText(node),
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		// Skip HTML, YAML, etc. for now
		default:
			return null;
	}
}

/**
 * Extract plain text from any remark node
 * Recursively walks the tree to get all text content
 */
function extractText(node: any): string {
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
	const tree = unified().use(remarkParse).parse(markdown) as Root;

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
