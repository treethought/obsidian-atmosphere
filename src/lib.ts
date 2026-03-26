import { Record } from "@atcute/atproto/types/repo/listRecords";

export { getRecord, deleteRecord, putRecord } from "./lib/atproto";

export const BSKY_POST_RE = /https:\/\/bsky\.app\/profile\/([^/?#]+)\/post\/([A-Za-z0-9]+)/;

export function bskyPostATUri(url: string): string | null {
	const match = url.match(BSKY_POST_RE);
	if (!match) return null;

	const [, handleOrDid, rkey] = match;
	if (!handleOrDid || !rkey) return null;

	return `at://${handleOrDid}/app.bsky.feed.post/${rkey}`;
}

export {
	getSembleCollections,
	createSembleCollection,
	getSembleCards,
	createSembleNote,
	createSembleUrlCard,
	getSembleCollectionLinks,
	createSembleCollectionLink,
} from "./lib/bookmarks/cosmik";

export { getBookmarks, createBookmark, getTags, createTag } from "./lib/bookmarks/community";

export {
	getMarginBookmarks,
	createMarginBookmark,
	getMarginCollections,
	getMarginCollectionItems,
	createMarginCollection,
	createMarginCollectionItem,
} from "./lib/bookmarks/margin";

export {
	getPublicationDocuments,
	createDocument,
	putDocument,
	getPublication,
	getPublications,
	getSubscribedPublications,
	createPublication,
	buildDocumentUrl
} from "./lib/standardsite";

export {
	stripMarkdown,
	markdownToLeafletContent,
	markdownToPcktContent,
	resolveWikilinks,
} from "./lib/markdown";

export type ATRecord<T> = Record & { value: T };
