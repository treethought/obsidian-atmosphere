import { App, Modal, Setting } from "obsidian";
import type ATmarkPlugin from "../main";
import { getPublications } from "../lib";
import { SiteStandardPublication } from "lexicons";

export class SelectPublicationModal extends Modal {
	plugin: ATmarkPlugin;
	onSelect: (publicationUri: string) => void;
	publications: SiteStandardPublication.Main[] = [];

	constructor(plugin: ATmarkPlugin, onSelect: (publicationUri: string) => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.onSelect = onSelect;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("atmark-modal");

		contentEl.createEl("h2", { text: "Select Publication" });

		// Load publications
		if (!this.plugin.client) {
			contentEl.createEl("p", { text: "Not logged in", cls: "atmark-error" });
			return;
		}

		const loading = contentEl.createEl("p", { text: "Loading publications..." });

		try {
			const response = await getPublications(this.plugin.client, this.plugin.settings.identifier);
			loading.remove();

			let pubs = response.records

			if (pubs.length === 0) {
				contentEl.createEl("p", { text: "No publications found. Create one first." });
				return;
			}

			// Create a list of publications
			const listContainer = contentEl.createEl("div", { cls: "atmark-collection-list" });

			for (const pub of pubs) {
				const item = listContainer.createEl("div", { cls: "atmark-collection-item" });
				item.style.cursor = "pointer";

				let val = pub.value as SiteStandardPublication.Main;

				const info = item.createEl("div", { cls: "atmark-collection-item-info" });
				info.createEl("div", { text: val.name, cls: "atmark-collection-item-name" });

				if (pub.value.description) {
					info.createEl("div", {
						text: val.description,
						cls: "atmark-collection-item-desc"
					});
				}

				info.createEl("div", {
					text: val.url,
					cls: "atmark-collection-item-desc"
				});

				item.addEventListener("click", () => {
					this.onSelect(pub.uri);
					this.close();
				});
			}

		} catch (error) {
			loading.remove();
			const message = error instanceof Error ? error.message : String(error);
			contentEl.createEl("p", { text: `Error: ${message}`, cls: "atmark-error" });
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
