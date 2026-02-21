import { requestUrl } from "obsidian";

const imageCache = new Map<string, string | null>();

export async function fetchOgImage(url: string): Promise<string | undefined> {
	if (imageCache.has(url)) {
		return imageCache.get(url) || undefined;
	}
	try {
		const res = await requestUrl({ url, method: "GET" });
		const match = res.text.match(
			/<meta[^>]+(?:property="og:image"|name="twitter:image")[^>]+content="([^"]+)"/i
		) || res.text.match(
			/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:image"|name="twitter:image")/i
		);
		imageCache.set(url, match?.[1] ?? null);
		return match?.[1];
	} catch (e) {
		return undefined;
	}
}
