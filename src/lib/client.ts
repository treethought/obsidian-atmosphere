import { CredentialManager, FetchHandlerObject, } from "@atcute/client";
import { resolveActor } from "./identity";
import { isActorIdentifier } from "@atcute/lexicons/syntax";
import { ResolvedActor } from "@atcute/identity-resolver";

const DEFAULT_SERVICE = "https://bsky.social";

export interface Credentials {
	identifier: string;
	password: string;
}

export class Handler implements FetchHandlerObject {
	creds?: Credentials;
	cm: CredentialManager;
	cache: Cache

	constructor(creds?: Credentials) {
		this.creds = creds;
		this.cache = new Cache(5 * 60 * 1000); // 5 minutes TTL
		this.cm = new CredentialManager({ service: DEFAULT_SERVICE, fetch: this.fetch.bind(this) });
	}

	async getActor(identifier: string): Promise<ResolvedActor> {
		const key = `actor:${identifier}`;
		const cached = this.cache.get<ResolvedActor>(key);
		if (cached) {
			return cached;
		}
		if (isActorIdentifier(identifier)) {
			const res = await resolveActor(identifier);
			this.cache.set(key, res);
			return res;
		} else {
			throw new Error("Invalid actor identifier: " + JSON.stringify(identifier));
		}
	}

	async fetch(pathname: string, init: RequestInit): Promise<Response> {
		const url = new URL(pathname, DEFAULT_SERVICE);
		const repo = url.searchParams.get("repo");
		if (!repo) {
			return fetch(url.toString(), init);
		}
		const actor = await this.getActor(repo);
		if (!actor) {
			return fetch(url.toString(), init);
		}
		const fetchUrl = new URL(pathname, actor?.pds)
		return fetch(fetchUrl.toString(), init);
	}

	async getPdsUrl(pathname: string): Promise<URL | null> {
		const url = new URL(pathname, "https://placeholder")
		const repo = url.searchParams.get("repo");
		if (!repo) {
			return null
		}
		const own = (repo === this.cm.session?.handle || repo === this.cm.session?.did);
		if (!own) {
			const actor = await this.getActor(repo!);
			const pds = new URL(pathname, actor.pds);
			return pds
		}
		return null
	}

	async handle(pathname: string, init: RequestInit): Promise<Response> {
		if (this.creds && !this.cm.session?.did) {
			await this.cm.login(this.creds);
			this.getActor(this.creds.identifier)
		}

		const cacheKey = `${init?.method || "GET"}:${pathname}`;
		if (init?.method?.toLowerCase() === "get") {
			const cached = this.cache.get<Response>(cacheKey);
			if (cached) {
				return cached.clone();
			}
		} else {
		}

		let resp: Response;
		const pds = await this.getPdsUrl(pathname);
		if (pds) {
			resp = await fetch(new URL(pathname, pds).toString(), init);
		} else {
			resp = await this.cm.handle(pathname, init);
		}

		if (init?.method?.toLowerCase() === "get" && resp.ok) {
			this.cache.set(cacheKey, resp.clone());
		}
		return resp;
	}
}

class CacheEntry<T> {
	value: T;
	timestamp: number;
	constructor(value: T) {
		this.value = value;
		this.timestamp = Date.now();
	}
}

class Cache {
	#store = new Map<string, CacheEntry<unknown>>();
	#ttl: number;

	constructor(ttlMillis: number) {
		this.#ttl = ttlMillis;
	}

	get<T>(key: string): T | undefined {
		const entry = this.#store.get(key);
		if (entry) {
			if (Date.now() - entry.timestamp < this.#ttl) {
				return entry.value as T;
			} else {
				this.#store.delete(key);
			}
		}
		return undefined;
	}

	set<T>(key: string, value: T): void {
		this.#store.set(key, new CacheEntry(value));
	}
}
