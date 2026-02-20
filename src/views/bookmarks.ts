import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type AtmospherePlugin from "../main";
import { CardDetailModal } from "../components/cardDetailModal";
import { CreateCollectionModal } from "../components/createCollectionModal";
import { CreateMarginCollectionModal } from "../components/createMarginCollectionModal";
import { CreateTagModal } from "../components/createTagModal";
import type { ATBookmarkItem, DataSource, SourceFilter } from "../sources/types";
import { SembleSource } from "../sources/semble";
import { BookmarkSource } from "../sources/bookmark";
import { MarginSource } from "../sources/margin";
import { renderLoginMessage } from "components/loginMessage";

export const VIEW_TYPE_ATMOSPHERE_BOOKMARKS = "atmosphere-bookmarks";

type SourceType = "semble" | "bookmark" | "margin";

export class AtmosphereView extends ItemView {
	plugin: AtmospherePlugin;
	activeSources: Set<SourceType> = new Set(["semble"]);
	sources: Map<SourceType, { source: DataSource; filters: Map<string, SourceFilter> }> = new Map();

	constructor(leaf: WorkspaceLeaf, plugin: AtmospherePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	initSources() {
		if (this.plugin.settings.did) {
			const repo = this.plugin.settings.did;
			this.sources.set("semble", {
				source: new SembleSource(this.plugin.client, repo),
				filters: new Map()
			});
			this.sources.set("bookmark", {
				source: new BookmarkSource(this.plugin.client, repo),
				filters: new Map()
			});
			this.sources.set("margin", {
				source: new MarginSource(this.plugin.client, repo),
				filters: new Map()
			});
		}

	}

	getViewType() {
		return VIEW_TYPE_ATMOSPHERE_BOOKMARKS;
	}

	getDisplayText() {
		return "Atmosphere bookmarks";
	}

	getIcon() {
		return "layers";
	}

	async onOpen() {
		this.initSources();
		await this.render();
	}

	async fetchItems(): Promise<ATBookmarkItem[]> {
		const results = await Promise.all(
			Array.from(this.activeSources).map(async (sourceType) => {
				const sourceData = this.sources.get(sourceType);
				if (!sourceData) return [];
				const filters = Array.from(sourceData.filters.values());
				return await sourceData.source.fetchItems(filters, this.plugin);
			})
		);
		return results.flat().sort((a, b) =>
			new Date(b.getCreatedAt()).getTime() - new Date(a.getCreatedAt()).getTime()
		);
	}

	async render() {
		const container = this.contentEl;
		container.empty();
		container.addClass("atmosphere-view");


		if (!await this.plugin.checkAuth()) {
			renderLoginMessage(container)
			return
		}

		this.renderHeader(container);

		const loading = container.createEl("p", { text: "Loading..." });

		try {
			const items = await this.fetchItems();
			loading.remove();


			if (items.length === 0) {
				container.createEl("p", { text: "No items found." });
				return;
			}

			const grid = container.createEl("div", { cls: "atmosphere-grid" });
			for (const item of items) {
				try {
					this.renderItem(grid, item);
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					console.error(`Failed to render item ${item.getUri()}: ${message}`);
				}
			}
		} catch (err) {
			loading.remove();
			const message = err instanceof Error ? err.message : String(err);
			container.createEl("p", { text: `Failed to load: ${message}`, cls: "atmosphere-error" });
		}
	}

	private async refresh() {
		this.plugin.client.clearCache();
		await this.render();

	}

	private renderHeader(container: HTMLElement) {
		const header = container.createEl("div", { cls: "atmosphere-header" });

		const topRow = header.createEl("div", { cls: "atmosphere-header-top-row" });

		const sourceSelector = topRow.createEl("div", { cls: "atmosphere-source-selector" });
		const sources: SourceType[] = ["semble", "margin", "bookmark"];

		for (const source of sources) {
			const label = sourceSelector.createEl("label", { cls: "atmosphere-source-option" });

			const checkbox = label.createEl("input", {
				type: "checkbox",
				cls: "atmosphere-source-toggle",
			});
			checkbox.checked = this.activeSources.has(source);
			checkbox.addEventListener("change", () => {
				if (checkbox.checked) {
					this.activeSources.add(source);
				} else {
					this.activeSources.delete(source);
				}
				void this.render();
			});

			label.createEl("span", {
				text: source.charAt(0).toUpperCase() + source.slice(1),
				cls: "atmosphere-source-text",
			});
		}

		const refreshBtn = topRow.createEl("button", {
			cls: "atmosphere-refresh-btn",
			attr: { "aria-label": "Refresh bookmarks" }
		});
		setIcon(refreshBtn, "refresh-cw");
		refreshBtn.addEventListener("click", () => {
			refreshBtn.addClass("atmosphere-refresh-btn-spinning");
			void this.refresh();
			refreshBtn.removeClass("atmosphere-refresh-btn-spinning");
		});

		this.renderFilters(container);
	}

	private renderFilters(container: HTMLElement) {
		const filtersEl = container.createEl("div", { cls: "atmosphere-filters" });

		const collectionSources = (["semble", "margin"] as SourceType[]).filter(s => this.activeSources.has(s));
		if (collectionSources.length > 0) {
			this.renderCollectionsFilter(filtersEl, collectionSources);
		}

		const tagSources = (["margin", "bookmark"] as SourceType[]).filter(s => this.activeSources.has(s));
		if (tagSources.length > 0) {
			this.renderTagsFilter(filtersEl, tagSources);
		}
	}

	private renderCollectionsFilter(container: HTMLElement, collectionSources: SourceType[]) {
		const section = container.createEl("div", { cls: "atmosphere-filter-section" });

		const titleRow = section.createEl("div", { cls: "atmosphere-filter-title-row" });
		titleRow.createEl("h3", { text: "Collections", cls: "atmosphere-filter-title" });

		if (collectionSources.includes("semble")) {
			const btn = titleRow.createEl("button", {
				cls: "atmosphere-filter-create-btn",
				attr: { "aria-label": "New Semble collection" },
			});
			setIcon(btn, "plus");
			btn.addEventListener("click", () => new CreateCollectionModal(this.plugin, () => void this.refresh()).open());
		}
		if (collectionSources.includes("margin")) {
			const btn = titleRow.createEl("button", {
				cls: "atmosphere-filter-create-btn",
				attr: { "aria-label": "New Margin collection" },
			});
			setIcon(btn, "plus");
			btn.addEventListener("click", () => new CreateMarginCollectionModal(this.plugin, () => void this.refresh()).open());
		}

		const chips = section.createEl("div", { cls: "atmosphere-filter-chips" });

		const noFilter = collectionSources.every(s => {
			const key = s === "semble" ? "sembleCollection" : "marginCollection";
			return !this.sources.get(s)?.filters.has(key);
		});
		const allChip = chips.createEl("button", {
			text: "All",
			cls: `atmosphere-chip ${noFilter ? "atmosphere-chip-active" : ""}`,
		});
		allChip.addEventListener("click", () => {
			this.sources.get("semble")?.filters.delete("sembleCollection");
			this.sources.get("margin")?.filters.delete("marginCollection");
			void this.render();
		});

		for (const sourceType of collectionSources) {
			const sourceData = this.sources.get(sourceType);
			if (!sourceData?.source.getAvailableCollections) continue;
			void sourceData.source.getAvailableCollections().then(collections => {
				for (const collection of collections) {
					const isActive = sourceData.filters.get(collection.type)?.value === collection.value;
					const chip = chips.createEl("button", {
						text: collection.label ?? collection.value,
						cls: `atmosphere-chip ${isActive ? "atmosphere-chip-active" : ""}`,
					});
					chip.addEventListener("click", () => {
						sourceData.filters.set(collection.type, collection);
						void this.render();
					});
				}
			});
		}
	}

	private renderTagsFilter(container: HTMLElement, tagSources: SourceType[]) {
		const section = container.createEl("div", { cls: "atmosphere-filter-section" });

		const titleRow = section.createEl("div", { cls: "atmosphere-filter-title-row" });
		titleRow.createEl("h3", { text: "Tags", cls: "atmosphere-filter-title" });

		if (tagSources.includes("bookmark")) {
			const btn = titleRow.createEl("button", {
				cls: "atmosphere-filter-create-btn",
				attr: { "aria-label": "New tag" },
			});
			setIcon(btn, "plus");
			btn.addEventListener("click", () => new CreateTagModal(this.plugin, () => void this.refresh()).open());
		}

		const chips = section.createEl("div", { cls: "atmosphere-filter-chips" });

		const noFilter = tagSources.every(s => {
			const key = s === "margin" ? "marginTag" : "bookmarkTag";
			return !this.sources.get(s)?.filters.has(key);
		});
		const allChip = chips.createEl("button", {
			text: "All",
			cls: `atmosphere-chip ${noFilter ? "atmosphere-chip-active" : ""}`,
		});
		allChip.addEventListener("click", () => {
			this.sources.get("margin")?.filters.delete("marginTag");
			this.sources.get("bookmark")?.filters.delete("bookmarkTag");
			void this.render();
		});

		for (const sourceType of tagSources) {
			const sourceData = this.sources.get(sourceType);
			if (!sourceData?.source.getAvilableTags) continue;
			void sourceData.source.getAvilableTags().then(tags => {
				for (const tag of tags) {
					const isActive = sourceData.filters.get(tag.type)?.value === tag.value;
					const chip = chips.createEl("button", {
						text: tag.label ?? tag.value,
						cls: `atmosphere-chip ${isActive ? "atmosphere-chip-active" : ""}`,
					});
					chip.addEventListener("click", () => {
						sourceData.filters.set(tag.type, tag);
						void this.render();
					});
				}
			});
		}
	}

	private renderItem(container: HTMLElement, item: ATBookmarkItem) {
		const el = container.createEl("div", { cls: "atmosphere-item" });

		el.addEventListener("click", (e) => {
			// Don't open detail if clicking the edit button
			if ((e.target as HTMLElement).closest(".atmosphere-item-edit-btn")) {
				return;
			}
			new CardDetailModal(this.plugin, item, () => {
				void this.refresh();
			}).open();
		});

		const header = el.createEl("div", { cls: "atmosphere-item-header" });
		const source = item.getSource();
		header.createEl("span", {
			text: source,
			cls: `atmosphere-badge atmosphere-badge-${source}`,
		});

		if (item.canEdit()) {
			const editBtn = header.createEl("button", {
				cls: "atmosphere-item-edit-btn",
			});
			setIcon(editBtn, "more-vertical");
			editBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				item.openEditModal(() => {
					void this.refresh();
				});
			});
		}

		item.render(el);

		const footer = el.createEl("div", { cls: "atmosphere-item-footer" });
		footer.createEl("span", {
			text: new Date(item.getCreatedAt()).toLocaleDateString(),
			cls: "atmosphere-date",
		});

		// Show note indicator for items with attached notes (semble cards)
		const notes = item.getAttachedNotes?.();
		if (notes && notes.length > 0) {
			const noteIndicator = footer.createEl("div", { cls: "atmosphere-note-indicator" });
			const icon = noteIndicator.createEl("span", { cls: "atmosphere-note-icon" });
			setIcon(icon, "message-square");
			noteIndicator.createEl("span", {
				text: `${notes.length} note${notes.length > 1 ? 's' : ''}`,
				cls: "atmosphere-note-count"
			});
		}
	}

	async onClose() { }
}
