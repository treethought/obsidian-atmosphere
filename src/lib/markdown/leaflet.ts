import type { RootContent, Root, ListItem, List } from "mdast";
import { unified } from "unified";
import remarkStringify from "remark-stringify";
import {
	PubLeafletBlocksUnorderedList,
	PubLeafletBlocksText,
	PubLeafletBlocksHeader,
	PubLeafletContent,
	PubLeafletPagesLinearDocument,
	PubLeafletRichtextFacet,
} from "@atcute/leaflet";
import { parseMarkdown, cleanPlaintext } from "../markdown";


const textEncoder = new TextEncoder();

function byteLength(text: string): number {
	return textEncoder.encode(text).length;
}

function createFacet(
	byteStart: number,
	byteEnd: number,
	features: PubLeafletRichtextFacet.Main["features"]
): PubLeafletRichtextFacet.Main {
	return {
		$type: "pub.leaflet.richtext.facet",
		index: {
			$type: "pub.leaflet.richtext.facet#byteSlice",
			byteStart,
			byteEnd,
		},
		features,
	};
}

function buildTextFromNodes(nodes: RootContent[]): {
	text: string;
	facets: PubLeafletRichtextFacet.Main[];
} {
	let text = "";
	let byteOffset = 0;
	const facets: PubLeafletRichtextFacet.Main[] = [];

	const appendText = (value: string) => {
		if (!value) return;
		text += value;
		byteOffset += byteLength(value);
	};

	const walk = (node: RootContent) => {
		switch (node.type) {
			case "text":
				appendText(node.value);
				return;
			case "inlineCode": {
				const start = byteOffset;
				appendText(node.value);
				const end = byteOffset;
				if (start < end) {
					facets.push(createFacet(start, end, [{ $type: "pub.leaflet.richtext.facet#code" }]));
				}
				return;
			}
			case "strong": {
				const start = byteOffset;
				for (const child of node.children) walk(child);
				const end = byteOffset;
				if (start < end) {
					facets.push(createFacet(start, end, [{ $type: "pub.leaflet.richtext.facet#bold" }]));
				}
				return;
			}
			case "emphasis": {
				const start = byteOffset;
				for (const child of node.children) walk(child);
				const end = byteOffset;
				if (start < end) {
					facets.push(createFacet(start, end, [{ $type: "pub.leaflet.richtext.facet#italic" }]));
				}
				return;
			}
			case "delete": {
				const start = byteOffset;
				for (const child of node.children) walk(child);
				const end = byteOffset;
				if (start < end) {
					facets.push(createFacet(start, end, [{ $type: "pub.leaflet.richtext.facet#strikethrough" }]));
				}
				return;
			}
			case "link": {
				const start = byteOffset;
				for (const child of node.children) walk(child);
				const end = byteOffset;
				if (start < end && node.url) {
					facets.push(createFacet(start, end, [{ $type: "pub.leaflet.richtext.facet#link", uri: node.url }]));
				}
				return;
			}
			case "break":
				appendText("\n");
				return;
			default: {
				if ("children" in node && Array.isArray(node.children)) {
					for (const child of node.children) walk(child);
					return;
				}
				if ("value" in node && typeof node.value === "string") {
					appendText(node.value);
				}
				return;
			}
		}
	};

	for (const node of nodes) walk(node);

	return { text, facets };
}

function buildTextBlock(node: { children?: RootContent[] }): PubLeafletBlocksText.Main & { $type: "pub.leaflet.blocks.text" } {
	const { text, facets } = buildTextFromNodes(node.children ?? []);
	return {
		$type: "pub.leaflet.blocks.text" as const,
		plaintext: text,
		textSize: "default",
		facets: facets.length > 0 ? facets : undefined,
	};
}

export function markdownToLeafletContent(markdown: string): PubLeafletContent.Main {
	const tree = parseMarkdown(markdown);
	const blocks: PubLeafletPagesLinearDocument.Block[] = [];

	for (const node of tree.children) {
		const block = convertNodeToBlock(node);
		if (block) blocks.push(block);
	}

	const record = {
		$type: "pub.leaflet.content",
		pages: [{
			$type: "pub.leaflet.pages.linearDocument",
			blocks,
		}],
	};
	return record as PubLeafletContent.Main;
}

function convertListItem(item: ListItem): PubLeafletBlocksUnorderedList.ListItem {
	const textChildren: RootContent[] = [];
	const nestedLists: RootContent[] = [];

	for (const child of item.children) {
		if (child.type === "list") {
			nestedLists.push(child);
		} else {
			textChildren.push(child);
		}
	}

	// handle text content and nested lists separately
	const result: PubLeafletBlocksUnorderedList.ListItem = {
		$type: "pub.leaflet.blocks.unorderedList#listItem",
		content: buildTextBlock({ children: textChildren }),
	};

	if (nestedLists.length > 0) {
		result.children = nestedLists.flatMap((list) =>
			(list as List).children.map(convertListItem)
		);
	}

	return result;
}

function convertNodeToBlock(node: RootContent): PubLeafletPagesLinearDocument.Block | null {
	switch (node.type) {
		case "heading": {
			const { text, facets } = buildTextFromNodes(node.children);
			return {
				block: {
					$type: "pub.leaflet.blocks.header",
					level: node.depth,
					plaintext: text,
					facets: facets.length > 0 ? facets : undefined,
				} as PubLeafletBlocksHeader.Main,
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			} as PubLeafletPagesLinearDocument.Block;
		}

		case "paragraph":
			return {
				block: buildTextBlock(node),
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			} as PubLeafletPagesLinearDocument.Block;

		case "list": {
			return {
				block: {
					$type: "pub.leaflet.blocks.unorderedList",
					children: node.children.map(convertListItem),
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
				block: { $type: "pub.leaflet.blocks.horizontalRule" },
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};

		case "blockquote": {
			const { text, facets } = buildTextFromNodes(
				node.children.flatMap((c) => ("children" in c ? c.children : []) as RootContent[])
			);
			return {
				block: {
					$type: "pub.leaflet.blocks.blockquote",
					plaintext: text,
					facets: facets.length > 0 ? facets : undefined,
				},
				alignment: "pub.leaflet.pages.linearDocument#textAlignLeft",
			};
		}

		default:
			return null;
	}
}

export function leafletContentToMarkdown(content: PubLeafletContent.Main): string {
	const mdastNodes: RootContent[] = [];

	for (const page of content.pages) {
		if (page.$type !== "pub.leaflet.pages.linearDocument") continue;

		for (const item of page.blocks) {
			const node = leafletBlockToMdast(item.block);
			if (node) mdastNodes.push(node);
		}
	}

	const root: Root = {
		type: "root",
		children: mdastNodes,
	};

	return unified().use(remarkStringify).stringify(root);
}

type LeafletBlockType = PubLeafletPagesLinearDocument.Block["block"];

function leafletBlockToMdast(block: LeafletBlockType): RootContent | null {
	switch (block.$type) {
		case "pub.leaflet.blocks.header":
			return {
				type: "heading",
				depth: block.level as 1 | 2 | 3 | 4 | 5 | 6,
				children: [{ type: "text", value: cleanPlaintext(block.plaintext) }],
			};

		case "pub.leaflet.blocks.text":
			return {
				type: "paragraph",
				children: [{ type: "text", value: cleanPlaintext(block.plaintext) }],
			};

		case "pub.leaflet.blocks.unorderedList":
			return {
				type: "list",
				ordered: false,
				spread: false,
				children: block.children.map((item: PubLeafletBlocksUnorderedList.ListItem) => {
					const plaintext = "plaintext" in item.content ? cleanPlaintext(item.content.plaintext) : "";
					return {
						type: "listItem",
						spread: false,
						children: [{
							type: "paragraph",
							children: [{ type: "text", value: plaintext }],
						}],
					};
				}),
			};

		case "pub.leaflet.blocks.code":
			return {
				type: "code",
				lang: block.language || null,
				meta: null,
				value: block.plaintext,
			};

		case "pub.leaflet.blocks.horizontalRule":
			return { type: "thematicBreak" };

		case "pub.leaflet.blocks.blockquote":
			return {
				type: "blockquote",
				children: [{
					type: "paragraph",
					children: [{ type: "text", value: cleanPlaintext(block.plaintext) }],
				}],
			};

		default:
			return null;
	}
}
