import { requestUrl } from "obsidian";
import { ResourceUri } from "@atcute/lexicons";
import { ActorIdentifier, isActorIdentifier, isDid, parseResourceUri } from "@atcute/lexicons/syntax";
import { resolveActor } from "lib/identity";

const imageCache = new Map<string, string>();

function isValidUrl(url: string): boolean {
	try {
		const u = new URL(url);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
}

export async function fetchOgImage(url: string): Promise<string | undefined> {
	if (imageCache.has(url)) {
		return imageCache.get(url) || undefined;
	}
	if (!isValidUrl(url)) {
		return undefined;
	}

	try {
		const res = await requestUrl({ url, method: "GET" });
		const match = res.text.match(
			/<meta[^>]+(?:property="og:image"|name="twitter:image")[^>]+content="([^"]+)"/i
		) || res.text.match(
			/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:image"|name="twitter:image")/i
		);
		imageCache.set(url, match?.[1] ?? "");
		return match?.[1];
	} catch {
		return undefined;
	}
}

export const BSKY_POST_RE = /https:\/\/bsky\.app\/profile\/([^/?#]+)\/post\/([A-Za-z0-9]+)/;

export function bskyPostATUri(url: string): ResourceUri | null {
	const match = url.match(BSKY_POST_RE);
	if (!match) return null;

	const [, handleOrDid, rkey] = match;
	if (!handleOrDid || !rkey) return null;

	return `at://${handleOrDid}/app.bsky.feed.post/${rkey}`
}

export function UrlToRecordUri(url: string): ResourceUri | null {
	// Already an AT URI with a record key
	const parsed = parseResourceUri(url);
	if (parsed.ok && parsed.value.rkey) {
		return url as ResourceUri;
	}

	// bsky.app post URL
	const match = url.match(BSKY_POST_RE);
	if (!match) return null;

	const [, handleOrDid, rkey] = match;
	if (!handleOrDid || !rkey) return null;

	return `at://${handleOrDid}/app.bsky.feed.post/${rkey}` as ResourceUri;
}

/**
 * Given an AT URI that may contain a handle, resolve the handle to a DID
 * and return the canonical AT URI
 */
export async function resolveHandleInAtUri(uri: ResourceUri): Promise<ResourceUri| null> {
	const parsed = parseResourceUri(uri);
	if (!parsed.ok) return uri;

	const { repo, collection, rkey } = parsed.value;
	if (isDid(repo)) return uri;

	try {
		const actor = await resolveActor(repo as ActorIdentifier);
		if (collection && rkey) {
			return `at://${actor.did}/${collection}/${rkey}` as ResourceUri;
		}
		return `at://${actor.did}` as ResourceUri;
	} catch {
		return null;
	}
}

export function UrlToActorIdentifier(url: string): ActorIdentifier | null {
	const parsed = parseResourceUri(url);
	if (parsed.ok) {
		return parsed.value.repo
	}
	if (isActorIdentifier(url)) {
		return url;
	}
	const profileMatch = url.match(BSKY_PROFILE_RE);
	if (!profileMatch) return null;

	const [, handleOrDid] = profileMatch;
	if (isActorIdentifier(handleOrDid)) {
		return handleOrDid;
	}
	return null;
}

