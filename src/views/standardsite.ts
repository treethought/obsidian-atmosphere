import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type ATmarkPlugin from "../main";
import { getPublications } from "../lib";
import type { SiteStandardPublication } from "@atcute/standard-site";

export const VIEW_TYPE_STANDARD_SITE = "standard-site-view";

type PubRecord = {
	uri: string;
	cid: string;
	value: SiteStandardPublication.Main;
};

export class StandardSiteView extends ItemView {
	plugin: ATmarkPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: ATmarkPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_STANDARD_SITE;
	}

	getDisplayText() {
		return "Standard Site";
	}

	getIcon() {
		return "globe";
	}

	async onOpen() {
		await this.render();
	}

	async render() {
		const container = this.contentEl;
		container.empty();
		container.addClass("standard-site-view");

		if (!this.plugin.client) {
			await this.plugin.refreshClient();
			if (!this.plugin.client) {
				container.createEl("p", { text: "Not logged in, check your credentials in settings." });
				return;
			}
		}

		this.renderHeader(container);

		const loading = container.createEl("p", { text: "Loading publications..." });

		try {
			const pubsResp = await getPublications(this.plugin.client, this.plugin.settings.identifier);
			loading.remove();


			const publications = pubsResp.records;

			if (publications.length === 0) {
				container.createEl("p", { text: "No publications found." });
				return;
			}

			const list = container.createEl("div", { cls: "standard-site-list" });
			for (const pub of publications) {
				this.renderPublication(list, pub);
			}
		} catch (err) {
			loading.remove();
			const message = err instanceof Error ? err.message : String(err);
			container.createEl("p", { text: `Failed to load: ${message}`, cls: "standard-site-error" });
		}
	}

	private renderHeader(container: HTMLElement) {
		const header = container.createEl("div", { cls: "standard-site-header" });

		header.createEl("h2", { text: "Publications" });

		const createBtn = header.createEl("button", { cls: "standard-site-create-btn" });
		setIcon(createBtn, "plus");
		createBtn.addEventListener("click", () => {
			// TODO: implement create publication modal
			console.log("Create publication not yet implemented");
		});
	}

	private renderPublication(container: HTMLElement, record: PubRecord) {
		const el = container.createEl("div", { cls: "standard-site-publication" });

		const pub = record.value

		// Header with name and actions
		const header = el.createEl("div", { cls: "standard-site-publication-header" });
		header.createEl("h3", { text: pub.name, cls: "standard-site-publication-name" });

		const actions = header.createEl("div", { cls: "standard-site-publication-actions" });
		const editBtn = actions.createEl("button", { cls: "standard-site-action-btn" });
		setIcon(editBtn, "edit");
		editBtn.addEventListener("click", () => {
			// TODO: implement edit modal
			console.log("Edit publication:", pub.name);
		});

		// Body
		const body = el.createEl("div", { cls: "standard-site-publication-body" });

		// URL
		const urlLine = body.createEl("div", { cls: "standard-site-publication-url" });
		const link = urlLine.createEl("a", { text: pub.url, href: pub.url });
		link.setAttr("target", "_blank");

		// Description
		if (pub.description) {
			body.createEl("p", { text: pub.description, cls: "standard-site-publication-description" });
		}

		// Footer with metadata
		const footer = el.createEl("div", { cls: "standard-site-publication-footer" });

		// AT URI
		const uri = footer.createEl("span", { cls: "standard-site-publication-uri" });
		uri.createEl("span", { text: "URI: ", cls: "standard-site-label" });
		uri.createEl("code", { text: record.uri });

		// Show in discover
		if (pub.preferences?.showInDiscover === false) {
			footer.createEl("span", { text: "Hidden from discover", cls: "standard-site-badge" });
		}
	}

	async onClose() { }
}
