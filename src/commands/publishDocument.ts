import { Notice, TFile } from "obsidian";
import type ATmarkPlugin from "../main";
import { createDocument, markdownToLeafletContent, stripMarkdown } from "../lib";
import { SelectPublicationModal } from "../components/selectPublicationModal";
import { type ResourceUri } from "@atcute/lexicons";

export async function publishFileAsDocument(plugin: ATmarkPlugin) {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) {
		new Notice("No active file to publish.");
		return;
	}

	await plugin.initClient();
	if (!plugin.client) {
		new Notice("Not logged in. Check your credentials in settings.");
		return;
	}

	const full = await plugin.app.vault.read(file);

	let fm: { [key: string]: any } | null = null;
	await plugin.app.fileManager.processFrontMatter(file, (fmm) => {
		fm = fmm;
	});
	let content = full.replace(/---\n[\s\S]*?\n---\n/, '').trim();


	let pubUri: string | undefined;
	let documentUri: string | undefined;
	if (fm && fm["atPublication"]) { // TODO settings for property name
		pubUri = fm["atPublication"]
		documentUri = fm["atDocument"]
	}

	if (pubUri) {
		await doPublish(plugin, file, fm, content, pubUri as ResourceUri);
	} else {
		new SelectPublicationModal(plugin, async (selectedUri) => {
			await doPublish(plugin, file, fm, content, selectedUri as ResourceUri);
		}).open();
	}
}

async function doPublish(
	plugin: ATmarkPlugin,
	file: TFile,
	fm: any,
	content: string,
	publicationUri: ResourceUri
) {
	if (!plugin.client) return;

	let textContent = stripMarkdown(content);
	let richContent = markdownToLeafletContent(content)
	console.log(JSON.stringify(richContent, null, 2));

	try {
		let title = fm?.["title"] as string || file.basename

		const description = fm?.description as string | undefined;
		const path = fm?.path as string | undefined;
		const tags = fm?.tags as string[] | undefined;

		const response = await createDocument(
			plugin.client,
			plugin.settings.identifier,
			{
				$type: "site.standard.document",
				title,
				site: publicationUri,
				publishedAt: new Date().toISOString(),
				description,
				path,
				tags,
				textContent,
				content: richContent as any,
			}
		);

		if (!response.ok) {
			new Notice(`Failed to publish: ${response.status}`);
			return;
		}

		const documentUri = response.data.uri;
		new Notice(`Published successfully!`);

		await plugin.app.fileManager.processFrontMatter(file, (fm) => {
			fm["atDocument"] = documentUri;
			fm["atPublication"] = publicationUri;
			fm["atTitle"] = title;
		})

		console.log("Document URI:", documentUri);


	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		new Notice(`Error publishing: ${message}`);
		console.error("Publish error:", error);
	}
}

