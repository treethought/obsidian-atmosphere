import { ItemView, WorkspaceLeaf } from "obsidian";
import type MyPlugin from "../main";
import { getCollections } from "../lib";
import type { Main as Collection } from "../lexicons/types/network/cosmik/collection";

export const VIEW_TYPE_SEMBLE_COLLECTIONS = "semble-collections-view";

interface CollectionRecord {
	uri: string;
	value: Collection;
}

export class SembleCollectionsView extends ItemView {
	plugin: MyPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_SEMBLE_COLLECTIONS;
	}

	getDisplayText() {
		return "Semble Collections";
	}

	getIcon() {
		return "layout-grid";
	}

	async onOpen() {
		await this.render();
	}

	async render() {
		const container = this.contentEl;
		container.empty();
		container.addClass("semble-collections-view");

		container.createEl("h4", { text: "Collections" });

	}

	async onClose() {}
}
