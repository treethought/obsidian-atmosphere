import { Modal, Notice } from "obsidian";
import type { Record } from "@atcute/atproto/types/repo/listRecords";
import type { Main as Bookmark } from "../lexicons/types/community/lexicon/bookmarks/bookmark";
import type ATmarkPlugin from "../main";
import { putRecord, deleteRecord } from "../lib";

type BookmarkRecord = Record & { value: Bookmark };

export class EditBookmarkModal extends Modal {
	plugin: ATmarkPlugin;
	record: BookmarkRecord;
	onSuccess?: () => void;
	tagInputs: HTMLInputElement[] = [];

	constructor(plugin: ATmarkPlugin, record: BookmarkRecord, onSuccess?: () => void) {
		super(plugin.app);
		this.plugin = plugin;
		this.record = record;
		this.onSuccess = onSuccess;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("atmark-modal");

		contentEl.createEl("h2", { text: "Edit bookmark tags" });

		if (!this.plugin.client) {
			contentEl.createEl("p", { text: "Not connected." });
			return;
		}

		const existingTags = this.record.value.tags || [];

		const form = contentEl.createEl("div", { cls: "atmark-form" });

		// Tags section
		const tagsGroup = form.createEl("div", { cls: "atmark-form-group" });
		tagsGroup.createEl("label", { text: "Tags" });

		const tagsContainer = tagsGroup.createEl("div", { cls: "atmark-tags-container" });

		// Render existing tags
		for (const tag of existingTags) {
			this.addTagInput(tagsContainer, tag);
		}

		// Add empty input for new tag
		this.addTagInput(tagsContainer, "");

		// Add tag button
		const addTagBtn = tagsGroup.createEl("button", {
			text: "Add tag",
			cls: "atmark-btn atmark-btn-secondary"
		});
		addTagBtn.addEventListener("click", (e) => {
			e.preventDefault();
			this.addTagInput(tagsContainer, "");
		});

		// Action buttons
		const actions = contentEl.createEl("div", { cls: "atmark-modal-actions" });

		const deleteBtn = actions.createEl("button", {
			text: "Delete",
			cls: "atmark-btn atmark-btn-danger"
		});
		deleteBtn.addEventListener("click", () => { this.confirmDelete(contentEl); });

		actions.createEl("div", { cls: "atmark-spacer" });

		const cancelBtn = actions.createEl("button", {
			text: "Cancel",
			cls: "atmark-btn atmark-btn-secondary"
		});
		cancelBtn.addEventListener("click", () => { this.close(); });

		const saveBtn = actions.createEl("button", {
			text: "Save",
			cls: "atmark-btn atmark-btn-primary"
		});
		saveBtn.addEventListener("click", () => { void this.saveChanges(); });
	}

	private addTagInput(container: HTMLElement, value: string) {
		const tagRow = container.createEl("div", { cls: "atmark-tag-row" });

		const input = tagRow.createEl("input", {
			type: "text",
			cls: "atmark-input",
			value,
			attr: { placeholder: "Enter tag..." }
		});
		this.tagInputs.push(input);

		const removeBtn = tagRow.createEl("button", {
			text: "×",
			cls: "atmark-btn atmark-btn-secondary atmark-tag-remove-btn"
		});
		removeBtn.addEventListener("click", (e) => {
			e.preventDefault();
			tagRow.remove();
			this.tagInputs = this.tagInputs.filter(i => i !== input);
		});
	}

	private confirmDelete(contentEl: HTMLElement) {
		contentEl.empty();
		contentEl.createEl("h2", { text: "Delete bookmark" });
		contentEl.createEl("p", { text: "Delete this bookmark?", cls: "atmark-warning-text" });

		const actions = contentEl.createEl("div", { cls: "atmark-modal-actions" });

		const cancelBtn = actions.createEl("button", {
			text: "Cancel",
			cls: "atmark-btn atmark-btn-secondary"
		});
		cancelBtn.addEventListener("click", () => {
			void this.onOpen();
		});

		const confirmBtn = actions.createEl("button", {
			text: "Delete",
			cls: "atmark-btn atmark-btn-danger"
		});
		confirmBtn.addEventListener("click", () => { void this.deleteBookmark(); });
	}

	private async deleteBookmark() {
		if (!this.plugin.client) return;

		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("p", { text: "Deleting bookmark..." });

		try {
			const rkey = this.record.uri.split("/").pop();
			if (!rkey) {
				contentEl.empty();
				contentEl.createEl("p", { text: "Invalid bookmark uri.", cls: "atmark-error" });
				return;
			}

			await deleteRecord(
				this.plugin.client,
				this.plugin.settings.identifier,
				"community.lexicon.bookmarks.bookmark",
				rkey
			);

			new Notice("Bookmark deleted");
			this.close();
			this.onSuccess?.();
		} catch (err) {
			contentEl.empty();
			const message = err instanceof Error ? err.message : String(err);
			contentEl.createEl("p", { text: `Failed to delete: ${message}`, cls: "atmark-error" });
		}
	}

	private async saveChanges() {
		if (!this.plugin.client) return;

		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("p", { text: "Saving changes..." });

		try {
			// Get non-empty unique tags
			const tags = [...new Set(
				this.tagInputs
					.map(input => input.value.trim())
					.filter(tag => tag.length > 0)
			)];

			const rkey = this.record.uri.split("/").pop();
			if (!rkey) {
				contentEl.empty();
				contentEl.createEl("p", { text: "Invalid bookmark uri.", cls: "atmark-error" });
				return;
			}

			// Update the record with new tags
			const updatedRecord: Bookmark = {
				...this.record.value,
				tags,
			};

			await putRecord(
				this.plugin.client,
				this.plugin.settings.identifier,
				"community.lexicon.bookmarks.bookmark",
				rkey,
				updatedRecord
			);

			new Notice("Tags updated");
			this.close();
			this.onSuccess?.();
		} catch (err) {
			contentEl.empty();
			const message = err instanceof Error ? err.message : String(err);
			contentEl.createEl("p", { text: `Failed to save: ${message}`, cls: "atmark-error" });
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
